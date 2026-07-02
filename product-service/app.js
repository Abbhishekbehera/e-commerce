import express from "express";
import connectDb from "../product-service/config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import productRouter from "../product-service/routes/product.routes.js";
import redisService from "../shared/utils/redis.js";
import logger from "../shared/utils/logger.js";

dotenv.config(
    {
        path: "../.env",
    }
);

const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || 5002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize services
const initializeServices = async () => {
    try {
        // Connect to MongoDB
        await connectDb();
        logger.info('Connected to MongoDB');

        // Connect to Redis
        await redisService.connect();
        logger.info('Connected to Redis');

        app.listen(PORT, () => {
            logger.info(`Product Service is running on port http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error("Failed to initialize Product Service:", error.message);
        process.exit(1);
    }
};

app.use("/api/v1/products", productRouter);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "product-service" });
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
    await redisService.close();
    process.exit(0);
});

initializeServices();

export default app;
