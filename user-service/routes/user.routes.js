import { Router } from "express";
import {loginUser, 
        registerUser,
        updateUserProfile,
        getUserProfile} 
        from "../controllers/user.controller.js"
import verifyJWT from "../middleware/verifyToken.js"

const userRouter = Router()

userRouter.route("/user/login").post(loginUser)
userRouter.route("/user/register").post(registerUser)
userRouter.route("/user/profile").put(verifyJWT, updateUserProfile)
userRouter.route("/user/profile").get(verifyJWT, getUserProfile)

export default userRouter;
