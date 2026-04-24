import express from "express";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadImageToCloudinary } from "../utils/fileUpload.js";

const registerUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password } = req.body
        if ([name, email, password].some((f) => {
            return f?.trim() === ""
        })) {
            throw new apiError("Fill all the details.", 400)
        }
        const existingUser = await User.findOne({ $or: [{ name }, { email }] })
        if (existingUser) {
            throw new apiError("User already exists.Please login!", 409)
        }
        const profilePicImage = req.files?.profilePic[0]?.path
        const profile = await uploadImageToCloudinary(profilePicImage)
        const newUser = await User.create({
            name,
            email,
            password,
            profilePic: profile.url
        })
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        return res.status(200).json(new apiResponse("User created successfully.", 200, newUser))
    }
    catch (error) {
        return res.status(500).json(new apiError("Server Error.Please wait!", 500))
    }

})