import { sellerDashboard,createProduct, updateProduct, deleteProduct,getOrders,getPendingOrders,getDeliveredOrders } from "../controllers/sellerController.js";
import productLimit from "../middlewares/productLimit.js";
import express from 'express'
import authorizeRole from "../middlewares/roleMiddleware.js";



const sellerRouter=express.Router()

//Authorization
sellerRouter.use(authorizeRole('Seller'))

//Product Routes
sellerRouter.post('/products',productLimit,createProduct)
sellerRouter.put('/products/:id',updateProduct)
sellerRouter.delete('/products/:id',deleteProduct)

//Order Routes
sellerRouter.get('/orders/received',getOrders)
sellerRouter.get('/orders/pending',getPendingOrders)
sellerRouter.get('/orders/delivered',getDeliveredOrders)

//Dashboard Seller
sellerRouter.get('/dashboard',sellerDashboard)


export default sellerRouter