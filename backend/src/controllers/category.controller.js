const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE', parent_id: null },
      include: {
        children: {
          where: { status: 'ACTIVE' },
          orderBy: { sort_order: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sort_order: 'asc' },
    });
    return successResponse(res, categories);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
      },
    });
    if (!category) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, category);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
};
