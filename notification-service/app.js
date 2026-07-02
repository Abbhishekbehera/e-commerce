import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import notificationRouter from "./routes/notification.routes.js";
import rabbitmqService from "../shared/utils/rabbitmq.js";
import logger from "../shared/utils/logger.js";
import * as notificationEvents from "./consumers/eventConsumers.js";

dotenv.config({
    quiet: true,
});

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5004;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize RabbitMQ and subscribe to events
const initializeRabbitMQ = async () => {
    try {
        await rabbitmqService.connect();

        // Subscribe to all events
        await rabbitmqService.subscribeToEvent('UserRegistered', notificationEvents.handleUserRegistered);
        await rabbitmqService.subscribeToEvent('OrderPlaced', notificationEvents.handleOrderPlaced);
        await rabbitmqService.subscribeToEvent('PaymentCompleted', notificationEvents.handlePaymentCompleted);
        await rabbitmqService.subscribeToEvent('OrderShipped', notificationEvents.handleOrderShipped);
        await rabbitmqService.subscribeToEvent('OrderDelivered', notificationEvents.handleOrderDelivered);
        await rabbitmqService.subscribeToEvent('OrderCancelled', notificationEvents.handleOrderCancelled);

        logger.info('Notification Service: All event consumers initialized');
    } catch (error) {
        logger.error('Failed to initialize RabbitMQ consumers:', error.message);
        // Retry after 5 seconds
        setTimeout(initializeRabbitMQ, 5000);
    }
};

// Start server
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            logger.info(`Notification Service is running on port http://localhost:${PORT}`);
        });

        // Initialize RabbitMQ consumers
        await initializeRabbitMQ();
    } catch (error) {
        logger.error('Failed to start Notification Service:', error.message);
        process.exit(1);
    }
};

app.use("/api/v1/notify", notificationRouter);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "notification-service" });
});

app.use((err, req, res, next) => {
    logger.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || []
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    await rabbitmqService.close();
    process.exit(0);
});

startServer();

export default app;
