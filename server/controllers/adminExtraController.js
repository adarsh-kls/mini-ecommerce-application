const AuditLog = require("../models/AuditLog");
const Settings = require("../models/Settings");
const Notification = require("../models/notifications");
const Product = require("../models/products");
const Order = require("../models/Order");
const logAudit = require("../utils/logAudit");

// GET AUDIT LOGS
const getAuditLogs = async (req, res) => {
  try {
    const { action, page = 1, limit = 15 } = req.query;

    const query = {};
    if (action && action !== "All") {
      query.action = action;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const logs = await AuditLog.find(query)
      .populate("admin", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalLogs = await AuditLog.countDocuments(query);
    const totalPages = Math.ceil(totalLogs / limitNum) || 1;

    res.status(200).json({
      success: true,
      logs,
      totalLogs,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ADMIN SYSTEM NOTIFICATIONS
const getAdminNotifications = async (req, res) => {
  try {
    // 1. Fetch system notifications from DB
    const dbNotifications = await Notification.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // 2. Aggregate active low stock alerts (< 10)
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
      .select("name stock image")
      .limit(5);

    // 3. Aggregate pending orders count
    const pendingOrdersCount = await Order.countDocuments({ orderStatus: "Pending" });

    res.status(200).json({
      success: true,
      notifications: dbNotifications,
      alerts: {
        lowStockProducts,
        pendingOrdersCount,
      },
    });
  } catch (error) {
    console.error("Get admin notifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SYSTEM SETTINGS
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE SYSTEM SETTINGS
const updateSettings = async (req, res) => {
  try {
    const {
      storeName,
      supportEmail,
      currencySymbol,
      shippingFee,
      freeShippingThreshold,
      maintenanceMode,
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (storeName !== undefined) settings.storeName = storeName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;
    if (shippingFee !== undefined) settings.shippingFee = Number(shippingFee);
    if (freeShippingThreshold !== undefined)
      settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);

    await settings.save();

    const adminId = req.user._id || req.user.id;
    await logAudit({
      adminId,
      action: "SETTINGS_UPDATED",
      details: `Updated store settings (Store: ${settings.storeName}, Maintenance: ${settings.maintenanceMode})`,
      req,
    });

    res.status(200).json({
      success: true,
      message: "System settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAuditLogs,
  getAdminNotifications,
  getSettings,
  updateSettings,
};
