import { Router } from "express";
import { body } from "express-validator";
import {
    loginUser,
    registerUser,
    updateUserProfile,
    getUserProfile,
    LogoutUser,
    forgotPassword,
    resetPassword
} from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/verifyToken.js";
import upload from "../middlewares/multer.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";

const userRouter = Router();

const registerValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phoneNumber").optional().trim()
];

const loginValidation = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
];

userRouter.route("/login").post(loginValidation, validateRequest, loginUser);

userRouter.route("/register").post(
    upload.fields([{ name: "profilePic", maxCount: 1 }]),
    registerValidation,
    validateRequest,
    registerUser
);

userRouter.route("/profile").put(verifyJWT, updateUserProfile);
userRouter.route("/profile").get(verifyJWT, getUserProfile);
userRouter.route("/logout").post(verifyJWT, LogoutUser);

userRouter.route("/forgot-password").post(
    body("email").isEmail().withMessage("Valid email is required"),
    validateRequest,
    forgotPassword
);

userRouter.route("/reset-password").post(
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    validateRequest,
    resetPassword
);

export default userRouter;
