import dotenv from "dotenv";
dotenv.config();
import amqp from 'amqplib';
import logger from './logger.js';

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.exchangeName = process.env.RABBITMQ_EXCHANGE || 'ecommerce_exchange';
    }
    // Connect to RabbitMQ
async connect() {
    if (this.connection) {
        return this.channel;
    }

    try {
        const rabbitmqUrl =  process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";

        console.log("Connecting to:", rabbitmqUrl);

        this.connection = await amqp.connect(rabbitmqUrl);
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange(
            this.exchangeName,
            "topic",
            { durable: true }
        );

        // Connection events
        this.connection.on("error", (err) => {
            console.error("RabbitMQ connection error:", err.message);
        });

        this.connection.on("close", () => {
            console.log("RabbitMQ connection closed");

            this.connection = null;
            this.channel = null;

            setTimeout(() => this.connect(), 5000);
        });

        // Channel events
        this.channel.on("error", (err) => {
            console.error("RabbitMQ channel error:", err.message);
        });

        this.channel.on("close", () => {
            console.log("RabbitMQ channel closed");
        });

        logger.info("Connected to RabbitMQ successfully");

        return this.channel;

    } catch (error) {
        console.error("RabbitMQ connect failed:", error.message);

        this.connection = null;
        this.channel = null;

        setTimeout(() => this.connect(), 5000);
    }
}
    // Subscribe to event
    async subscribeToEvent(eventName, callback) {
        if (!this.channel) {
            logger.error('RabbitMQ channel is not initialized');
            return;
        }

        try {
            const routingKey = `event.${eventName}`;
            const queueName = `${eventName}_queue`;

            // Declare queue
            await this.channel.assertQueue(queueName, { durable: true });

            // Bind queue to exchange
            await this.channel.bindQueue(queueName, this.exchangeName, routingKey);

            // Consume messages
            await this.channel.consume(queueName, async (msg) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        logger.info(`Event received: ${eventName}`, { data: content });

                        // Execute callback with retry logic
                        try {
                            await callback(content);
                            this.channel.ack(msg);
                        } catch (error) {
                            logger.error(`Error processing event ${eventName}:`, error.message);
                            // Requeue message on error
                            this.channel.nack(msg, false, true);
                        }
                    } catch (error) {
                        logger.error('Failed to parse message:', error.message);
                        this.channel.ack(msg);
                    }
                }
            }, { noAck: false });

            logger.info(`Subscribed to event: ${eventName}`);
        } catch (error) {
            logger.error(`Failed to subscribe to event ${eventName}:`, error.message);
        }
    }

    // Close connection
    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            logger.info('RabbitMQ connection closed');
        } catch (error) {
            logger.error('Error closing RabbitMQ connection:', error.message);
        }
    }
}

export default new RabbitMQService();
