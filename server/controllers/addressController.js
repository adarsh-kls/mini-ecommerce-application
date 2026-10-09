const Address = require("../models/address");

// Helper to safely extract body data regardless of format or nesting
const getReqBody = (req) => {
  let body = req.body;
  if (!body) return {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return {};
    }
  }
  if (typeof body.address === "object" && body.address !== null) {
    return body.address;
  }
  if (typeof body.data === "object" && body.data !== null) {
    return body.data;
  }
  return body || {};
};

// Add a new address (POST /api/address)
const addAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const body = getReqBody(req);

    const fullName = (body.fullName || body.name || "").toString().trim();
    const street = (body.addressLine || body.street || body.address || "").toString().trim();
    const city = (body.city || "").toString().trim();
    const state = (body.state || "").toString().trim();
    const zipCode = (body.zipCode || body.postalCode || body.pincode || "").toString().trim();
    const phone = (body.phone || body.phoneNumber || "").toString().trim();

    if (!fullName || !street || !city || !state || !zipCode || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required address fields",
        received: { fullName, street, city, state, zipCode, phone }
      });
    }

    const addressData = {
      user: userId,
      fullName,
      addressLine: street,
      city,
      state,
      postalCode: zipCode,
      phone
    };

    const newAddress = await Address.create(addressData);

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user addresses (GET /api/address)
const getAddresses = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const addresses = await Address.find({ user: userId });

    return res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single address by ID (GET /api/address/:id)
const getAddressById = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const address = await Address.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    return res.status(200).json({
      success: true,
      address
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update address (PUT /api/address/:id)
const updateAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const body = getReqBody(req);

    const addressToUpdate = await Address.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!addressToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    const fullName = body.fullName || body.name;
    const street = body.addressLine || body.street || body.address;
    const city = body.city;
    const state = body.state;
    const zipCode = body.zipCode || body.postalCode || body.pincode;
    const phone = body.phone || body.phoneNumber;

    if (fullName !== undefined) addressToUpdate.fullName = fullName.toString().trim();
    if (street !== undefined) addressToUpdate.addressLine = street.toString().trim();
    if (city !== undefined) addressToUpdate.city = city.toString().trim();
    if (state !== undefined) addressToUpdate.state = state.toString().trim();
    if (zipCode !== undefined) addressToUpdate.postalCode = zipCode.toString().trim();
    if (phone !== undefined) addressToUpdate.phone = phone.toString().trim();

    const updatedAddress = await addressToUpdate.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete address (DELETE /api/address/:id)
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: userId
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress
};


