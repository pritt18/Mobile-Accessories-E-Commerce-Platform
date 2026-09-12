const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');

router.get('/product/:productId', reviewCtrl.getProductReviews);
router.post('/', authenticate, reviewCtrl.submitReview);

module.exports = router;
