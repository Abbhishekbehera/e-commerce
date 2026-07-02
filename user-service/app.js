import express from "express";
import connectDb from "../user-service/config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import rabbitmqService from "../shared/utils/rabbitmq.js";
import logger from "../shared/utils/logger.js";

dotenv.config(
    {
        path: "../.env" 
    }
);

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize services
const initializeServices = async () => {
    try {
        // Connect to MongoDB
        await connectDb();
        logger.info('User Service: Connected to MongoDB');

        // Connect to RabbitMQ
        await rabbitmqService.connect();
        logger.info('User Service: Connected to RabbitMQ');

        app.listen(PORT, () => {
            logger.info(`User Service is running on port http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error("Failed to initialize User Service:", error.message);
        process.exit(1);
    }
};

app.use("/api/v1/user", userRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "user-service" });
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

initializeServices();

export default app;





