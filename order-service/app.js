import express from "express";
import connectDb from "../order-service/config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import orderRouter from "../order-service/routes/order.routes.js";
import rabbitmqService from "../shared/utils/rabbitmq.js";
import logger from "../shared/utils/logger.js";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 5003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const initializeServices = async () => {
    try {
        await connectDb();
        logger.info("Order Service: Connected to MongoDB");

        await rabbitmqService.connect();
        logger.info("Order Service: Connected to RabbitMQ");

        app.listen(PORT, () => {
            logger.info(`Order Service is running on port http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error("Failed to initialize Order Service:", error.message);
        process.exit(1);
    }
};

app.use("/api/v1/orders", orderRouter);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "order-service" });
});

app.use((err, req, res, next) => {
    logger.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || []
    });
});

process.on("SIGTERM", async () => {
    logger.info("SIGTERM signal received: closing Order Service");
    await rabbitmqService.close();
    process.exit(0);
});

initializeServices();

export default app;
