import twilio from 'twilio';
import logger from './logger.js';

let twilioClient = null;

const getTwilioClient = () => {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error('Twilio credentials are not configured');
    }

    if (!twilioClient) {
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    return twilioClient;
};

const sendSMS = async (phoneNumber, body) => {
    if (!phoneNumber) {
        logger.warn('SMS skipped: phone number not provided');
        return null;
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
        throw new Error('TWILIO_PHONE_NUMBER is not configured');
    }

    const client = getTwilioClient();
    const message = await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
    });

    return message;
};

// Send SMS for user registration
const sendRegistrationSMS = async (phoneNumber, userName) => {
    try {
        const message = await sendSMS(
            phoneNumber,
            `Welcome to our E-Commerce Platform, ${userName}! Your account has been successfully created. Start shopping now!`
        );

        if (message) {
            logger.info(`Registration SMS sent to ${phoneNumber}`, { messageSid: message.sid });
            return { success: true, messageSid: message.sid };
        }

        return { success: false, skipped: true };
    } catch (error) {
        logger.error(`Error sending registration SMS to ${phoneNumber}:`, error.message);
        throw error;
    }
};

// Send SMS for order placed
const sendOrderPlacedSMS = async (phoneNumber, orderDetails) => {
    try {
        const message = await sendSMS(
            phoneNumber,
            `Order Placed! Order #${orderDetails.orderId} has been received. Total: $${orderDetails.totalAmount.toFixed(2)}. Track your order at our platform.`
        );

        if (message) {
            logger.info(`Order placed SMS sent to ${phoneNumber}`, { messageSid: message.sid });
            return { success: true, messageSid: message.sid };
        }

        return { success: false, skipped: true };
    } catch (error) {
        logger.error(`Error sending order placed SMS to ${phoneNumber}:`, error.message);
        throw error;
    }
};

// Send SMS for order shipped
const sendOrderShippedSMS = async (phoneNumber, orderDetails) => {
    try {
        const message = await sendSMS(
            phoneNumber,
            `Your order #${orderDetails.orderId} has been shipped! Tracking: ${orderDetails.trackingNumber || 'Check your account'}`
        );

        if (message) {
            logger.info(`Order shipped SMS sent to ${phoneNumber}`, { messageSid: message.sid });
            return { success: true, messageSid: message.sid };
        }

        return { success: false, skipped: true };
    } catch (error) {
        logger.error(`Error sending order shipped SMS to ${phoneNumber}:`, error.message);
        throw error;
    }
};

// Send SMS for order delivered
const sendOrderDeliveredSMS = async (phoneNumber, orderDetails) => {
    try {
        const message = await sendSMS(
            phoneNumber,
            `Your order #${orderDetails.orderId} has been delivered! Thank you for shopping with us. Rate your experience!`
        );

        if (message) {
            logger.info(`Order delivered SMS sent to ${phoneNumber}`, { messageSid: message.sid });
            return { success: true, messageSid: message.sid };
        }

        return { success: false, skipped: true };
    } catch (error) {
        logger.error(`Error sending order delivered SMS to ${phoneNumber}:`, error.message);
        throw error;
    }
};

// Send SMS for payment success
const sendPaymentSuccessSMS = async (phoneNumber, paymentDetails) => {
    try {
        const message = await sendSMS(
            phoneNumber,
            `Payment Confirmed! Your payment of $${paymentDetails.amount.toFixed(2)} for order #${paymentDetails.orderId} has been processed successfully.`
        );

        if (message) {
            logger.info(`Payment success SMS sent to ${phoneNumber}`, { messageSid: message.sid });
            return { success: true, messageSid: message.sid };
        }

        return { success: false, skipped: true };
    } catch (error) {
        logger.error(`Error sending payment success SMS to ${phoneNumber}:`, error.message);
        throw error;
    }
};

// Send SMS for order cancelled
const sendOrderCancelledSMS = async (phoneNumber, orderDetails) => {
    try {
        const message = await sendSMS(
            phoneNumber,
            `Your order #${orderDetails.orderId} has been cancelled. If payment was made, you'll receive a refund within 5-7 business days.`
        );

        if (message) {
            logger.info(`Order cancelled SMS sent to ${phoneNumber}`, { messageSid: message.sid });
            return { success: true, messageSid: message.sid };
        }

        return { success: false, skipped: true };
    } catch (error) {
        logger.error(`Error sending order cancelled SMS to ${phoneNumber}:`, error.message);
        throw error;
    }
};

export {
    sendRegistrationSMS,
    sendOrderPlacedSMS,
    sendOrderShippedSMS,
    sendOrderDeliveredSMS,
    sendPaymentSuccessSMS,
    sendOrderCancelledSMS
};
