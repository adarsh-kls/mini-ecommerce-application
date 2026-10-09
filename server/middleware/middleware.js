const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is required");
    }

    return process.env.JWT_SECRET;
};

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing",
            });
        }

        const decoded = jwt.verify(token, getJwtSecret());

        const userId = decoded.id || decoded._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

module.exports = protect;