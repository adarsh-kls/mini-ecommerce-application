const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "Santoji Store",
    },
    supportEmail: {
      type: String,
      default: "support@store.com",
    },
    currencySymbol: {
      type: String,
      default: "₹",
    },
    shippingFee: {
      type: Number,
      default: 50,
    },
    freeShippingThreshold: {
      type: Number,
      default: 500,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
