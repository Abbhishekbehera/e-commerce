import express from "express";
import connectDb from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import paymentRouter from "./routes/payment.routes.js";
import rabbitmqService from "../shared/utils/rabbitmq.js";
import logger from "../shared/utils/logger.js";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 5005;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const initializeServices = async () => {
    try {
        await connectDb();
        logger.info("Payment Service: Connected to MongoDB");

        await rabbitmqService.connect();
        logger.info("Payment Service: Connected to RabbitMQ");

        app.listen(PORT, () => {
            logger.info(`Payment Service is running on port http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error("Failed to initialize Payment Service:", error.message);
        process.exit(1);
    }
};

app.use("/api/v1/payment", paymentRouter);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "payment-service" });
});

app.use((err, req, res, next) => {
    logger.error(err);

    res.status(err.statusCode || err.statuscode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || []
    });
});

process.on("SIGTERM", async () => {
    logger.info("SIGTERM signal received: closing Payment Service");
    await rabbitmqService.close();
    process.exit(0);
});

initializeServices();

export default app;
