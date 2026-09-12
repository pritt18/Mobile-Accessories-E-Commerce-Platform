const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

const getAdminCustomers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * take;

    const where = {
      role: { name: 'CUSTOMER' },
    };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          orders: { select: { id: true, total: true, status: true, placed_at: true } },
          addresses: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const formatted = customers.map((c) => {
      const totalSpent = c.orders.reduce((acc, o) => acc + o.total, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        mobile: c.mobile,
        status: c.status,
        ordersCount: c.orders.length,
        totalSpent: +totalSpent.toFixed(2),
        addressesCount: c.addresses.length,
        createdAt: c.createdAt,
      };
    });

    return successResponse(res, formatted, 'Customers retrieved', 200, {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const toggleCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return errorResponse(res, 'User not found', 404);

    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { status: newStatus },
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'customers',
      action: 'toggle_status',
      description: `Changed customer status for "${user.email}" to ${newStatus}`,
      req,
    });

    return successResponse(res, { status: updated.status }, `Customer status changed to ${newStatus}`);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getAdminCustomers,
  toggleCustomerStatus,
};
