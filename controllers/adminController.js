import product from "../models/product.js";
import order from "../models/order.js";
import user from "../models/user.js";


//Admin Dashboard
export const adminDashboard = async (req, res) => {
    try {
        const totalOrders = await order.countDocuments();
        const pendingOrders = await order.countDocuments({ status: 'pending' });

        const topProducts = await product.aggregate([
            { $unwind: '$orderItems' },
            { $group: { _id: '$orderItems.product', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topCategories = await product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topSellers = await product.aggregate([
            { $group: { _id: '$seller', totalSold: { $sum: 1 } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'seller'
                }
            },
            { $unwind: '$seller' },
            {
                $project: {
                    name: '$seller.username',
                    totalSold: 1
                }
            }
        ]);

        res.json({
            totalOrders,
            pendingOrders,
            topProducts,
            topCategories,
            topSellers
        });
        console.log(topCategories,totalOrders,pendingOrders,topProducts,topSellers)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch dashboard data', error: err.message });
    }
}
//View all orders
export const viewOrders = async (req, res) => {
    try {
        const orders = await order.find()
            .populate('customer', 'username email')         // Get customer info
            .populate('seller', 'username email')           // Get seller info
            .populate('orderItems.product', 'name price image'); // Get product info
        console.log(orders)
        res.status(200).json({ orders });
    } catch (e) {
        console.error("Error fetching all orders:", e);
        return res.status(500).json({ message: 'Error in the server side.' });
    }
};

//Blacklist Products
export const blacklistProducts = async (req, res) => {
    try {
        const Products = await product.findByIdAndUpdate(req.params.id, { blacklisted: true }, { new: true })
        if (!Products) {
            return res.status(404).json({ message: "Product not found." })
        }
        res.status(201).json({ message: "Product blacklisted.", data: Products })
    }
    catch (e) {
        return res.status(500).json({ message: "Error from the server side." })
    }
}
