import express from "express";
import connectDb from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config({
    path: "../.env",
});
import paymentRouter from "./routes/payment.routes.js";
const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 5005;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Payment Service is running on port http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database -> Payment Service", error);
    });

app.use("/api/v1/payment", paymentRouter);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statuscode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || []
    });
});

export default app;
