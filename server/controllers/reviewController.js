const Review = require("../models/Review");
const Product = require("../models/products");

const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { productId } = req.params;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        // Validate comment
        if (!comment || comment.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Comment must contain at least 3 characters",
            });
        }

        // Check product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check duplicate review
        const existingReview = await Review.findOne({
            product: productId,
            user: req.user._id,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product",
            });
        }

        const review = await Review.create({
            product: productId,
            user: req.user._id,
            rating,
            comment: comment.trim(),
        });

        const populatedReview = await Review.findById(review._id)
            .populate("user", "name email");

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review: populatedReview,
        });
    } catch (error) {
        console.error("Create review error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create review",
        });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({
            product: productId,
        })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;

        const averageRating =
            totalReviews > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
                : 0;

        const ratingDistribution = {
            5: reviews.filter((review) => review.rating === 5).length,
            4: reviews.filter((review) => review.rating === 4).length,
            3: reviews.filter((review) => review.rating === 3).length,
            2: reviews.filter((review) => review.rating === 2).length,
            1: reviews.filter((review) => review.rating === 1).length,
        };

        res.status(200).json({
            success: true,
            reviews,
            summary: {
                totalReviews,
                averageRating: Number(averageRating.toFixed(1)),
                ratingDistribution,
            },
        });
    } catch (error) {
        console.error("Get product reviews error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
        });
    }
};

// Admin - Get all reviews with search, rating filter & pagination
const getAllReviews = async (req, res) => {
  try {
    const { search, rating, page = 1, limit = 10 } = req.query;

    const query = {};

    if (rating && rating !== "All") {
      query.rating = Number(rating);
    }

    if (search && search.trim()) {
      query.comment = { $regex: search.trim(), $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const reviews = await Review.find(query)
      .populate("user", "name email")
      .populate("product", "name image price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: reviews.length,
      totalReviews,
      totalPages,
      currentPage: parseInt(page),
      reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin - Delete review & recalculate product rating
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const productId = review.product;

    await review.deleteOne();

    // Recalculate Product average rating
    const remainingReviews = await Review.find({ product: productId });
    const numReviews = remainingReviews.length;
    const avgRating =
      numReviews > 0
        ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
        : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(avgRating.toFixed(1)),
      numReviews,
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getAllReviews,
  deleteReview,
};