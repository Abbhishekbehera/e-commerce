import express from "express";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadImageToCloudinary } from "../utils/fileUpload.js";
import { generateToken } from "../utils/generatejwt.js"

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
        const token = generateToken({ userId: newUser._id })
        return res.status(200).json( new apiResponse("User created successfully.", 200, 
            {user: newUser,token}))
    }
    catch (error) {
        return res.status(500).json(new apiError("Server Error.Please wait!", 500))
    }

})


const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?.userId   
        if (!userId) {
            throw new apiError("Unauthorized access", 401)
        }
        const user = await User.findById(userId).select("-password")
        if (!user) {
            throw new apiError("User not found", 404)
        }
        return res.status(200).json(
            new apiResponse("User profile fetched successfully", 200, user)
        )} catch (error) {
        return res.status(500).json(new apiError("Server Error.Please wait!", 500))
    }})

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body
        if ([email, password].some((f) => f?.trim() === "")) {
            throw new apiError("Email and password are required", 400)
        }
        const user = await User.findOne({ email })
        if (!user) {
            throw new apiError("User not found. Please register!", 404)
        }
        const isMatch = await user.isPasswordCorrect(password)
        if (!isMatch) {
            throw new apiError("Invalid credentials", 401)
        }
        const token = generateToken({ userId: user._id })
        return res.status(200).json(
            new apiResponse("Login successful", 200, {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePic: user.profilePic},
                token
            }))} catch (error) {
        return res.status(500).json(new apiError("Server Error.Please wait!", 500))
    }})

const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?.userId
        if (!userId) {
            throw new apiError("Unauthorized access", 401)
        }
        const { name, email, password } = req.body
        const user = await User.findById(userId)
        if (!user) {
            throw new apiError("User not found", 404)
        }
        if (name) user.name = name
        if (email) user.email = email
        if (password) user.password = password
        const profilePicImage = req.files?.profilePic?.[0]?.path
        if (profilePicImage) {
            const profile = await uploadImageToCloudinary(profilePicImage)
            user.profilePic = profile.url
        }
        await user.save()
        return res.status(200).json(
            new apiResponse("Profile updated successfully", 200, user)
        )
    } catch (error) {
        return res.status(500).json(new apiError("Server Error.Please wait!", 500))
    }})



export {registerUser, getUserProfile, loginUser, updateUserProfile}