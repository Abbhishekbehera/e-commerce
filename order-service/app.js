import express from "express";
import connectDb from "../order-service/config/db.js";
import dotenv from "dotenv";
import orderRouter from "../order-service/routes/order.routes.js";


dotenv.config(
    {
        quiet: true,
    }
);

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 5003;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Order Service is running on port http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database -> Order Service", error);
    });

app.use("/api/v1/", orderRouter);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || []
    });
});
