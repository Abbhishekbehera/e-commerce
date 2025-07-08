import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    shippingAddress: {
        Street: String,
        city: String,
        zipcode: String,
        country: String
    },
    orderItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        quantity: Number
    }],
    status: {
        type: String,
        enum: ['Pending', 'Delivered'],
        default: 'Pending'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }

})

const order = new mongoose.model('order', orderSchema)


export default order