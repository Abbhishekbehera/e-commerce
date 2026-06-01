import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail,
    sendShipmentNotificationEmail
} from "../services/mail.service.js";

// Send welcome notification
const sendWelcomeNotification = asyncHandler(async (req, res) => {
    const { email, userName } = req.body;

    if (!email || !userName) {
        throw new apiError("Email and user name are required", 400);
    }

    try {
        await sendWelcomeEmail(email, userName);
        return res.status(200).json(new apiResponse("Welcome email sent successfully", 200));
    } catch (error) {
        throw new apiError(`Failed to send welcome email: ${error.message}`, 500);
    }
});

// Send order confirmation notification
const sendOrderNotification = asyncHandler(async (req, res) => {
    const { email, orderDetails } = req.body;

    if (!email || !orderDetails) {
        throw new apiError("Email and order details are required", 400);
    }

    try {
        await sendOrderConfirmationEmail(email, orderDetails);
        return res.status(200).json(new apiResponse("Order confirmation email sent successfully", 200));
    } catch (error) {
        throw new apiError(`Failed to send order confirmation email: ${error.message}`, 500);
    }
});

// Send payment confirmation notification
const sendPaymentNotification = asyncHandler(async (req, res) => {
    const { email, paymentDetails } = req.body;

    if (!email || !paymentDetails) {
        throw new apiError("Email and payment details are required", 400);
    }

    try {
        await sendPaymentConfirmationEmail(email, paymentDetails);
        return res.status(200).json(new apiResponse("Payment confirmation email sent successfully", 200));
    } catch (error) {
        throw new apiError(`Failed to send payment confirmation email: ${error.message}`, 500);
    }
});

// Send shipment notification
const sendShipmentNotification = asyncHandler(async (req, res) => {
    const { email, shipmentDetails } = req.body;

    if (!email || !shipmentDetails) {
        throw new apiError("Email and shipment details are required", 400);
    }

    try {
        await sendShipmentNotificationEmail(email, shipmentDetails);
        return res.status(200).json(new apiResponse("Shipment notification email sent successfully", 200));
    } catch (error) {
        throw new apiError(`Failed to send shipment notification email: ${error.message}`, 500);
    }
});

export {
    sendWelcomeNotification,
    sendOrderNotification,
    sendPaymentNotification,
    sendShipmentNotification
}
