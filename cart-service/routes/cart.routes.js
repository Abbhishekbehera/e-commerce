import { Router } from "express";
import {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart
} from "../controllers/cart.controller.js";
import verifyJWT from "../middlewares/verifyToken.js";

const cartRouter = Router();

// All cart routes require authentication
cartRouter.use(verifyJWT);

cartRouter.route("/").get(getCart);
cartRouter.route("/add").post(addToCart);
cartRouter.route("/remove").post(removeFromCart);
cartRouter.route("/update").put(updateCartItem);
cartRouter.route("/clear").post(clearCart);

export default cartRouter;
