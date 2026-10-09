const { body } = require("express-validator");

const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email")
        .normalizeEmail(),

    body("password")
        .isString()
        .withMessage("Password must be a string")
        .isLength({ min: 6, max: 128 })
        .withMessage("Password must be between 6 and 128 characters"),
];

const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email")
        .normalizeEmail(),

    body("password")
        .isString()
        .withMessage("Password is required")
        .notEmpty()
        .withMessage("Password is required"),
];

module.exports = {
    registerValidator,
    loginValidator,
};