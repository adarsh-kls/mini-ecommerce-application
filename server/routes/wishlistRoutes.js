const express = require('express');
const router = express.Router();
const protect = require('../middleware/middleware');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);

module.exports = router;
