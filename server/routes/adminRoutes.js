const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getDashboardStats,
} = require("../controllers/adminController");

const {
  getAuditLogs,
  getAdminNotifications,
  getSettings,
  updateSettings,
} = require("../controllers/adminExtraController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.get("/users", protect, admin, getAllUsers);
router.get("/users/:id", protect, admin, getUserDetails);
router.put("/users/:id/role", protect, admin, updateUserRole);
router.delete("/users/:id", protect, admin, deleteUser);

router.get("/stats", protect, admin, getDashboardStats);

router.get("/audit-logs", protect, admin, getAuditLogs);
router.get("/notifications", protect, admin, getAdminNotifications);
router.get("/settings", protect, admin, getSettings);
router.put("/settings", protect, admin, updateSettings);

module.exports = router;