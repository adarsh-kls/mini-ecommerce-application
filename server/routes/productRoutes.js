const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    updateProductStock,
    deleteProduct
} = require("../controllers/productcontrollers");

const protect = require("../middleware/middleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

const { mongoIdValidator, validateRequest } = require("../validators/commonValidator");

// Public routes
router.get("/", getProducts);

router.get("/:id", mongoIdValidator("id"), validateRequest, getProductById);


// Admin routes
router.post(
    "/",
    protect,
    admin,
    createProduct
);

router.put(
    "/:id",
    protect,
    admin,
    mongoIdValidator("id"),
    validateRequest,
    updateProduct
);

router.patch(
    "/:id/stock",
    protect,
    admin,
    mongoIdValidator("id"),
    validateRequest,
    updateProductStock
);

router.delete(
    "/:id",
    protect,
    admin,
    mongoIdValidator("id"),
    validateRequest,
    deleteProduct
);


module.exports = router;
