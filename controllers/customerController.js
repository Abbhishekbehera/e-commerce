import product from "../models/product.js";
import order from "../models/order.js";
import user from "../models/user.js";

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

// Add to Cart
export const addToCart = async (req, res) => {
  const { productId } = req.body;
  try {
    const userCart = await user.findById(req.user._id);
    if (!userCart.cart.includes(productId)) {
      userCart.cart.push(productId);
      await user.save();
    }
    res.status(200).json({ message: 'Product added to cart' });
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

// View Cart
export const getCart = async (req, res) => {
  try {
    const userViewCart = await user.findById(req.user._id).populate('cart');
    res.json(userViewCart.cart);
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Failed to load cart'});
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const userRemove = await user.findById(req.user._id);
    userRemove.cart = userRemove.cart.filter(item => item.toString() !== productId);
    await userRemove.save();
    res.status(200).json({ message: 'Product removed from cart' });
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
};

// Place Order
export const placeOrder = async (req, res) => {
  try {
    const userOrder = await user.findById(req.user._id).populate('cart');
    if (userOrder.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = user.cart.map(item => ({
      product: item._id,
      name: item.name,
      price: item.price,
    }));

    const orders = new order({
      user: user._id,
      shippingAddress: user.address,
      orderItems,
      status: 'pending'
    });

    await orders.save();

    userOrder.orders.push(order._id);
    userOrder.cart = [];
    await userOrder.save();

    res.status(201).json({ message: 'Order placed successfully', data:orders });
  } catch (e) {
    console.log(e)
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
