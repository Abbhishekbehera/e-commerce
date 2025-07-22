import {adminDashboard,viewOrders,blacklistProducts } from "../controllers/adminController.js";
import express from 'express'
import authorizeRole from "../middlewares/roleMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const adminRouter=express.Router()




//View orders
adminRouter.get('/orders',authMiddleware,viewOrders)

//Blacklist Products
adminRouter.post('/blacklists',authMiddleware,blacklistProducts)

//Admin Dashboard
adminRouter.get('/dashboard',authMiddleware,adminDashboard)



export default adminRouter