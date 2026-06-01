import { Router } from "express";
import {
    sendWelcomeNotification,
    sendOrderNotification,
    sendPaymentNotification,
    sendShipmentNotification
} from "../controllers/notification.controller.js";

const notificationRouter = Router();

notificationRouter.route("/welcome").post(sendWelcomeNotification);
notificationRouter.route("/order-confirmation").post(sendOrderNotification);
notificationRouter.route("/payment-confirmation").post(sendPaymentNotification);
notificationRouter.route("/shipment").post(sendShipmentNotification);

export default notificationRouter;
