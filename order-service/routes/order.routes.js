import { Router } from "express";
import {
    placeOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.route("/order").post(placeOrder);
orderRouter.route("/orders/:userId").get(getUserOrders);
orderRouter.route("/order/:userId/:id").get(getOrderById);
orderRouter.route("/order/:id/status").put(updateOrderStatus);
orderRouter.route("/order/:id").delete(cancelOrder);
export default orderRouter;