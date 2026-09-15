const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { product_id: parseInt(productId), status: 'APPROVED' },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, reviews);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const submitReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    const userId = req.user.id;

    if (!productId || !rating || !comment) {
      return errorResponse(res, 'Product ID, rating, and review comment are required', 400);
    }

    // Check if user has purchased this product (Delivered order)
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        user_id: userId,
        status: 'DELIVERED',
        items: {
          some: {
            product_id: parseInt(productId),
          },
        },
      },
    });

    const newReview = await prisma.review.create({
      data: {
        product_id: parseInt(productId),
        user_id: userId,
        order_id: verifiedOrder ? verifiedOrder.id : null,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        title,
        comment,
        images_json: images ? JSON.stringify(images) : null,
        status: 'APPROVED', // auto-approved for demo/seamless experience
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    return successResponse(res, newReview, 'Review submitted successfully! Thank you for your feedback.', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getProductReviews,
  submitReview,
};
