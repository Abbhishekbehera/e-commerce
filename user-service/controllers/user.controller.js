import express from "express";
import crypto from "crypto";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadImageToCloudinary } from "../utils/fileUpload.js";
import { generateToken } from "../utils/generatejwt.js";
import { publishUserRegisteredEvent } from "../../shared/utils/eventPublisher.js";
import { sendPasswordResetEmail } from "../../shared/utils/emailService.js";
import logger from "../../shared/utils/logger.js";

// Register Controller
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;

    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new apiError("Fill all the required details.", 400);
    }

    const existingUser = await User.findOne({ $or: [{ name }, { email }] });
    if (existingUser) {
        throw new apiError("User already exists. Please login!", 409);
    }

    const profilePicImage = req.files?.profilePic?.[0]?.path;
    let profile = { url: "" };

    if (profilePicImage) {
        profile = await uploadImageToCloudinary(profilePicImage);
    }

    const newUser = await User.create({
        name,
        email,
        password,
        phoneNumber: phoneNumber || "",
        profilePic: profile.url
    });

    const token = generateToken({ userId: newUser._id });

    // Publish UserRegistered event (non-blocking for registration response)
    publishUserRegisteredEvent(newUser).catch((error) => {
        logger.error("Failed to publish UserRegistered event:", error.message);
    });

    return res.status(201).json(
        new apiResponse("User created successfully.", 201, {
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                profilePic: newUser.profilePic
            },
            token
        })
    );
});

// Login Controller
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new apiError("Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new apiError("User not found. Please register!", 404);
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
        throw new apiError("Incorrect password. Try again!", 401);
    }

    const token = generateToken({ userId: user._id });

    return res.status(200).json(
        new apiResponse("Login successful", 200, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber
            },
            token
        })
    );
});

// Update User Profile Controller
const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, email, phoneNumber } = req.body;

    if ([name, email].some((field) => field?.trim() === "")) {
        throw new apiError("Name and email are required", 400);
    }

    const updateUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name,
                email,
                ...(phoneNumber !== undefined && { phoneNumber })
            }
        },
        { new: true }
    );

    return res.status(200).json(new apiResponse("Updated successfully", 200, updateUser));
});

// Get User Profile Controller
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new apiError("User not found", 404);
    }

    return res.status(200).json(
        new apiResponse("User profile fetched successfully", 200, user)
    );
});

// Logout user
const LogoutUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiResponse("Logged out successfully", 200, null));
});

// Forgot Password Controller
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email?.trim()) {
        throw new apiError("Email is required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(200).json(
            new apiResponse("If the email exists, a reset link has been sent.", 200)
        );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    try {
        await sendPasswordResetEmail(user.email, resetToken, resetUrl);
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new apiError("Failed to send password reset email", 500);
    }

    return res.status(200).json(
        new apiResponse("If the email exists, a reset link has been sent.", 200)
    );
});

// Reset Password Controller
const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword?.trim()) {
        throw new apiError("Token and new password are required", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    }).select("+resetPasswordToken +resetPasswordExpires +password");

    if (!user) {
        throw new apiError("Invalid or expired reset token", 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json(new apiResponse("Password reset successful", 200));
});

export {
    registerUser,
    getUserProfile,
    loginUser,
    updateUserProfile,
    LogoutUser,
    forgotPassword,
    resetPassword
};
