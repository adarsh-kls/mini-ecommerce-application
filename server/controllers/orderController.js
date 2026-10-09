const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Address = require("../models/address");
const Product = require("../models/products");
const createNotification = require("../utils/createNotifications");
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
const createOrder = async (req, res) => {
  let session;
  try {

    session = await mongoose.startSession();

    session.startTransaction();
    // Get logged-in user ID
    const userId = req.user.id || req.user._id;

    const {
      addressId,
      shippingAddress,
      paymentMethod
    } = req.body;
    // --------------------------------
    // 1. Validate address
    // --------------------------------

    if (!addressId && !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    // --------------------------------
    // 2. Find user's cart
    // --------------------------------

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // --------------------------------
    // 3. Check whether cart has items
    // --------------------------------

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // --------------------------------
    // 4. Resolve Address (from DB or inline)
    // --------------------------------

    let address = null;

    if (addressId) {
      address = await Address.findOne({
        _id: addressId,
        user: userId,
      }).lean();

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }
    } else if (shippingAddress) {
      address = shippingAddress;
    }

    // --------------------------------
    // 5. Create order items & validate stock
    // --------------------------------

    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      // Make sure populated product exists
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in the cart no longer exists",
        });
      }

      // Check current stock
      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}. Only ${product.stock} available.`,
        });
      }

      const itemSubtotal = product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // --------------------------------
    // 6. Calculate subtotal & shipping
    // --------------------------------

    const subtotal = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    const shippingFee = subtotal >= 1000 ? 0 : 50;
    const totalAmount = subtotal + shippingFee;

    // --------------------------------
    // 7. Reduce product stock in MongoDB atomically
    // --------------------------------

    for (const item of cart.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product._id,
          stock: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          returnDocument: "after",
          session,
        }
      );

      if (!updatedProduct) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock available for ${item.product.name}`,
        });
      }
    }

    

    // --------------------------------
    // 8. Create order in MongoDB
    // --------------------------------

    const [order] = await Order.create([{
      user: userId,

      items: orderItems,

      shippingAddress: {
        fullName: address.fullName || "User",
        phone: address.phone || "N/A",
        addressLine: address.addressLine || address.street || "Address Not Provided",
        city: address.city || "Unknown City",
        state: address.state || "Unknown State",
        postalCode: address.postalCode || address.zipCode || "000000",
        country: address.country || "India",
      },

      subtotal,

      shippingFee,

      totalAmount,

      orderStatus: "Pending",

      paymentStatus: "Pending",


      paymentMethod: paymentMethod || "COD",
    }],
      { session }
    );

    // --------------------------------
    // 9. Clear user's cart in MongoDB
    // --------------------------------

    await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } }, { session });
    await session.commitTransaction();
    session.endSession();

    await createNotification({
      user: order.user,
      type: "order_created",
      title: "Order Placed",
      message: "Your order has been placed successfully.",
      relatedOrder: order._id,
    });

    // --------------------------------
    // 12. Return order
    // --------------------------------

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get all orders of logged-in user
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const orders = await Order.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .populate("items.product", "name image price");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: userId,
    }).populate("items.product", "name image price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const mongoose = require("mongoose");
const User = require("../models/User");

// Admin - Get all orders with search, status filter, and pagination
const getAllOrders = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.orderStatus = status;
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      const isObjectId = mongoose.Types.ObjectId.isValid(trimmed);

      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: trimmed, $options: "i" } },
          { email: { $regex: trimmed, $options: "i" } },
        ],
      }).select("_id");

      const userIds = matchingUsers.map((u) => u._id);

      const searchConditions = [{ user: { $in: userIds } }];
      if (isObjectId) {
        searchConditions.push({ _id: trimmed });
      }

      query.$or = searchConditions;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages,
      currentPage: parseInt(page),
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin - Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const validOrderStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const validPaymentStatuses = [
      "Pending",
      "Paid",
      "Failed",
      "Refunded",
    ];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const prevStatus = order.orderStatus;

    if (orderStatus) {
      // Auto-restock stock if order is set to Cancelled
      if (orderStatus === "Cancelled" && prevStatus !== "Cancelled") {
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            if (item.product) {
              await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity },
              });
            }
          }
        }
      }

      // Auto-settle COD payment when Delivered
      if (orderStatus === "Delivered" && order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
        order.paidAt = new Date();
      }

      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === "Paid" && !order.paidAt) {
        order.paidAt = new Date();
      }
    }

    await order.save();

    // Trigger customer notification
    if (orderStatus && orderStatus !== prevStatus) {
      await createNotification({
        user: order.user,
        type: "order_status",
        title: `Order ${orderStatus}`,
        message: `Your order status has been updated to ${orderStatus}.`,
        relatedOrder: order._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id || req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      ["Shipped", "Delivered", "Cancelled"].includes(
        order.orderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.orderStatus = "Cancelled";

    // Restore stock
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};