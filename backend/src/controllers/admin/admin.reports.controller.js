const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

const getSalesReport = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { payment_status: 'PAID' },
      include: { items: true },
      orderBy: { placed_at: 'desc' },
    });

    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? +(totalRevenue / totalOrders).toFixed(2) : 0;

    return successResponse(res, {
      summary: {
        totalRevenue: +totalRevenue.toFixed(2),
        totalOrders,
        averageOrderValue,
      },
      orders: orders.map((o) => ({
        orderNo: o.order_no,
        date: o.placed_at,
        customer: o.guest_name || 'Registered Customer',
        itemsCount: o.items.length,
        total: o.total,
        paymentMethod: o.payment_method,
      })),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getInventoryReport = async (req, res) => {
  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: { select: { name: true, slug: true, category: { select: { name: true } } } },
      },
      orderBy: { stock: 'asc' },
    });

    const formatted = variants.map((v) => ({
      id: v.id,
      productName: v.product.name,
      category: v.product.category.name,
      sku: v.sku,
      variantName: [v.color, v.size_or_model].filter(Boolean).join(' / ') || 'Standard',
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      status: v.stock === 0 ? 'OUT_OF_STOCK' : v.stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
    }));

    return successResponse(res, formatted);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
};
