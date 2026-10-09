const express = require("express");
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  removeFromCart, 
  updateCartItem,
  clearCart
} = require("../controllers/cartController");
const protect = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.post("/add", addToCart);
router.put("/update/:productId", updateCartItem);
router.put("/:productId", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/remove/:productId", removeFromCart);
router.delete("/:productId", removeFromCart);

module.exports = router;
