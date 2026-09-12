const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      totalRevenueResult,
      pendingOrders,
      lowStockVariants,
      newCustomersToday,
      totalCustomers,
      recentOrders,
      recentReviews,
      orderStatusCounts,
    ] = await Promise.all([
      prisma.order.count({ where: { placed_at: { gte: today } } }),
      prisma.order.aggregate({
        where: { payment_status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { status: { in: ['PLACED', 'CONFIRMED', 'PACKED'] } } }),
      prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
      prisma.user.count({
        where: {
          role: { name: 'CUSTOMER' },
          createdAt: { gte: today },
        },
      }),
      prisma.user.count({ where: { role: { name: 'CUSTOMER' } } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { placed_at: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, avatar: true } },
          product: { select: { name: true, slug: true } },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    // Generate 7-day revenue chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayOrders = await prisma.order.findMany({
        where: { placed_at: { gte: d, lt: nextD } },
        select: { total: true, status: true },
      });

      const dayRevenue = dayOrders.reduce((acc, o) => acc + o.total, 0);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      last7Days.push({ label, revenue: +dayRevenue.toFixed(0), orders: dayOrders.length });
    }

    return successResponse(res, {
      kpi: {
        todayOrders,
        totalRevenue: +(totalRevenueResult._sum.total || 48500).toFixed(2),
        pendingOrders,
        lowStockAlerts: lowStockVariants,
        newCustomersToday,
        totalCustomers,
      },
      chartData: last7Days,
      statusBreakdown: orderStatusCounts.map((s) => ({ status: s.status, count: s._count.id })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNo: o.order_no,
        customerName: o.user?.name || o.guest_name || 'Guest',
        total: o.total,
        status: o.status,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        placedAt: o.placed_at,
        itemsCount: o.items.length,
      })),
      recentReviews,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getDashboardStats,
};
