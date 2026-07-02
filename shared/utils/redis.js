import { createClient } from 'redis';
import logger from './logger.js';

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    // Connect to Redis
    async connect() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
            this.client = createClient({ url: redisUrl });

            this.client.on('error', (err) => {
                logger.error('Redis Client Error:', err.message);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                logger.info('Connected to Redis');
                this.isConnected = true;
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            logger.error('Failed to connect to Redis:', error.message);
            throw error;
        }
    }

    // Get value from cache
    async get(key) {
        if (!this.isConnected) {
            return null;
        }

        try {
            const value = await this.client.get(key);
            if (value) {
                logger.debug(`Cache hit: ${key}`);
                return JSON.parse(value);
            }
            logger.debug(`Cache miss: ${key}`);
            return null;
        } catch (error) {
            logger.error(`Error getting from cache (${key}):`, error.message);
            return null;
        }
    }

    // Set value in cache with TTL
    async set(key, value, ttl = 3600) {
        if (!this.isConnected) {
            return false;
        }

        try {
            await this.client.setEx(key, ttl, JSON.stringify(value));
            logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
            return true;
        } catch (error) {
            logger.error(`Error setting cache (${key}):`, error.message);
            return false;
        }
    }

    // Delete key from cache
    async del(key) {
        if (!this.isConnected) {
            return false;
        }

        try {
            const result = await this.client.del(key);
            logger.debug(`Cache deleted: ${key}`);
            return result;
        } catch (error) {
            logger.error(`Error deleting from cache (${key}):`, error.message);
            return false;
        }
    }

    // Delete multiple keys matching pattern
    async delPattern(pattern) {
        if (!this.isConnected) {
            return 0;
        }

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                logger.debug(`Cache pattern deleted: ${pattern} (${keys.length} keys)`);
            }
            return keys.length;
        } catch (error) {
            logger.error(`Error deleting cache pattern (${pattern}):`, error.message);
            return 0;
        }
    }

    // Check if key exists
    async exists(key) {
        if (!this.isConnected) {
            return false;
        }

        try {
            const result = await this.client.exists(key);
            return result > 0;
        } catch (error) {
            logger.error(`Error checking cache key (${key}):`, error.message);
            return false;
        }
    }

    // Clear all cache
    async flush() {
        if (!this.isConnected) {
            return false;
        }

        try {
            await this.client.flushDb();
            logger.info('Cache flushed');
            return true;
        } catch (error) {
            logger.error('Error flushing cache:', error.message);
            return false;
        }
    }

    // Close connection
    async close() {
        try {
            if (this.client) {
                await this.client.quit();
                logger.info('Redis connection closed');
                this.isConnected = false;
            }
        } catch (error) {
            logger.error('Error closing Redis connection:', error.message);
        }
    }
}

export default new RedisService();
