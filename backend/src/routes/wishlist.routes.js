const express = require('express');
const router = express.Router();
const wishlistCtrl = require('../controllers/wishlist.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, wishlistCtrl.getWishlist);
router.post('/toggle', authenticate, wishlistCtrl.toggleWishlist);

module.exports = router;
