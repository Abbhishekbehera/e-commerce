import {adminDashboard,viewOrders,blacklistProducts } from "../controllers/adminController.js";
import express from 'express'
import authorizeRole from "../middlewares/roleMiddleware.js";
const adminRouter=express.Router()


adminRouter.use(authorizeRole('admin'))

//View orders
adminRouter.get('/orders',viewOrders)

//Blacklist Products
adminRouter.post('/blacklists',blacklistProducts)

//Admin Dashboard
adminRouter.get('/dashboard',adminDashboard)



export default adminRouter