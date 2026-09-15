const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// In-memory reviews map by product_id
const inMemoryReviews = {};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const pId = parseInt(productId);
    const reviews = inMemoryReviews[pId] || [];
    return successResponse(res, reviews);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const submitReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const user = req.user;

    if (!productId || !rating || !comment) {
      return errorResponse(res, 'Product ID, rating, and review comment are required', 400);
    }

    const pId = parseInt(productId);
    if (!inMemoryReviews[pId]) {
      inMemoryReviews[pId] = [];
    }

    const newReview = {
      id: Date.now(),
      product_id: pId,
      user_id: user.id,
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      title: title || 'Verified Purchase',
      comment,
      status: 'APPROVED',
      user: {
        name: user.name || 'Verified Customer',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      },
      createdAt: new Date().toISOString(),
    };

    inMemoryReviews[pId].unshift(newReview);

    return successResponse(res, newReview, 'Review submitted successfully! Thank you for your feedback.', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getProductReviews,
  submitReview,
  inMemoryReviews,
};
