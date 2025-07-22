import product from "../models/product.js";
import order from "../models/order.js";
import mongoose from "mongoose";


//Dashboard of Seller
export const sellerDashboard = async (req, res) => {
  const sellerId = req.user.id;

  try {
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // Total Products
    const totalProducts = await product.countDocuments({ seller: sellerObjectId });

    // Total Orders for Seller
    const totalOrdersAgg = await order.aggregate([
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.seller": sellerObjectId } },
      { $group: { _id: "$_id" } },
      { $count: "totalOrders" }
    ]);
    const totalOrders = totalOrdersAgg.length > 0 ? totalOrdersAgg[0].totalOrders : 0;

    // Pending Orders
    const pendingOrdersAgg = await order.aggregate([
      { $match: { status: "pending" } },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.seller": sellerObjectId } },
      { $group: { _id: "$_id" } },
      { $count: "pendingOrders" }
    ]);
    const pendingOrders = pendingOrdersAgg.length > 0 ? pendingOrdersAgg[0].pendingOrders : 0;

    // Top 5 Products by Quantity Sold
    const topProducts = await order.aggregate([
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.seller": sellerObjectId } },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          productId: "$productDetails._id",
          name: "$productDetails.productName",
          totalSold: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Top 3 Categories by Count
    const topCategories = await product.aggregate([
      { $match: { seller: sellerObjectId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    return res.status(200).json({
      totalProducts,
      totalOrders,
      pendingOrders,
      topProducts,
      topCategories
    });
  } catch (e) {
    console.error("Dashboard Error:", e);
    return res.status(500).json({ message: "Dashboard server is down." });
  }
};

//Create Product ==>
export const createProduct = async (req, res) => {
    try {

        const sellerId = req.user.id
        console.log(req.user)
        const { productName, description, price, category } = req.body
        console.log('new')
        const imagePath = req.file ? req.file.path : null
        const newProduct = new product({
            productName,
            description,
            price,
            seller: sellerId,
            category,
            image: imagePath,

        })
        await newProduct.save()
        res.status(201).json({ message: 'Successfully product created.' })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Server Error in creating the product.' })
    }
}

//Update Product ==>
export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { productName, description, category, price } = req.body;

        const existingProduct = await product.findOne({ productId });


        if (!existingProduct) {
            return res.status(404).json({ message: 'This product does not exist.' });
        }
        console.log('1')

        existingProduct.productName = productName || existingProduct.productName;
        existingProduct.description = description || existingProduct.description;
        existingProduct.category = category || existingProduct.category;
        existingProduct.price = price || existingProduct.price;
        console.log('2')

        const updatedProduct = await existingProduct.save();
        console.log('3')

        return res.status(200).json({
            message: 'Product updated successfully.',
            product: updatedProduct
        });

    } catch (e) {
        console.log('Update Error:', e)
        console.error('Update Error:', e);
        if (res.headersSent) return;
        return res.status(500).json({ message: 'Server error while updating product.' });
    }
};



//Delete Product ==>
export const deleteProduct = async (req, res) => {
    const productId = req.params.id
    const sellerId = req.user.id
    await product.findOneAndDelete({
        _id: productId,
        seller: sellerId
    })
    try {
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }
        res.status(202).json({ message: 'Successfully deleted product.', data: product })
    }
    catch (e) {
        console.log(e)
        res.status(502).json({ message: 'Server Error in deleting the product.' })
    }
}

//Get orders ==>
export const getOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const orders = await order.find({ seller: sellerId })
            .populate('customer', 'username')
            .populate('orderItems.product', 'name description price')
            console.log(sellerId)
        res.status(200).json({ orders })
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'Order fetch error.' })
    }
}
//Get pending orders ==>
export const getPendingOrders = async (req, res) => {
    try {
        const orders = await order.find({ seller: req.user.id, status: 'pending' })
        res.status(200).json({ orders })
        console.log(orders)
    }
    catch (e) {
        return res.status(500).json({ message: 'Pending order fetch error.' })
    }
}
//Get Delivered orders ==>
export const getDeliveredOrders = async (req, res) => {
    try {
        const orders = await order.find({ seller: req.user.id, status: 'delivered' })
        res.status(200).json({ orders })
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'Delivered order fetch error.' })
    }
}    