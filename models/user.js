import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Seller', 'Customer'],
        default: 'Customer'
    },
    address: {
        Street: String,
        city: String,
        zipcode: String,
        country: String
    },
    carts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cart'
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cart'
    }]
})

const user = new mongoose.model('user', userSchema)

export default user