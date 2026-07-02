import mongoose from 'mongoose';
import axios from "axios";
import Order from '../models/order.model.js';
import asyncHandler from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import rabbitmqService from "../../shared/utils/rabbitmq.js";
import {
    publishOrderPlacedEvent,
    publishOrderCancelledEvent,
    publishOrderShippedEvent,
    publishOrderDeliveredEvent
} from "../../shared/utils/eventPublisher.js";
import logger from "../../shared/utils/logger.js";

const getProductServiceUrl = () => {
    const baseUrl = process.env.PRODUCT_SERVICE_URL || "http://localhost:5002";
    return `${baseUrl}/api/v1/products`;
};

// Order Place Controller
const placeOrder = asyncHandler(async (req, res) => {
    const { userId, items, userEmail, userPhoneNumber } = req.body;

    if (!userId) {
        throw new apiError("User ID is required", 400);
    }

    if (!userEmail?.trim()) {
        throw new apiError("User email is required for order notifications", 400);
    }

    if (!items || items.length === 0) {
        throw new apiError("Items are required", 400);
    }

    const productServiceUrl = getProductServiceUrl();

    // 1. Fetch products
    const response = await axios.post(`${productServiceUrl}/bulk`, {
        productIds: items.map((item) => item.productId)
    });
    const products = response.data;

    // 2. Build order items
    const orderItems = products.map((product) => {
        const reqItem = items.find((item) => item.productId === product._id.toString());

        if (!reqItem) {
            throw new apiError("Invalid product in order", 400);
        }

        if (product.stock < reqItem.quantity) {
            throw new apiError(`${product.productName} is out of stock`, 400);
        }

        return {
            productId: product._id.toString(),
            name: product.productName,
            price: product.productPrice,
            quantity: reqItem.quantity
        };
    });

    const subtotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const shipping = 5;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + shipping + tax;

    // 3. Atomic stock deduction
    await axios.post(`${productServiceUrl}/bulk-deduct`, {
        items: orderItems
    });

    // 4. Create order
    const order = await Order.create({
        userId,
        userEmail,
        userPhoneNumber: userPhoneNumber || "",
        items: orderItems,
        totalAmount,
        status: "pending"
    });

    // 5. Publish OrderPlaced event
    publishOrderPlacedEvent({
        ...order.toObject(),
        subtotal,
        shipping,
        tax
    }).catch((error) => {
        logger.error("Failed to publish OrderPlaced event:", error.message);
    });

    res.status(201).json(new apiResponse("Order placed successfully", 201, order));
});

// Get User Orders Controller
const getUserOrders = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalOrders = await Order.countDocuments({ userId });

    return res.status(200).json(
        new apiResponse("Orders retrieved successfully", 200, {
            orders,
            pagination: {
                totalOrders,
                currentPage: page,
                pageSize: limit
            }
        })
    );
});

// Get Order By Id Controller
const getOrderById = asyncHandler(async (req, res) => {
    const { userId, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new apiError("Invalid order ID", 400);
    }

    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
        throw new apiError("Order not found", 404);
    }

    return res.status(200).json(new apiResponse("Order retrieved successfully", 200, order));
});

// Update Order Status Controller
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, trackingNumber, carrier } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new apiError("Invalid order ID", 400);
    }

    if (!status) {
        throw new apiError("Order status is required", 400);
    }

    const order = await Order.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
    );

    if (!order) {
        throw new apiError("Order not found", 404);
    }

    // Publish status-based events
    if (status === "shipped") {
        publishOrderShippedEvent({
            orderId: order._id,
            userId: order.userId,
            userEmail: order.userEmail,
            userPhoneNumber: order.userPhoneNumber,
            trackingNumber: trackingNumber || `TRK-${order._id.toString().slice(-8).toUpperCase()}`,
            carrier: carrier || "Standard Shipping"
        }).catch((error) => {
            logger.error("Failed to publish OrderShipped event:", error.message);
        });
    }

    if (status === "delivered") {
        publishOrderDeliveredEvent({
            orderId: order._id,
            userId: order.userId,
            userEmail: order.userEmail,
            userPhoneNumber: order.userPhoneNumber,
            deliveryAddress: req.body.deliveryAddress || "Registered address"
        }).catch((error) => {
            logger.error("Failed to publish OrderDelivered event:", error.message);
        });
    }

    return res.status(200).json(new apiResponse("Order status updated successfully", 200, order));
});

// Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new apiError("Invalid order ID", 400);
    }

    const order = await Order.findById(id);
    if (!order) {
        throw new apiError("Order not found", 404);
    }

    if (order.status === "cancelled") {
        throw new apiError("Order is already cancelled", 400);
    }

    order.status = "cancelled";
    await order.save();

    publishOrderCancelledEvent({
        ...order.toObject(),
        cancelReason: cancelReason || "User Requested"
    }).catch((error) => {
        logger.error("Failed to publish OrderCancelled event:", error.message);
    });

    return res.status(200).json(new apiResponse("Order cancelled successfully", 200, order));
});

export {
    placeOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};
