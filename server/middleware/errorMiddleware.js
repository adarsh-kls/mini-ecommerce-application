const errorHandler = (err, req, res, next) => {
    console.error("Server Error:", err);

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(
            (error) => error.message
        );

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid resource ID",
        });
    }

    // Duplicate MongoDB field
    if (err.code === 11000) {
        const fields = Object.keys(err.keyPattern || {});

        return res.status(409).json({
            success: false,
            message: `Duplicate value for: ${fields.join(", ")}`,
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Authentication token has expired",
        });
    }

    // Explicit application errors
    const statusCode = err.statusCode || err.status || 500;

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? "Internal server error"
                : err.message || "Request failed",
    });
};

module.exports = errorHandler;