import nodemailer from 'nodemailer';
import logger from './logger.js';

let transporter = null;

const getTransporter = () => {
    if (!process.env.EMAIL_USER && !process.env.SMTP_USER) {
        throw new Error('Email credentials (EMAIL_USER, EMAIL_PASS) are not configured');
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
            auth: {
                user: process.env.EMAIL_USER || process.env.SMTP_USER,
                pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD
            }
        });
    }

    return transporter;
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || process.env.SMTP_USER,
            to: email,
            subject: 'Welcome to Our E-Commerce Platform!',
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #2c3e50;">Welcome ${userName}! 👋</h2>
                            <p>Thank you for registering with our e-commerce platform.</p>
                            <p>Your account has been successfully created and is ready to use.</p>
                            
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p><strong>Next Steps:</strong></p>
                                <ul>
                                    <li>Browse our product catalog</li>
                                    <li>Add items to your cart</li>
                                    <li>Proceed with checkout</li>
                                    <li>Track your orders in real-time</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 30px;">Happy Shopping! 🛍️</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            <p style="font-size: 12px; color: #666;">If you have any questions, please contact our support team.</p>
                        </div>
                    </body>
                </html>
            `
        };

        await getTransporter().sendMail(mailOptions);
        logger.info(`Welcome email sent to ${email}`);
        return true;
    } catch (error) {
        logger.error(`Error sending welcome email to ${email}:`, error.message);
        throw error;
    }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, orderDetails) => {
    try {
        const itemsHtml = orderDetails.items.map(item => `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${item.name}</td>
                <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER || process.env.SMTP_USER,
            to: email,
            subject: `Order Confirmation - Order #${orderDetails.orderId}`,
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #2c3e50;">Order Confirmed! ✅</h2>
                            <p>Thank you for your order! We're processing it right now.</p>
                            
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p><strong>Order Details:</strong></p>
                                <p>Order ID: <strong>#${orderDetails.orderId}</strong></p>
                                <p>Order Date: <strong>${new Date(orderDetails.createdAt || Date.now()).toLocaleDateString()}</strong></p>
                                <p>Status: <strong style="color: #27ae60;">${orderDetails.status || 'Pending'}</strong></p>
                            </div>
                            
                            <h3 style="color: #2c3e50;">Order Items:</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead style="background-color: #ecf0f1;">
                                    <tr>
                                        <th style="padding: 10px; text-align: left;">Product</th>
                                        <th style="padding: 10px; text-align: center;">Quantity</th>
                                        <th style="padding: 10px; text-align: right;">Price</th>
                                        <th style="padding: 10px; text-align: right;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                            
                            <div style="background-color: #ecf0f1; padding: 15px; margin-top: 20px; border-radius: 5px;">
                                <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${orderDetails.subtotal.toFixed(2)}</p>
                                <p style="margin: 5px 0;"><strong>Shipping:</strong> $${(orderDetails.shipping || 0).toFixed(2)}</p>
                                <p style="margin: 5px 0;"><strong>Tax:</strong> $${(orderDetails.tax || 0).toFixed(2)}</p>
                                <p style="margin: 10px 0; font-size: 16px;"><strong>Total Amount:</strong> $${orderDetails.totalAmount.toFixed(2)}</p>
                            </div>
                            
                            <p style="margin-top: 30px;">We'll notify you when your order ships. Track your order on our website.</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            <p style="font-size: 12px; color: #666;">If you have any questions, please contact our support team.</p>
                        </div>
                    </body>
                </html>
            `
        };

        await getTransporter().sendMail(mailOptions);
        logger.info(`Order confirmation email sent to ${email}`);
        return true;
    } catch (error) {
        logger.error(`Error sending order confirmation email to ${email}:`, error.message);
        throw error;
    }
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (email, paymentDetails) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || process.env.SMTP_USER,
            to: email,
            subject: 'Payment Confirmation',
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #27ae60;">Payment Confirmed! 💳</h2>
                            <p>Your payment has been successfully processed.</p>
                            
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p><strong>Payment Details:</strong></p>
                                <p>Transaction ID: <strong>${paymentDetails.transactionId}</strong></p>
                                <p>Order ID: <strong>#${paymentDetails.orderId}</strong></p>
                                <p>Amount: <strong>$${paymentDetails.amount.toFixed(2)}</strong></p>
                                <p>Status: <strong style="color: #27ae60;">${paymentDetails.status}</strong></p>
                                <p>Payment Date: <strong>${new Date().toLocaleDateString()}</strong></p>
                            </div>
                            
                            <p style="margin-top: 30px;">Your order is now confirmed and will be prepared for shipment.</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            <p style="font-size: 12px; color: #666;">If you have any questions, please contact our support team.</p>
                        </div>
                    </body>
                </html>
            `
        };

        await getTransporter().sendMail(mailOptions);
        logger.info(`Payment confirmation email sent to ${email}`);
        return true;
    } catch (error) {
        logger.error(`Error sending payment confirmation email to ${email}:`, error.message);
        throw error;
    }
};

// Send order cancellation email
const sendOrderCancellationEmail = async (email, orderDetails) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || process.env.SMTP_USER,
            to: email,
            subject: `Order Cancellation - Order #${orderDetails.orderId}`,
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #e74c3c;">Order Cancelled</h2>
                            <p>Your order has been cancelled as requested.</p>
                            
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p><strong>Order Details:</strong></p>
                                <p>Order ID: <strong>#${orderDetails.orderId}</strong></p>
                                <p>Cancellation Date: <strong>${new Date().toLocaleDateString()}</strong></p>
                                <p>Reason: <strong>${orderDetails.reason || 'User Requested'}</strong></p>
                            </div>
                            
                            <p>If you had already made a payment, it will be refunded to your original payment method within 5-7 business days.</p>
                            <p style="margin-top: 30px;">We'd love to serve you again in the future!</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            <p style="font-size: 12px; color: #666;">If you have any questions, please contact our support team.</p>
                        </div>
                    </body>
                </html>
            `
        };

        await getTransporter().sendMail(mailOptions);
        logger.info(`Order cancellation email sent to ${email}`);
        return true;
    } catch (error) {
        logger.error(`Error sending order cancellation email to ${email}:`, error.message);
        throw error;
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || process.env.SMTP_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #2c3e50;">Password Reset Request</h2>
                            <p>We received a request to reset your password. Click the link below to create a new password.</p>
                            
                            <div style="margin: 30px 0;">
                                <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Reset Password
                                </a>
                            </div>
                            
                            <p>This link will expire in 1 hour.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            <p style="font-size: 12px; color: #666;">If you have any questions, please contact our support team.</p>
                        </div>
                    </body>
                </html>
            `
        };

        await getTransporter().sendMail(mailOptions);
        logger.info(`Password reset email sent to ${email}`);
        return true;
    } catch (error) {
        logger.error(`Error sending password reset email to ${email}:`, error.message);
        throw error;
    }
};

export {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail,
    sendOrderCancellationEmail,
    sendPasswordResetEmail
};
