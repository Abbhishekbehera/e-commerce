import express from "express";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { uploadImageToCloudinary } from "../utils/fileUpload.js";

//Create Product Controller
const createProduct = asyncHandler(async (req, res) => {
    const { productName,
        productDescription,
        productPrice,
        productCategory,
        stock } = req.body;
    if ([productName, productDescription, productPrice, productCategory, stock].some((f) => {
        return String(f)?.trim() === ""
    })) {
        throw new apiError("All fields are required in order to create a product.", 400)
    }
    const productImageUrl = req.files?.productImageUrl?.[0]?.path;
    let productImage = { url: "" };
    if (productImageUrl) {
        productImage = await uploadImageToCloudinary(productImageUrl);
    }
    const newProduct = await Product.create({
        productName,
        productDescription,
        productPrice,
        productCategory,
        stock,
        productImage: productImage.url
    })
    return res.status(201).json(new apiResponse("Product created successfully.", 201, newProduct))
})

// Get All Products Controller
const getAllProducts = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if (page < 1) {
        page = 1;
    }
    let max_limit = 100;
    if (limit > max_limit) {
        limit = max_limit;
    }
    let skip = (page - 1) * limit;
    const products = await Product.find().sort({ _id: -1 }).skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    return res.status(200).json(new apiResponse("Products retrieved successfully.", 200, {
        products,
        pagination: {
            totalProducts,
            totalPages,
            currentPage: page,
            pageSize: limit
        }
    }))
})

//Bulk Products Controller
const getBulkProducts = asyncHandler(async (req, res) => {
    const { productIds } = req.body;

    if (!productIds || productIds.length === 0) {
        throw new apiError(400, "productIds required");
    }

    const products = await Product.find({
        _id: { $in: productIds }
    });

    res.status(200).json(products);
});

//Stock Deduction Controller
const bulkDeductStock = asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
        throw new apiError(400, "Items required");
    }

    for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product) {
            throw new apiError(404, `Product not found: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
            throw new apiError(400, `${product.name} out of stock`);
        }
    }

    for (const item of items) {
        await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } },
            { new: true }
        );
    }

    res.status(200).json({ message: "Stock deducted successfully" });
});

//Get All Products By Category Controller
const getAllProductsByCategory = asyncHandler(async (req, res) => {
    let { productCategory, page = 1, limit = 10 } = req.query;
    if (!productCategory) {
        throw new apiError("Product category is required to filter products.", 400)
    }
    page = parseInt(page);
    limit = parseInt(limit);
    if (page < 1) {
        page = 1;
    }
    let max_limit = 100;
    if (limit > max_limit) {
        limit = max_limit;
    }
    let skip = (page - 1) * limit;
    const products = await Product.find({ productCategory }).sort({ _id: -1 }).skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments({ productCategory });
    const totalPages = Math.ceil(totalProducts / limit);
    return res.status(200).json(new apiResponse("Products retrieved successfully according to category.", 200, {
        products,
        pagination: {
            totalProducts,
            totalPages,
            currentPage: page,
            pageSize: limit
        }
    }))
})

//Get Single Product Controller
const getSingleProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new apiError("Invalid product id.", 400)
    }
    const product = await Product.findById(id);
    if (!product) {
        throw new apiError("Product not found with the given id.", 404)
    }
    return res.status(200).json(new apiResponse("Product retrieved successfully.", 200, product))
})


//Update Product Details Controller
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new apiError("Invalid product id.", 400)
    }
    const product = await Product.findById(id)
    if (!product) {
        throw new apiError("Product not found with the given id.", 404)
    }
    const { productName,
        productDescription,
        productPrice,
        productCategory } = req.body;
    if ([productName, productDescription, productPrice, productCategory].some((f) => {
        return String(f)?.trim() === ""
    })) {
        throw new apiError("All fields are required in order to update a product.", 400)
    }
    const updatedPorduct = await Product.findByIdAndUpdate(id, {
        $set: {
            productName,
            productDescription,
            productPrice,
            productCategory
        }
    }, { new: true })
    return res.status(200).json(new apiResponse("Product details updated successfully.", 200, updatedPorduct))
})

//Delete Product Controller
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new apiError("Invalid product id.", 400)
    }
    const product = await Product.findById(id)
    if (!product) {
        throw new apiError("Product not found with the given id.", 404)
    }
    const deletedProduct = await Product.findByIdAndDelete(id);
    return res.status(200).json(new apiResponse("Product deleted successfully.", 200, deletedProduct))
})

export {
    createProduct,
    getAllProducts,
    bulkDeductStock,
    getBulkProducts,
    getSingleProduct,
    getAllProductsByCategory,
    updateProduct,
    deleteProduct
}
