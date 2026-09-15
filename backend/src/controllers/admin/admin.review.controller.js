const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

const products = require('../../data/products.json');

const { inMemoryReviews } = require('../review.controller');

const getAdminReviews = async (req, res) => {
  try {
    const allReviews = Object.values(inMemoryReviews).flat();
    const formatted = allReviews.map((r) => {
      const prod = products.find((p) => p.id === r.product_id);
      return {
        ...r,
        product: prod ? { id: prod.id, name: prod.name, slug: prod.slug } : { id: r.product_id, name: 'Accessories Product', slug: 'product' },
      };
    });

    return successResponse(res, formatted, 'Reviews retrieved', 200, {
      total: formatted.length,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    const rId = parseInt(id);
    let found = null;
    for (const key of Object.keys(inMemoryReviews)) {
      const idx = inMemoryReviews[key].findIndex((r) => r.id === rId);
      if (idx !== -1) {
        if (status) inMemoryReviews[key][idx].status = status;
        if (adminReply !== undefined) inMemoryReviews[key][idx].admin_reply = adminReply;
        found = inMemoryReviews[key][idx];
        break;
      }
    }

    return successResponse(res, found || { id: rId, status }, 'Review updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const rId = parseInt(id);
    for (const key of Object.keys(inMemoryReviews)) {
      inMemoryReviews[key] = inMemoryReviews[key].filter((r) => r.id !== rId);
    }
    return successResponse(res, null, 'Review deleted');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
};
