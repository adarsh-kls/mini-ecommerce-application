const User = require("../models/User");
const Product = require("../models/products");
const Order = require("../models/Order");

// Get all users with search, role filter, pagination & aggregated spend
const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

    const query = {};

    if (role && role !== "All") {
      query.role = role;
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      query.$or = [
        { name: { $regex: trimmed, $options: "i" } },
        { email: { $regex: trimmed, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limitNum) || 1;

    // Aggregate user order stats
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const orderStats = await Order.aggregate([
          { $match: { user: u._id } },
          {
            $group: {
              _id: null,
              orderCount: { $sum: 1 },
              totalSpent: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0],
                },
              },
            },
          },
        ]);

        return {
          ...u.toObject(),
          orderCount: orderStats.length > 0 ? orderStats[0].orderCount : 0,
          totalSpent: orderStats.length > 0 ? orderStats[0].totalSpent : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      totalUsers,
      totalPages,
      currentPage: parseInt(page),
      users: usersWithStats,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single user profile & order history
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userOrders = await Order.find({ user: id }).sort({ createdAt: -1 });

    const totalSpent = userOrders
      .filter((o) => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        orders: userOrders,
        totalOrdersCount: userOrders.length,
        totalSpent,
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const currentAdminId = (req.user._id || req.user.id).toString();

    // Prevent self demotion
    if (currentAdminId === id && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot demote your own admin account.",
      });
    }

    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete user safely
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentAdminId = (req.user._id || req.user.id).toString();

    // Prevent self deletion
    if (currentAdminId === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Dashboard statistics with MongoDB aggregation
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Order status counts aggregation
    const statusCountsAgg = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Confirmed: 0,
    };
    statusCountsAgg.forEach((item) => {
      if (item._id && Object.prototype.hasOwnProperty.call(statusCounts, item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    // Total revenue aggregation
    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Sales and orders timeline
    const salesOverTimeRaw = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0],
            },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    const salesOverTime = salesOverTimeRaw.map((item) => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders,
    }));

    // Order status distribution
    const orderStatusDistribution = Object.keys(statusCounts).map((key) => ({
      name: key,
      value: statusCounts[key],
    }));

    // Top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Recent 5 Orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 Users
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    // Low stock products (stock <= 10)
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
      .sort({ stock: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders: statusCounts.Pending,
        processingOrders: statusCounts.Processing,
        shippedOrders: statusCounts.Shipped,
        deliveredOrders: statusCounts.Delivered,
        cancelledOrders: statusCounts.Cancelled,
        salesOverTime,
        orderStatusDistribution,
        topSellingProducts,
        recentOrders,
        recentUsers,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getDashboardStats,
};