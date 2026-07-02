import redisService from '../../shared/utils/redis.js';
import logger from '../../shared/utils/logger.js';

// Cache middleware for product list
const cacheProductList = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const cacheKey = `products:list:page:${page}:limit:${limit}`;

        const cachedData = await redisService.get(cacheKey);
        if (cachedData) {
            logger.debug(`Cache hit for product list - page ${page}`);
            return res.status(200).json(cachedData);
        }

        req.cacheKey = cacheKey;
        next();
    } catch (error) {
        logger.error('Error in cacheProductList middleware:', error.message);
        next();
    }
};

// Cache middleware for single product details
const cacheProductDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `product:${id}`;

        const cachedData = await redisService.get(cacheKey);
        if (cachedData) {
            logger.debug(`Cache hit for product - ${id}`);
            return res.status(200).json(cachedData);
        }

        req.cacheKey = cacheKey;
        next();
    } catch (error) {
        logger.error('Error in cacheProductDetails middleware:', error.message);
        next();
    }
};

// Cache middleware for all categories
const cacheCategories = async (req, res, next) => {
    try {
        const cacheKey = 'products:categories:list';

        const cachedData = await redisService.get(cacheKey);
        if (cachedData) {
            logger.debug('Cache hit for categories');
            return res.status(200).json(cachedData);
        }

        req.cacheKey = cacheKey;
        next();
    } catch (error) {
        logger.error('Error in cacheCategories middleware:', error.message);
        next();
    }
};

// Cache middleware for products by category
const cacheCategoryProducts = async (req, res, next) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const cacheKey = `products:category:${category}:page:${page}:limit:${limit}`;

        const cachedData = await redisService.get(cacheKey);
        if (cachedData) {
            logger.debug(`Cache hit for category products - ${category}`);
            return res.status(200).json(cachedData);
        }

        req.cacheKey = cacheKey;
        next();
    } catch (error) {
        logger.error('Error in cacheCategoryProducts middleware:', error.message);
        next();
    }
};

// Cache middleware for frequently accessed / featured products
const cacheFeaturedProducts = async (req, res, next) => {
    try {
        const cacheKey = 'products:featured:list';

        const cachedData = await redisService.get(cacheKey);
        if (cachedData) {
            logger.debug('Cache hit for featured products');
            return res.status(200).json(cachedData);
        }

        req.cacheKey = cacheKey;
        next();
    } catch (error) {
        logger.error('Error in cacheFeaturedProducts middleware:', error.message);
        next();
    }
};

// Set cache after response (Cache-Aside write)
const setCacheResponse = (data, cacheKey, ttl = 3600) => {
    if (cacheKey) {
        redisService.set(cacheKey, data, ttl).catch((error) => {
            logger.error('Error setting cache:', error.message);
        });
    }
};

// Invalidate cache patterns on product update/delete
const invalidateProductCache = async (productId) => {
    try {
        await redisService.del(`product:${productId}`);
        await redisService.delPattern('products:list:*');
        await redisService.delPattern('products:featured:*');
        await redisService.delPattern('products:categories:*');
        await redisService.delPattern('products:category:*');

        logger.info(`Cache invalidated for product: ${productId}`);
    } catch (error) {
        logger.error('Error invalidating product cache:', error.message);
    }
};

// Invalidate all product caches
const invalidateAllProductCache = async () => {
    try {
        await redisService.delPattern('product:*');
        await redisService.delPattern('products:*');
        logger.info('All product caches invalidated');
    } catch (error) {
        logger.error('Error invalidating all product caches:', error.message);
    }
};

export {
    cacheProductList,
    cacheProductDetails,
    cacheCategories,
    cacheCategoryProducts,
    cacheFeaturedProducts,
    setCacheResponse,
    invalidateProductCache,
    invalidateAllProductCache
};
