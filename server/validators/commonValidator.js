const { validationResult, param } = require("express-validator");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg,
            })),
        });
    }

    next();
};

const mongoIdValidator = (field = "id") => [
    param(field)
        .isMongoId()
        .withMessage(`Invalid ${field}`),
];

module.exports = {
    validateRequest,
    mongoIdValidator,
};