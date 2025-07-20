import product from "../models/product.js";
import order from "../models/order.js";
import user from "../models/user.js";
import cart from "../models/cart.js"
import mongoose from "mongoose";

// View Featured Products
export const getFeaturedProducts = async (req, res) => {
  try {
    const productsFeatured = await product.find({ blacklisted: false }).limit(10).populate('seller', 'username');
    res.status(200).json(productsFeatured);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error fetching featured products'});
  }
};

// Search Products
export const searchProducts = async (req, res) => {
  const { q } = req.query;
  
  try {
    const results = await product.find({
      productName: { $regex: q, $options: 'i' },
      blacklisted: false
    }).populate('seller', 'username');
    res.status(200).json(results);
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Search failed'});
  }
};

// View Product Details
export const getProductDetails = async (req, res) => {
  try {
    const getProduct = await product.findById(req.params.id)
      .populate('seller', 'username')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'username' }
      });
    if (!product || product.blacklisted) {
      return res.status(404).json({ message: 'Product not available' });
    }
    res.status(200).json(getProduct);
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Error fetching product details'});
  }
};



export const addToCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const userDoc = await user.findById(userId).populate('carts');

    if (!userDoc.carts) {
      const newCart = await cart.create({
        user: userId,
        items: [{ product: productId, quantity: 1 }]
      });

      userDoc.carts = newCart._id;
      await userDoc.save();

      return res.status(200).json({ message: 'Cart created and product added' });
    }

    const existingCart = await cart.findById(userDoc.carts);

    const productExists = existingCart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!productExists) {
      existingCart.items.push({ product: productId, quantity: 1 });
      await existingCart.save();
    }

    res.status(200).json({ message: 'Product added to cart' });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};



// View Cart
export const getCart = async (req, res) => {
  try {
    const userViewCart = await user.findById(req.user.id).populate('carts');
    res.json(userViewCart.carts);
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Failed to load cart'});
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const currentUser = await user.findById(userId).populate('carts');
    if (!currentUser || !currentUser.carts) {
      return res.status(404).json({ message: 'User or cart not found' });
    }

    const userCart = await cart.findById(currentUser.carts._id);
    if (!userCart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Log the current cart state
    console.log('Before:', userCart.items);

    // Remove product
    const originalLength = userCart.items.length;
    userCart.items = userCart.items.filter(
      item => item.product.toString() !== productId
    );

    // Log what happened
    if (userCart.items.length === originalLength) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    await userCart.save();

    console.log('After:', userCart.items);

    return res.status(200).json({ message: 'Product removed from cart' });
  } catch (e) {
    console.error('Error in removeFromCart:', e);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
};


// Place Order
export const placeOrder = async (req, res) => {
  try {
    // Fetch user and cart with items and product details populated
    const userOrder = await user.findById(req.user.id).populate({
      path: 'carts',
      populate: {
        path: 'items.product',
        model: 'product'  // Make sure this is the correct model name
      }
    });

    if (!userOrder || !userOrder.carts || userOrder.carts.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or user/cart not found' });
    }

    // Create orderItems from cart
    const orderItems = userOrder.carts.items.map(item => ({
      product: item.product._id,
      name: item.product.productName,
      price: item.product.price,
      quantity: item.quantity
    }));

    // Create order
    const newOrder = new order({
      user: userOrder._id,
      shippingAddress: userOrder.address, // Make sure 'address' exists on user
      orderItems,
      status: 'pending'
    });

    await newOrder.save();

    // Optional: Add order ID to user's order history if you have `orders` array
    // userOrder.orders.push(newOrder._id); // Only if your schema supports it

    // Clear cart after placing order
    userOrder.carts.items = [];
    await userOrder.carts.save();

    res.status(201).json({ message: 'Order placed successfully', data: newOrder });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Order failed' });
  }
};


// Get Order History
export const getOrderHistory = async (req, res) => {
  try {
    const orderHistory = await order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({data:orderHistory});
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Failed to fetch orders'});
  }
};
