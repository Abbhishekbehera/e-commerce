import express from 'express';
import mongoose from 'mongoose';
import axios from "axios";
import Order from '../models/order.model.js';
import asyncHandler from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

//Order Place Controller
const placeOrder = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { items } = req.body;

    if (!items || items.length === 0) {
        throw new apiError(400, "Items are required");
    }

    // 1. Fetch products
    const { data: products } = await axios.post(
        `${process.env.PRODUCT_SERVICE_URI}/api/v1/products/bulk`,
        { productIds: items.map((i) => i.productId) }
    );

    // 2. Build order items
    const orderItems = products.map((product) => {
        const reqItem = items.find((i) => i.productId === product._id);

        if (!reqItem) {
            throw new apiError(400, "Invalid product");
        }

        if (product.stock < reqItem.quantity) {
            throw new apiError(400, `${product.name} out of stock`);
        }

        return {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: reqItem.quantity,
        };
    });

    const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // 🔥 3. Atomic stock deduction
    await axios.post(`${process.env.PRODUCT_SERVICE_URI}/api/v1/products/bulk-deduct`, {
        items: orderItems,
    });

    // 4. Create order
    const order = await Order.create({
        userId,
        items: orderItems,
        totalAmount,
        status: "pending",
    });

    res.status(201).json(new apiResponse(201, order));
});

//Get User Orders Controller
const getUserOrders = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalOrders = await Order.countDocuments({ userId });
    return res.status(200).json(new apiResponse(200, orders, totalOrders));
});

//Get Order By Id Controller
const getOrderById = asyncHandler(async (req, res) => {
    const { userId, id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new apiError(400, "Invalid order ID");
    }
    const order = await Order.findById({ _id: id, userId: userId });
    if (!order) {
        throw new apiError(404, "Order not found");
    }
    return res.status(200).json(new apiResponse(200, order));
});

//Update Order Status Controller
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new apiError(400, "Invalid order ID");
    }
    if (!status) {
        throw new apiError(400, "Order status is required");
    }
    const order = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!order) {
        throw new apiError(404, "Order not found");
    }
    return res.status(200).json(new apiResponse(200, order));
});

export {
    placeOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus
};