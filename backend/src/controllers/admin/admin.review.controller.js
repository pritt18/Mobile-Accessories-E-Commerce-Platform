const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

const getAdminReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (status) where.status = status;

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return successResponse(res, reviews, 'Reviews retrieved', 200, {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
        ...(adminReply !== undefined && { admin_reply: adminReply }),
      },
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'reviews',
      action: 'moderate',
      description: `Moderated review #${id} to "${status}"`,
      req,
    });

    return successResponse(res, review, 'Review updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id: parseInt(id) } });
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
