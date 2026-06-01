import express from "express";
import connectDb from "../user-service/config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";

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

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`User Service is running on port http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database -> User Service", error);
    });

app.use("/api/v1/user", userRoutes);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statuscode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || []
    });
});
