const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');
const { sendNotification } = require('../../utils/mailer');

const getAdminOrders = async (req, res) => {
  try {
    const { status, paymentStatus, paymentMethod, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.payment_status = paymentStatus;
    if (paymentMethod) where.payment_method = paymentMethod;

    if (startDate || endDate) {
      where.placed_at = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    if (search) {
      where.OR = [
        { order_no: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, mobile: true } },
          items: true,
        },
        orderBy: { placed_at: 'desc' },
        skip,
        take,
      }),
    ]);

    return successResponse(res, orders, 'Orders retrieved', 200, {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courierName, trackingId, trackingUrl, notes, paymentStatus } = req.body;

    const orderId = parseInt(id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) return errorResponse(res, 'Order not found', 404);

    const oldStatus = order.status;

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          ...(status && { status }),
          ...(paymentStatus && { payment_status: paymentStatus }),
          ...(courierName !== undefined && { courier_name: courierName }),
          ...(trackingId !== undefined && { tracking_id: trackingId }),
          ...(trackingUrl !== undefined && { tracking_url: trackingUrl }),
          status_history: {
            create: {
              status: status || oldStatus,
              notes: notes || `Status updated from ${oldStatus} to ${status}`,
              changed_by: req.user.name,
            },
          },
        },
        include: { items: true, status_history: true },
      });

      return ord;
    });

    // Notify customer
    const customerEmail = order.user?.email || 'customer@example.com';
    sendNotification({
      userId: order.user_id,
      type: `ORDER_${status || 'UPDATED'}`,
      recipient: customerEmail,
      content: `Your order #${order.order_no} status changed to ${status}. Tracking: ${trackingId || 'N/A'}`,
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'orders',
      action: 'update_status',
      description: `Updated order #${order.order_no} status to "${status}"`,
      req,
    });

    return successResponse(res, updated, 'Order status updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getAdminOrders,
  updateOrderStatus,
};
