const express = require("express");

const router = express.Router();

const {
  createReview,
  getProductReviews,
  getAllReviews,
  deleteReview,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Admin routes
router.get("/admin/all", protect, admin, getAllReviews);
router.delete("/admin/:id", protect, admin, deleteReview);

// Public / Customer routes
router.post("/:productId", protect, createReview);
router.get("/:productId", getProductReviews);

module.exports = router;