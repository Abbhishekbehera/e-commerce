import express from "express";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadImageToCloudinary } from "../utils/fileUpload.js";
import { generateToken } from "../utils/generatejwt.js"

//Register Controller
const registerUser = asyncHandler(async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);
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
        const profilePicImage = req.files?.profilePic?.[0]?.path
        let profile = { url: "" };

        if (profilePicImage) {
        profile = await uploadImageToCloudinary(profilePicImage);
        }
        const newUser = await User.create({
            name,
            email,
            password,
            profilePic: profile.url
        })
        const token = generateToken({ userId: newUser._id })
        return res.status(200).json(new apiResponse("User created successfully.", 200,
            { user: newUser, token }))
    }

)

//Login Controller
const loginUser = asyncHandler(async (req, res) => {
        const { email, password } = req.body
        if ([email, password].some((f) => f?.trim() === "")) {
            throw new apiError("Email and password are required", 400)
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            throw new apiError("User not found. Please register!", 404)
        }
        const isMatch = await user.isPasswordCorrect(password)
        if (!isMatch) {
            throw new apiError("Incorrect Passsword.Try again!", 401)
        }
        const token = generateToken({ userId: user._id })
        return res.status(200).json(
            new apiResponse("Login successful", 200, {
                user: {
                    name: user.name,
                    email: user.email,
                },
                token
            }))
})

//Update User Profile Controller
const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        const { name, email } = req.body
        if ([name, email].some((f) => {
            return f?.trim() === ""
        })) {
            throw new apiError("All fields are required", 400)
        }
        const updateUser = await User.findByIdAndUpdate(req.user._id,
            {
                $set: {
                    name: name,
                    email: email
                }
            }, { new: true }
        )
        return res.status(200).json(new apiResponse("Updated successfully", 200, updateUser))

    }
    catch (error) {
        return res.status(500).json(new apiError("Server Error.Please wait!", 500))
    }
})

//Get User Profile Controller
const getUserProfile = asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id)
        if (!user) {
            throw new apiError("User not found", 404)
        }
        return res.status(200).json(
            new apiResponse("User profile fetched successfully", 200, user)
        )

})

//Logout user

const LogoutUser = asyncHandler( async(req, res)=> {
    return res.status(200).json(new apiResponse("Logged out successfully", 200, null)
)})

export { registerUser, getUserProfile, loginUser, updateUserProfile, LogoutUser }