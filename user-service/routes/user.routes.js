import { Router } from "express";
import {loginUser, 
        registerUser,
        updateUserProfile,
        getUserProfile,
        LogoutUser} 
        from "../controllers/user.controller.js"
import verifyJWT from "../middlewares/verifyToken.js"
import upload from "../middlewares/multer.middleware.js";

const userRouter = Router()

userRouter.route("/user/login").post(loginUser)

userRouter.route("/user/register").post(
        upload.fields([
        {
            name: "profilePic",
            maxCount: 1
        }
    ]),
        registerUser)

userRouter.route("/user/profile").put(
        verifyJWT, updateUserProfile)

userRouter.route("/user/profile").get(
        verifyJWT, getUserProfile)

userRouter.route("/user/logout").post(
        verifyJWT, LogoutUser)

export default userRouter;
