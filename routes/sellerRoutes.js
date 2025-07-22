import { sellerDashboard,createProduct, updateProduct, deleteProduct,getOrders,getPendingOrders,getDeliveredOrders } from "../controllers/sellerController.js";
import productLimit from "../middlewares/productLimit.js";
import express from 'express'
import authorizeRole from "../middlewares/roleMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js"
import multer from 'multer';
const upload = multer(); 


const sellerRouter=express.Router()

//Authorization

//Product Routes
sellerRouter.post('/products',authMiddleware,authorizeRole('seller'),productLimit,upload.none(),createProduct)
sellerRouter.put('/products/:id',authMiddleware,updateProduct)
sellerRouter.delete('/products/:id',authMiddleware,deleteProduct)

//Order Routes
sellerRouter.get('/orders/received',authMiddleware,getOrders)
sellerRouter.get('/orders/pending',authMiddleware,getPendingOrders)
sellerRouter.get('/orders/delivered',authMiddleware,getDeliveredOrders)

//Dashboard Seller
sellerRouter.get('/dashboard',authMiddleware,sellerDashboard)


export default sellerRouter