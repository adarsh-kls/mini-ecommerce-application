const { body } = require("express-validator");

const productValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ min: 2, max: 150 })
        .withMessage("Product name must be between 2 and 150 characters"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Product description is required")
        .isLength({ max: 5000 })
        .withMessage("Description is too long"),

    body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a non-negative number"),

    body("stock")
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),
];

module.exports = {
    productValidator,
};