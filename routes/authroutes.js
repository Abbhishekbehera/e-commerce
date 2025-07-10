import { login,register } from "../controllers/authController.js";
import express from 'express'
import rateLimiter from '../middlewares/rateLimitMiddleware.js'

const authRouter=express.Router()

// Login ==>
authRouter.post('/login',rateLimiter,login)

// Register ==>
authRouter.post('/register',register)


export default authRouter
