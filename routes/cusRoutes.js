import { getFeaturedProducts, searchProducts, getProductDetails, addToCart, getCart, removeFromCart, placeOrder, getOrderHistory } from "../controllers/customerController.js";
import express from 'express'
import authorizeRole from "../middlewares/roleMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";


const cusRouter = express.Router()


cusRouter.get('/products/featured', getFeaturedProducts);
cusRouter.get('/products/search', searchProducts);
cusRouter.get('/products/:id', getProductDetails);

cusRouter.post('/cart',authMiddleware,addToCart);
cusRouter.get('/cart',authMiddleware, getCart);
cusRouter.delete('/cart/:productId', authMiddleware,removeFromCart);

cusRouter.post('/order',authMiddleware, placeOrder);
cusRouter.get('/orders',authMiddleware, getOrderHistory);


export default cusRouter