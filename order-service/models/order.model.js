import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true 
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["pending", "processing", "shipped", "delivered", "cancelled"],
            message: "Invalid order status"
        },
        default: "pending"
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;