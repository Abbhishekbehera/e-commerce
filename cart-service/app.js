import express from "express";
import connectDb from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import cartRouter from "./routes/cart.routes.js";

dotenv.config({
    path: "../.env"
});

const app = express();
const PORT = process.env.CART_SERVICE_PORT || 5006;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Cart Service is running on port http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database -> Cart Service", error);
    });

app.use("/api/v1/cart", cartRouter);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statuscode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || []
    });
});

export default app;
