// Importing modules ==>
import mongoose from "mongoose";
import dotenv from 'dotenv'

// Models ==>
import user from '../models/user.js'
import product from '../models/product.js'
import order from '../models/order.js'
import review from "../models/review.js";
import cart from "../models/cart.js";

// Environmental Variable ==>
dotenv.config()

// Database Connection
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log('Connected To MongoDB')
    }
    catch (e) {
        console.log(e);
    }
}

export default connectDb