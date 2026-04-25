import jwt from "jsonwebtoken";
import argon2 from "argon2";

export const generateToken = (payload) => {

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing");
    }

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};