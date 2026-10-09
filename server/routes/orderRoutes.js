const express = require("express");

const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post("/", protect, createOrder);
router.get("/admin/all", protect, admin, getAllOrders);

router.put("/admin/:id", protect, admin, updateOrderStatus);

router.get("/", protect, getMyOrders);

router.get("/:id", protect, getOrderById);

router.put("/:id/cancel", protect, cancelOrder);


module.exports = router;