const mongoSanitize = require('express-mongo-sanitize');

const sanitizeMiddleware = (req, res, next) => {
    try {
        if (req.body) {
            req.body = mongoSanitize.sanitize(req.body);
        }
        if (req.params) {
            req.params = mongoSanitize.sanitize(req.params);
        }
        if (req.query) {
            // Express 5 makes req.query a getter, so we redefine the property
            Object.defineProperty(req, 'query', {
                value: mongoSanitize.sanitize(req.query),
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
    } catch (err) {
        console.error("Sanitization error:", err);
    }
    next();
};

module.exports = sanitizeMiddleware;
