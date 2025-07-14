import { getFeaturedProducts, searchProducts, getProductDetails, addToCart, getCart, removeFromCart, placeOrder, getOrderHistory } from "../controllers/customerController.js";
import express from 'express'

const cusRouter = express.Router()

cusRouter.get('/products/featured', getFeaturedProducts);
cusRouter.get('/products/search', searchProducts);
cusRouter.get('/products/:id', getProductDetails);

cusRouter.post('/cart', addToCart);
cusRouter.get('/cart', getCart);
cusRouter.delete('/cart/:productId', removeFromCart);

cusRouter.post('/order', placeOrder);
cusRouter.get('/orders', getOrderHistory);


export default cusRouter