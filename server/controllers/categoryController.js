const Category = require("../models/Category");
const Product = require("../models/products");

// GET ALL CATEGORIES (Public / Admin)
const getCategories = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const categories = await Category.find(query).sort({ name: 1 });

    // Calculate product count for each category dynamically
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat.name });
        return {
          ...cat.toObject(),
          productCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE CATEGORY
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({ category: category.name });

    res.status(200).json({
      success: true,
      category: {
        ...category.toObject(),
        productCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE CATEGORY (Admin Only)
const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existingCategory = await Category.findOne({
      $or: [{ name: { $regex: `^${trimmedName}$`, $options: "i" } }, { slug }],
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: trimmedName,
      slug,
      description: description || "",
      image: image || "",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE CATEGORY (Admin Only)
const updateCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const oldName = category.name;

    if (name && name.trim() !== oldName) {
      const trimmedName = name.trim();
      const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        $or: [{ name: { $regex: `^${trimmedName}$`, $options: "i" } }, { slug }],
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Another category with this name already exists",
        });
      }

      category.name = trimmedName;
      category.slug = slug;

      // Sync existing products to new category name
      await Product.updateMany({ category: oldName }, { category: trimmedName });
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CATEGORY (Admin Only)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const attachedProductsCount = await Product.countDocuments({ category: category.name });

    // Handle products belonging to category safely
    const { force, reassignCategory } = req.query;

    if (attachedProductsCount > 0 && !force) {
      return res.status(400).json({
        success: false,
        hasProducts: true,
        productCount: attachedProductsCount,
        message: `Cannot delete category because ${attachedProductsCount} product(s) are attached to it. Pass reassignCategory or force delete.`,
      });
    }

    if (reassignCategory) {
      await Product.updateMany({ category: category.name }, { category: reassignCategory });
    } else if (force === "true") {
      await Product.updateMany({ category: category.name }, { category: "Uncategorized" });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
