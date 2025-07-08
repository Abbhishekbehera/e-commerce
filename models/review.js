import mongoose, { modelNames } from "mongoose";

const reviewSchema = new mongoose.Schema({
    userReview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    Comment: String,
    rating: Number
})


const review = new mongoose.model('review', reviewSchema)

export default review