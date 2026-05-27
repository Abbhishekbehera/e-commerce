import { Router } from "express";
import {
        loginUser,
        registerUser,
        updateUserProfile,
        getUserProfile,
        LogoutUser
} from "../controllers/user.controller.js"
import verifyJWT from "../middlewares/verifyToken.js"
import upload from "../middlewares/multer.middleware.js";

const userRouter = Router()

userRouter.route("/login").post(loginUser)

userRouter.route("/register").post(
        upload.fields([
                {
                        name: "profilePic",
                        maxCount: 1
                }
        ]),
        registerUser)

userRouter.route("/profile").put(
        verifyJWT, updateUserProfile)

userRouter.route("/profile").get(
        verifyJWT, getUserProfile)

userRouter.route("/logout").post(
        verifyJWT, LogoutUser)

export default userRouter;
