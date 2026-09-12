const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

const getAuditLogs = async (req, res) => {
  try {
    const { module, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (module) where.module = module;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take,
      }),
    ]);

    return successResponse(res, logs, 'Audit logs retrieved', 200, {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getAuditLogs,
};
