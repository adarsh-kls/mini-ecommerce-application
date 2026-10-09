require('dotenv').config();
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const validateEnv = require("./config/env");
validateEnv();
const app = express();
const mongoSanitize = require("./middleware/mongoSanitizer");
const errorHandler = require("./middleware/errorMiddleware");
// Security headers
app.use(helmet());

// CORS
const allowedOrigin =
    process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : process.env.FRONTEND_URL ||
        "http://localhost:5173";

app.use(
    cors({
        origin: allowedOrigin,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "1mb",
}));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

app.use("/api", apiLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later.",
    },
});
app.use(mongoSanitize);


const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const categoryRoutes = require("./routes/categoryRoutes");


app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/address', addressRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `API route ${req.method} ${req.originalUrl} not found`,
    });
});

app.use(errorHandler);

app.get('/', (req, res) => {
    res.json({
        message: "Server is running",
        status: "success"
    });
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer().catch((error) => {
    console.error("Server failed to start");
    console.error(error.message);
    process.exit(1);
});
