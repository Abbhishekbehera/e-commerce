import Cart from "../models/cart.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import axios from "axios"

// Get user's cart
const getCart = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }
    return res.status(200).json(new apiResponse("Cart retrieved successfully", 200, cart));
});

// Add item to cart
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;
    if (!productId || !quantity) {
        throw new apiError("Product ID and quantity are required", 400);
    }
    if (quantity < 1) {
        throw new apiError("Quantity must be at least 1", 400);
    }
    // Fetch product details
    const productServiceUrl = process.env.PRODUCT_SERVICE_URL;
    let product;
    try {
        const response = await axios.get(`${productServiceUrl}/product/${productId}`);
        product = response.data.data;
    } catch (error) {
        throw new apiError("Product not found or Product Service unavailable", 404);
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, items: [] });
    }
    // Check if product already in cart
    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
         existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.price;
    } else {
        cart.items.push({
            productId,
            productName: product.productName,
            price: product.productPrice,
            quantity,
            totalPrice: product.productPrice * quantity
        });
    }
    cart.calculateTotals();
    await cart.save();

    return res.status(200).json(new apiResponse("Item added to cart successfully", 200, cart));
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.userId;
    if (!productId) {
        throw new apiError("Product ID is required", 400);
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new apiError("Cart not found", 404);
    }
    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.calculateTotals();
    await cart.save();
    return res.status(200).json(new apiResponse("Item removed from cart successfully", 200, cart));
});

// Update cart item quantity
const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;
    if (!productId || !quantity) {
        throw new apiError("Product ID and quantity are required", 400);
    }
    if (quantity < 1) {
        throw new apiError("Quantity must be at least 1", 400);
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new apiError("Cart not found", 404);
    }
    const item = cart.items.find(item => item.productId === productId);
    if (!item) {
        throw new apiError("Item not found in cart", 404);
    }
    item.quantity = quantity;
    item.totalPrice = item.quantity * item.price;
    cart.calculateTotals();
    await cart.save();
    return res.status(200).json(new apiResponse("Cart item updated successfully", 200, cart));
});

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new apiError("Cart not found", 404);
    }
    cart.items = [];
    cart.calculateTotals();
    await cart.save();
    return res.status(200).json(new apiResponse("Cart cleared successfully", 200, cart));
});

export {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart
}
