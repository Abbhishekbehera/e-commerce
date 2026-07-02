import rabbitmqService from './rabbitmq.js';
import logger from './logger.js';

// User Service events
const publishUserRegisteredEvent = async (userData) => {
    try {
        const eventData = {
            userId: userData._id,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            userName: userData.name,
            fullName: userData.name,
            createdAt: new Date()
        };
        
        const success = await rabbitmqService.publishEvent('UserRegistered', eventData);
        if (success) {
            logger.info(`UserRegistered event published for user: ${userData._id}`);
        }
        return success;
    } catch (error) {
        logger.error('Error publishing UserRegistered event:', error.message);
        return false;
    }
};

// Order Service events
const publishOrderPlacedEvent = async (orderData) => {
    try {
        const eventData = {
            orderId: orderData._id,
            userId: orderData.userId,
            email: orderData.userEmail,
            phoneNumber: orderData.userPhoneNumber,
            orderDetails: {
                items: orderData.items,
                subtotal: orderData.subtotal || 0,
                shipping: orderData.shipping || 0,
                tax: orderData.tax || 0,
                totalAmount: orderData.totalAmount
            },
            status: orderData.status,
            createdAt: new Date()
        };
        
        const success = await rabbitmqService.publishEvent('OrderPlaced', eventData);
        if (success) {
            logger.info(`OrderPlaced event published for order: ${orderData._id}`);
        }
        return success;
    } catch (error) {
        logger.error('Error publishing OrderPlaced event:', error.message);
        return false;
    }
};

const publishOrderCancelledEvent = async (orderData) => {
    try {
        const eventData = {
            orderId: orderData._id,
            userId: orderData.userId,
            email: orderData.userEmail,
            phoneNumber: orderData.userPhoneNumber,
            reason: orderData.cancelReason || 'User Requested',
            refundAmount: orderData.totalAmount,
            cancelledAt: new Date()
        };
        
        const success = await rabbitmqService.publishEvent('OrderCancelled', eventData);
        if (success) {
            logger.info(`OrderCancelled event published for order: ${orderData._id}`);
        }
        return success;
    } catch (error) {
        logger.error('Error publishing OrderCancelled event:', error.message);
        return false;
    }
};

// Payment Service events
const publishPaymentCompletedEvent = async (paymentData) => {
    try {
        const eventData = {
            transactionId: paymentData.transactionId,
            orderId: paymentData.orderId,
            userId: paymentData.userId,
            email: paymentData.userEmail,
            phoneNumber: paymentData.userPhoneNumber,
            amount: paymentData.amount,
            status: 'Completed',
            paymentMethod: paymentData.paymentMethod,
            completedAt: new Date()
        };
        
        const success = await rabbitmqService.publishEvent('PaymentCompleted', eventData);
        if (success) {
            logger.info(`PaymentCompleted event published for order: ${paymentData.orderId}`);
        }
        return success;
    } catch (error) {
        logger.error('Error publishing PaymentCompleted event:', error.message);
        return false;
    }
};

// Shipment events
const publishOrderShippedEvent = async (shipmentData) => {
    try {
        const eventData = {
            orderId: shipmentData.orderId,
            userId: shipmentData.userId,
            email: shipmentData.userEmail,
            phoneNumber: shipmentData.userPhoneNumber,
            trackingNumber: shipmentData.trackingNumber,
            carrier: shipmentData.carrier,
            shippedAt: new Date()
        };
        
        const success = await rabbitmqService.publishEvent('OrderShipped', eventData);
        if (success) {
            logger.info(`OrderShipped event published for order: ${shipmentData.orderId}`);
        }
        return success;
    } catch (error) {
        logger.error('Error publishing OrderShipped event:', error.message);
        return false;
    }
};

const publishOrderDeliveredEvent = async (deliveryData) => {
    try {
        const eventData = {
            orderId: deliveryData.orderId,
            userId: deliveryData.userId,
            email: deliveryData.userEmail,
            phoneNumber: deliveryData.userPhoneNumber,
            deliveryDate: new Date(),
            deliveryAddress: deliveryData.deliveryAddress
        };
        
        const success = await rabbitmqService.publishEvent('OrderDelivered', eventData);
        if (success) {
            logger.info(`OrderDelivered event published for order: ${deliveryData.orderId}`);
        }
        return success;
    } catch (error) {
        logger.error('Error publishing OrderDelivered event:', error.message);
        return false;
    }
};

export {
    publishUserRegisteredEvent,
    publishOrderPlacedEvent,
    publishOrderCancelledEvent,
    publishPaymentCompletedEvent,
    publishOrderShippedEvent,
    publishOrderDeliveredEvent
};
