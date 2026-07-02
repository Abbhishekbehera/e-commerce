import { Router } from "express";
import {
    sendWelcomeNotification,
    sendOrderNotification,
    sendPaymentNotification,
    sendCancellationNotification,
    sendPasswordResetNotification,
    healthCheck
} from "../controllers/notification.controller.js";

const notificationRouter = Router();

notificationRouter.route("/health").get(healthCheck);
notificationRouter.route("/welcome").post(sendWelcomeNotification);
notificationRouter.route("/order-confirmation").post(sendOrderNotification);
notificationRouter.route("/payment-confirmation").post(sendPaymentNotification);
notificationRouter.route("/order-cancellation").post(sendCancellationNotification);
notificationRouter.route("/password-reset").post(sendPasswordResetNotification);

export default notificationRouter;
