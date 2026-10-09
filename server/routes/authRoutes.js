const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getCurrentUser,
} = require("../controllers/authController");

const protect = require("../middleware/middleware");

const {
    registerValidator,
    loginValidator,
} = require("../validators/authValidator");

const { validateRequest } = require("../validators/commonValidator");

router.post(
    "/register",
    registerValidator,
    validateRequest,
    registerUser
);

router.post(
    "/login",
    loginValidator,
    validateRequest,
    loginUser
);

router.get("/me", protect, getCurrentUser);

module.exports = router;