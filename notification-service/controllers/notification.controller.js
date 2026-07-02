import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail,
    sendOrderCancellationEmail,
    sendPasswordResetEmail
} from "../../shared/utils/emailService.js";
import {
    sendRegistrationSMS,
    sendOrderPlacedSMS,
    sendPaymentSuccessSMS,
    sendOrderCancelledSMS
} from "../../shared/utils/smsService.js";
import logger from "../../shared/utils/logger.js";

// Send welcome notification (manual trigger / testing)
const sendWelcomeNotification = asyncHandler(async (req, res) => {
    const { email, userName, phoneNumber } = req.body;

    if (!email || !userName) {
        throw new apiError("Email and user name are required", 400);
    }

    await sendWelcomeEmail(email, userName);

    if (phoneNumber) {
        await sendRegistrationSMS(phoneNumber, userName);
    }

    return res.status(200).json(new apiResponse("Welcome notification sent successfully", 200));
});

// Send order confirmation notification
const sendOrderNotification = asyncHandler(async (req, res) => {
    const { email, phoneNumber, orderDetails } = req.body;

    if (!email || !orderDetails) {
        throw new apiError("Email and order details are required", 400);
    }

    await sendOrderConfirmationEmail(email, orderDetails);

    if (phoneNumber) {
        await sendOrderPlacedSMS(phoneNumber, orderDetails);
    }

    return res.status(200).json(new apiResponse("Order confirmation notification sent successfully", 200));
});

// Send payment confirmation notification
const sendPaymentNotification = asyncHandler(async (req, res) => {
    const { email, phoneNumber, paymentDetails } = req.body;

    if (!email || !paymentDetails) {
        throw new apiError("Email and payment details are required", 400);
    }

    await sendPaymentConfirmationEmail(email, paymentDetails);

    if (phoneNumber) {
        await sendPaymentSuccessSMS(phoneNumber, paymentDetails);
    }

    return res.status(200).json(new apiResponse("Payment confirmation notification sent successfully", 200));
});

// Send order cancellation notification
const sendCancellationNotification = asyncHandler(async (req, res) => {
    const { email, phoneNumber, orderDetails } = req.body;

    if (!email || !orderDetails) {
        throw new apiError("Email and order details are required", 400);
    }

    await sendOrderCancellationEmail(email, orderDetails);

    if (phoneNumber) {
        await sendOrderCancelledSMS(phoneNumber, orderDetails);
    }

    return res.status(200).json(new apiResponse("Order cancellation notification sent successfully", 200));
});

// Send password reset email (manual trigger / testing)
const sendPasswordResetNotification = asyncHandler(async (req, res) => {
    const { email, resetToken, resetUrl } = req.body;

    if (!email || !resetToken || !resetUrl) {
        throw new apiError("Email, reset token, and reset URL are required", 400);
    }

    await sendPasswordResetEmail(email, resetToken, resetUrl);

    return res.status(200).json(new apiResponse("Password reset email sent successfully", 200));
});

// Health check
const healthCheck = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiResponse("Notification service is healthy", 200, {
        service: "notification-service",
        status: "running",
        consumers: [
            "UserRegistered",
            "OrderPlaced",
            "PaymentCompleted",
            "OrderShipped",
            "OrderDelivered",
            "OrderCancelled"
        ]
    }));
});

export {
    sendWelcomeNotification,
    sendOrderNotification,
    sendPaymentNotification,
    sendCancellationNotification,
    sendPasswordResetNotification,
    healthCheck
};
