import express from "express";
import connectDb from "../user-service/config/db.js";
import dotenv from "dotenv";

dotenv.config(
    {
        quiet: true,
    }
);

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`User Service is running on port http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database -> User Service", error);
    });