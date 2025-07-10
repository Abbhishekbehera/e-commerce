import { createProduct, updateProduct, deleteProduct } from "../controllers/sellerController.js";
import productLimit from "../middlewares/productLimit.js";
import express from 'express'




const sellerRouter=express.Router()

//Seller Routes
sellerRouter.post('/products',productLimit,createProduct)
sellerRouter.put('/products/:id',updateProduct)
sellerRouter.delete('/products/:id',deleteProduct)