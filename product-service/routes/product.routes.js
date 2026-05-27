import {
    createProduct,
    getBulkProducts,
    bulkDeductStock,
    getAllProducts,
    getAllProductsByCategory,
    getSingleProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";
import { Router } from "express";
import upload from "../middlewares/multer.middlerware.js";

const productRouter = Router();

productRouter.route("/create-product").post(
    upload.fields({
        name: "productImage",
        maxCount: 3
    }), createProduct);

productRouter.route("/").get(getAllProducts);

productRouter.route("/product/:id").get(getSingleProduct);

productRouter.route("/product/:id").put(updateProduct);

productRouter.route("/product/:id").delete(deleteProduct);

productRouter.route("/bulk").post(getBulkProducts);

productRouter.route("/bulk-deduct").post(bulkDeductStock)

export default productRouter;