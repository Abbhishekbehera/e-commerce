import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import notificationRouter from "./routes/notification.routes.js";

dotenv.config({
    quiet: true,
});

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5004;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Notification Service is running on port http://localhost:${PORT}`);
});

app.use("/api/v1/notify", notificationRouter);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statuscode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || []
    });
});

export default app;
