const Razorpay = require("razorpay");
const crypto = require("crypto");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const createNotification = require("../utils/createNotifications");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Make sure every cart product still exists
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists",
        });
      }
    }

    // Calculate price using database values
    const subtotal = cart.items.reduce(
      (total, item) =>
        total + item.product.price * item.quantity,
      0
    );

    const shippingFee = subtotal >= 1000 ? 0 : 50;
    const totalAmount = subtotal + shippingFee;

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      razorpayOrder,
      totalAmount,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};


// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are incomplete",
      });
    }

    // --------------------------------------------------
    // 1. Verify Razorpay signature
    // --------------------------------------------------

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (
      generatedSignature !== razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // --------------------------------------------------
    // 2. Fetch Razorpay order from Razorpay
    // --------------------------------------------------

    const razorpayOrder =
      await razorpay.orders.fetch(razorpay_order_id);

    if (!razorpayOrder) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order not found",
      });
    }

    // --------------------------------------------------
    // 3. Fetch actual payment from Razorpay
    // --------------------------------------------------

    const razorpayPayment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    if (!razorpayPayment) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment not found",
      });
    }

    // --------------------------------------------------
    // 4. Make sure payment belongs to this order
    // --------------------------------------------------

    if (
      razorpayPayment.order_id !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to this order",
      });
    }

    // --------------------------------------------------
    // 5. Make sure payment was actually captured
    // --------------------------------------------------

    if (razorpayPayment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment is not captured. Current status: ${razorpayPayment.status}`,
      });
    }

    // --------------------------------------------------
    // 6. Verify amount
    // --------------------------------------------------

    if (
      Number(razorpayPayment.amount) !==
      Number(razorpayOrder.amount)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    // --------------------------------------------------
    // 7. Payment successfully verified
    // --------------------------------------------------

    if (req.user && (req.user.id || req.user._id)) {
      await createNotification({
        user: req.user.id || req.user._id,
        type: "payment_success",
        title: "Payment Successful",
        message: "Your payment was verified successfully.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: razorpayPayment.amount,
        status: razorpayPayment.status,
      },
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};