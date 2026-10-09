const Wishlist = require('../models/Wishlist');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        let wishlist = await Wishlist.findOne({ userId }).populate('products');
        
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId, products: [] });
        }
        
        res.status(200).json({ success: true, wishlist: wishlist.products });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({ userId, products: [productId] });
            const populatedCreatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
            return res.status(200).json({ success: true, message: 'Product added to wishlist', wishlist: populatedCreatedWishlist.products });
        }

        if (wishlist.products.includes(productId)) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' });
        }

        wishlist.products.push(productId);
        await wishlist.save();

        const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
        res.status(200).json({ success: true, message: 'Product added to wishlist', wishlist: populatedWishlist.products });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        await wishlist.save();
        const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');

        res.status(200).json({ success: true, message: 'Product removed from wishlist', wishlist: populatedWishlist.products });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
