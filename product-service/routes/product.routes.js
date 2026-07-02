import {
    createProduct,
    getBulkProducts,
    bulkDeductStock,
    getAllProducts,
    getAllProductsByCategory,
    getCategories,
    getFeaturedProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";
import { Router } from "express";
import upload from "../middlewares/multer.middlerware.js";
import {
    cacheProductList,
    cacheProductDetails,
    cacheCategories,
    cacheCategoryProducts,
    cacheFeaturedProducts
} from "../middlewares/cache.middleware.js";

const productRouter = Router();

productRouter.route("/create-product").post(
    upload.fields({
        name: "productImageUrl",
        maxCount: 3
    }),
    createProduct
);

productRouter.route("/").get(cacheProductList, getAllProducts);
productRouter.route("/categories").get(cacheCategories, getCategories);
productRouter.route("/featured").get(cacheFeaturedProducts, getFeaturedProducts);
productRouter.route("/product/:id").get(cacheProductDetails, getSingleProduct);
productRouter.route("/product/:id").put(updateProduct);
productRouter.route("/product/:id").delete(deleteProduct);
productRouter.route("/category/:category").get(cacheCategoryProducts, getAllProductsByCategory);
productRouter.route("/bulk").post(getBulkProducts);
productRouter.route("/bulk-deduct").post(bulkDeductStock);

export default productRouter;
