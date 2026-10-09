const express = require("express");
const router = express.Router();
const {
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress
} = require("../controllers/addressController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getAddresses);
router.post("/", addAddress);
router.post("/add", addAddress);
router.get("/:id", getAddressById);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.delete("/remove/:id", deleteAddress);

module.exports = router;

