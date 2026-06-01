import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
    service: process.env.SMTP_HOST,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Welcome to E-Commerce Platform",
            html: `
                <h2>Welcome ${userName}!</h2>
                <p>Thank you for registering with our e-commerce platform.</p>
                <p>Your account has been successfully created and is ready to use.</p>
                <p>You can now browse our products and place orders.</p>
                <p>Happy Shopping!</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending welcome email to ${email}:`, error);
        throw error;
    }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, orderDetails) => {
    try {
        const itemsHtml = orderDetails.items.map(item => `
            <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${item.totalPrice.toFixed(2)}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: `Order Confirmation - Order #${orderDetails.orderId}`,
            html: `
                <h2>Order Confirmation</h2>
                <p>Thank you for your order!</p>
                <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                
                <h3>Order Items:</h3>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr style="border: 1px solid #ddd;">
                        <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
                    </tr>
                    ${itemsHtml}
                </table>
                
                <h3 style="margin-top: 20px;">Order Summary:</h3>
                <p><strong>Subtotal:</strong> $${orderDetails.subtotal.toFixed(2)}</p>
                <p><strong>Tax:</strong> $${orderDetails.tax.toFixed(2)}</p>
                <p><strong>Total:</strong> $${orderDetails.total.toFixed(2)}</p>
                <p><strong>Status:</strong> ${orderDetails.status}</p>
                
                <p>We will notify you when your order ships.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending order confirmation email to ${email}:`, error);
        throw error;
    }
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (email, paymentDetails) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Payment Confirmation",
            html: `
                <h2>Payment Confirmation</h2>
                <p>Your payment has been successfully processed!</p>
                <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
                <p><strong>Order ID:</strong> ${paymentDetails.orderId}</p>
                <p><strong>Amount:</strong> $${paymentDetails.amount.toFixed(2)}</p>
                <p><strong>Status:</strong> ${paymentDetails.status}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                
                <p>Thank you for your purchase!</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Payment confirmation email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending payment confirmation email to ${email}:`, error);
        throw error;
    }
};

// Send shipment notification email
const sendShipmentNotificationEmail = async (email, shipmentDetails) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: `Your Order Has Shipped - Order #${shipmentDetails.orderId}`,
            html: `
                <h2>Your Order Has Shipped!</h2>
                <p>Great news! Your order has been shipped.</p>
                <p><strong>Order ID:</strong> ${shipmentDetails.orderId}</p>
                <p><strong>Tracking Number:</strong> ${shipmentDetails.trackingNumber || 'N/A'}</p>
                <p><strong>Estimated Delivery:</strong> ${shipmentDetails.estimatedDelivery || 'N/A'}</p>
                
                <p>You can track your shipment using the tracking number above.</p>
                <p>Thank you for shopping with us!</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Shipment notification email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending shipment notification email to ${email}:`, error);
        throw error;
    }
};

export {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail,
    sendShipmentNotificationEmail
}