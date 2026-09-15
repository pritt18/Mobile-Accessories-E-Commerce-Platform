const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(100, Math.max(1, parseInt(limit)));

    return successResponse(res, [], 'Audit logs (Disabled to minimize cloud database storage & billing)', 200, {
      total: 0,
      page: pageNum,
      limit: take,
      totalPages: 0,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getAuditLogs,
};
