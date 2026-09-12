const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sort_order: 'asc' },
    });
    return successResponse(res, banners);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getBanners,
};
