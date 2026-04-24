import { Router } from "express";

const userRouter = Router()

userRouter.route("/user/login").post()
userRouter.route("/user/register").post()