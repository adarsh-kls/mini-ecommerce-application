const Product = require("../models/products");

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      image,
      stock,
    } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      image,
      stock,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const { search, category, stockStatus, sort, page = 1, limit = 8 } = req.query;

    const query = {};

    if (search && typeof search !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid search parameter",
      });
    }

    if (search && typeof search === "string") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (stockStatus) {
      if (stockStatus === "inStock") {
        query.stock = { $gt: 10 };
      } else if (stockStatus === "lowStock") {
        query.stock = { $gt: 0, $lte: 10 };
      } else if (stockStatus === "outOfStock") {
        query.stock = 0;
      }
    }

    let sortQuery = { createdAt: -1 }; // default newest
    if (sort === "oldest") {
      sortQuery = { createdAt: 1 };
    } else if (sort === "priceLow" || sort === "price_asc") {
      sortQuery = { price: 1 };
    } else if (sort === "priceHigh" || sort === "price_desc") {
      sortQuery = { price: -1 };
    } else if (sort === "name_asc") {
      sortQuery = { name: 1 };
    } else if (sort === "name_desc") {
      sortQuery = { name: -1 };
    } else if (sort === "rating") {
      sortQuery = { rating: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages,
      currentPage: parseInt(page),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      price,
      category,
      brand,
      image,
      stock,
    } = req.body;

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.image = image ?? product.image;
    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PRODUCT STOCK
const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock === null || isNaN(stock) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock value. Stock cannot be negative.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.stock = Number(stock);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  updateProductStock,
};
