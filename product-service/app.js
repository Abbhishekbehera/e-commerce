import express from "express";
import connectDb from "../product-service/config/db.js";
import dotenv from "dotenv";
import productRouter from "../product-service/routes/product.routes.js";

dotenv.config(
    {
        quiet: true,
    }
);

const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || 5002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Product Service is running on port http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database -> Product Service", error);
    });

app.use("/api/v1/products", productRouter);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || []
    });
});
