const Cart = require("../models/Cart");
const Product = require("../models/products");

// Get cart for current user
const getCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {

    const { productId, quantity } = req.body;


    // 1. Validate request

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required"
      });
    }


    // 2. Find product

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }


    // 3. Check quantity

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }


    // 4. Check stock

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available"
      });
    }


    const userId = req.user?.id || req.user?._id;

    // 5. Find user's cart

    let cart = await Cart.findOne({
      user: userId
    });


    // 6. Create cart if it doesn't exist

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: []
      });
    }


    // 7. Check whether product already exists

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );


    // 8. If product already exists

    if (existingItem) {

      const newQuantity =
        existingItem.quantity + Number(quantity);


      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock"
        });
      }


      existingItem.quantity = newQuantity;

    } else {

      // 9. Add new product

      cart.items.push({
        product: productId,
        quantity: Number(quantity)
      });
    }


    await cart.save();


    // 10. Return updated cart

    await cart.populate("items.product");


    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id || req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id || req.user._id;

    const quantityNum = Number(quantity);

    if (
      !Number.isInteger(quantityNum) ||
      quantityNum < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      if (quantityNum > product.stock) {
        return res.status(400).json({ success: false, message: "Not enough stock available" });
      }

      cart.items[itemIndex].quantity = quantityNum;
      await cart.save();
      await cart.populate("items.product");
      res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        cart
      });
    } else {
      res.status(404).json({ success: false, message: "Item not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    } else {
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
};