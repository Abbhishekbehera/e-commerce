import { Router } from "express";
import {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    getUserPayments,
    refundPayment
} from "../controllers/payment.controller.js";
import verifyJWT from "../middlewares/verifyToken.js";

const paymentRouter = Router();

paymentRouter.route("/create-intent").post(verifyJWT, createPaymentIntent);
paymentRouter.route("/confirm").post(verifyJWT, confirmPayment);
paymentRouter.route("/status/:orderId").get(verifyJWT, getPaymentStatus);
paymentRouter.route("/user/:userId").get(verifyJWT, getUserPayments);
paymentRouter.route("/refund").post(verifyJWT, refundPayment);

export default paymentRouter;
