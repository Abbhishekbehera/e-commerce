import logger from '../../shared/utils/logger.js';
import {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail,
    sendOrderCancellationEmail
} from '../../shared/utils/emailService.js';
import {
    sendRegistrationSMS,
    sendOrderPlacedSMS,
    sendOrderShippedSMS,
    sendOrderDeliveredSMS,
    sendPaymentSuccessSMS,
    sendOrderCancelledSMS
} from '../../shared/utils/smsService.js';

// Handle UserRegistered event
const handleUserRegistered = async (eventData) => {
    try {
        const { userId, email, phoneNumber, userName, fullName } = eventData;

        logger.info(`Processing UserRegistered event for user: ${userId}`);

        // Send welcome email
        await sendWelcomeEmail(email, userName || fullName);

        // Send registration SMS
        if (phoneNumber) {
            await sendRegistrationSMS(phoneNumber, userName || fullName);
        }

        logger.info(`UserRegistered notifications sent for user: ${userId}`);
    } catch (error) {
        logger.error('Error processing UserRegistered event:', error.message);
        throw error; // Will be requeued
    }
};

// Handle OrderPlaced event
const handleOrderPlaced = async (eventData) => {
    try {
        const { orderId, userId, email, phoneNumber, orderDetails } = eventData;

        logger.info(`Processing OrderPlaced event for order: ${orderId}`);

        const orderData = {
            orderId,
            items: orderDetails.items,
            subtotal: orderDetails.subtotal,
            shipping: orderDetails.shipping || 0,
            tax: orderDetails.tax || 0,
            totalAmount: orderDetails.totalAmount,
            status: 'Pending',
            createdAt: new Date()
        };

        // Send order confirmation email
        await sendOrderConfirmationEmail(email, orderData);

        // Send order placed SMS
        if (phoneNumber) {
            await sendOrderPlacedSMS(phoneNumber, orderData);
        }

        logger.info(`OrderPlaced notifications sent for order: ${orderId}`);
    } catch (error) {
        logger.error('Error processing OrderPlaced event:', error.message);
        throw error;
    }
};

// Handle PaymentCompleted event
const handlePaymentCompleted = async (eventData) => {
    try {
        const { transactionId, orderId, userId, email, phoneNumber, amount, paymentMethod } = eventData;

        logger.info(`Processing PaymentCompleted event for order: ${orderId}`);

        const paymentData = {
            transactionId,
            orderId,
            amount,
            status: 'Completed',
            paymentMethod
        };

        // Send payment confirmation email
        await sendPaymentConfirmationEmail(email, paymentData);

        // Send payment success SMS
        if (phoneNumber) {
            await sendPaymentSuccessSMS(phoneNumber, paymentData);
        }

        logger.info(`PaymentCompleted notifications sent for order: ${orderId}`);
    } catch (error) {
        logger.error('Error processing PaymentCompleted event:', error.message);
        throw error;
    }
};

// Handle OrderShipped event
const handleOrderShipped = async (eventData) => {
    try {
        const { orderId, userId, email, phoneNumber, trackingNumber, carrier } = eventData;

        logger.info(`Processing OrderShipped event for order: ${orderId}`);

        const shipmentData = {
            orderId,
            trackingNumber,
            carrier,
            shippedAt: new Date()
        };

        // Send order shipped SMS
        if (phoneNumber) {
            await sendOrderShippedSMS(phoneNumber, shipmentData);
        }

        logger.info(`OrderShipped notifications sent for order: ${orderId}`);
    } catch (error) {
        logger.error('Error processing OrderShipped event:', error.message);
        throw error;
    }
};

// Handle OrderDelivered event
const handleOrderDelivered = async (eventData) => {
    try {
        const { orderId, userId, email, phoneNumber, deliveryDate } = eventData;

        logger.info(`Processing OrderDelivered event for order: ${orderId}`);

        // Send order delivered SMS
        if (phoneNumber) {
            await sendOrderDeliveredSMS(phoneNumber, {
                orderId,
                deliveryDate
            });
        }

        logger.info(`OrderDelivered notifications sent for order: ${orderId}`);
    } catch (error) {
        logger.error('Error processing OrderDelivered event:', error.message);
        throw error;
    }
};

// Handle OrderCancelled event
const handleOrderCancelled = async (eventData) => {
    try {
        const { orderId, userId, email, phoneNumber, reason, refundAmount } = eventData;

        logger.info(`Processing OrderCancelled event for order: ${orderId}`);

        const cancellationData = {
            orderId,
            reason,
            refundAmount
        };

        // Send order cancellation email
        await sendOrderCancellationEmail(email, cancellationData);

        // Send order cancelled SMS
        if (phoneNumber) {
            await sendOrderCancelledSMS(phoneNumber, cancellationData);
        }

        logger.info(`OrderCancelled notifications sent for order: ${orderId}`);
    } catch (error) {
        logger.error('Error processing OrderCancelled event:', error.message);
        throw error;
    }
};

export {
    handleUserRegistered,
    handleOrderPlaced,
    handlePaymentCompleted,
    handleOrderShipped,
    handleOrderDelivered,
    handleOrderCancelled
};
