import Stripe from "stripe";
import Payment from "../models/payment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { publishPaymentCompletedEvent } from "../../shared/utils/eventPublisher.js";
import logger from "../../shared/utils/logger.js";

const getStripeClient = () => {
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Create payment intent
const createPaymentIntent = asyncHandler(async (req, res) => {
    const { orderId, amount, userId, userEmail, userPhoneNumber } = req.body;

    if (!orderId || !amount || !userId) {
        throw new apiError("Order ID, amount, and user ID are required", 400);
    }

    if (amount < 1) {
        throw new apiError("Amount must be at least $1", 400);
    }

    try {
        const stripeClient = getStripeClient();
        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: "usd",
            metadata: {
                orderId,
                userId
            }
        });

        const payment = await Payment.create({
            orderId,
            userId,
            userEmail: userEmail || "",
            userPhoneNumber: userPhoneNumber || "",
            amount,
            currency: "usd",
            paymentMethod: "stripe",
            status: "processing",
            stripePaymentIntentId: paymentIntent.id
        });

        return res.status(201).json(
            new apiResponse("Payment intent created successfully", 201, {
                clientSecret: paymentIntent.client_secret,
                payment
            })
        );
    } catch (error) {
        throw new apiError(`Payment creation failed: ${error.message}`, 500);
    }
});

// Confirm payment
const confirmPayment = asyncHandler(async (req, res) => {
    const { paymentIntentId, userEmail, userPhoneNumber } = req.body;

    if (!paymentIntentId) {
        throw new apiError("Payment Intent ID is required", 400);
    }

    try {
        const paymentIntent = await getStripeClient().paymentIntents.retrieve(paymentIntentId);

        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

        if (!payment) {
            throw new apiError("Payment record not found", 404);
        }

        if (paymentIntent.status === "succeeded") {
            payment.status = "completed";
            payment.transactionId = paymentIntent.id;

            if (userEmail) payment.userEmail = userEmail;
            if (userPhoneNumber) payment.userPhoneNumber = userPhoneNumber;

            await payment.save();

            publishPaymentCompletedEvent({
                transactionId: payment.transactionId,
                orderId: payment.orderId,
                userId: payment.userId,
                userEmail: payment.userEmail,
                userPhoneNumber: payment.userPhoneNumber,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod
            }).catch((error) => {
                logger.error("Failed to publish PaymentCompleted event:", error.message);
            });
        } else if (paymentIntent.status === "requires_payment_method") {
            payment.status = "pending";
            await payment.save();
        } else if (paymentIntent.status === "canceled") {
            payment.status = "failed";
            payment.errorMessage = "Payment was canceled";
            await payment.save();
        } else {
            await payment.save();
        }

        return res.status(200).json(
            new apiResponse("Payment confirmed successfully", 200, payment)
        );
    } catch (error) {
        throw new apiError(`Payment confirmation failed: ${error.message}`, 500);
    }
});

// Get payment status
const getPaymentStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        throw new apiError("Order ID is required", 400);
    }

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
        throw new apiError("Payment not found", 404);
    }

    return res.status(200).json(
        new apiResponse("Payment status retrieved successfully", 200, payment)
    );
});

// Get all payments for a user
const getUserPayments = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new apiError("User ID is required", 400);
    }

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json(
        new apiResponse("User payments retrieved successfully", 200, payments)
    );
});

// Refund payment
const refundPayment = asyncHandler(async (req, res) => {
    const { orderId, refundAmount } = req.body;

    if (!orderId) {
        throw new apiError("Order ID is required", 400);
    }

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
        throw new apiError("Payment not found", 404);
    }

    if (payment.status !== "completed") {
        throw new apiError("Only completed payments can be refunded", 400);
    }

    try {
        const stripeClient = getStripeClient();
        const refund = await stripeClient.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            amount: refundAmount ? Math.round(refundAmount * 100) : undefined
        });

        payment.status = "refunded";
        await payment.save();

        return res.status(200).json(
            new apiResponse("Payment refunded successfully", 200, {
                payment,
                refund
            })
        );
    } catch (error) {
        throw new apiError(`Refund failed: ${error.message}`, 500);
    }
});

export {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    getUserPayments,
    refundPayment
};
