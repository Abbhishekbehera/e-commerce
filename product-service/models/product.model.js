import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [true, "Product name is required."],
        trim: true
    },
    productDescription: {
        type: String,
        required: [true, "Product description is required."],
        trim: true
    },
    productImage: {
        type: String,
        default: ""
    },
    productPrice: {
        type: Number,
        required: [true, "Product price is required."],
        min: [0, "Product price cannot be negative."]
    },
    productCategory: {
        type: String,
        required: [true, "Product category is required."],
        trim: true,
        enum: {
            type: String,
            values: ["Electronics",
                "Clothing",
                "Books",
                "Home & Kitchen",
                "Sports",
                "Toys & Games",
                "Health & Personal Care",
                "Automotive",
                "Beauty", "Grocery"],
            message: "Category must be one of the following: Electronics, Clothing, Books, Home & Kitchen, Sports, Toys & Games, Health & Personal Care, Automotive, Beauty, Grocery."
        }
    },
    stock: {
        type: Number,
        required: [true, "Stock quantity is required."],
        min: [0, "Stock quantity cannot be negative."]
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;