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

const products = require('../../data/products.json');

const getInventoryReport = async (req, res) => {
  try {
    const formatted = [];
    for (const p of products) {
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          formatted.push({
            id: v.id,
            productName: p.name,
            category: p.category ? p.category.replace('-', ' ').toUpperCase() : 'Accessories',
            sku: v.sku || `VOR-${p.id}`,
            variantName: [v.color, v.model].filter(Boolean).join(' / ') || 'Standard',
            price: v.price,
            mrp: v.mrp || v.price,
            stock: v.stock || 50,
            status: (v.stock || 50) === 0 ? 'OUT_OF_STOCK' : (v.stock || 50) <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
          });
        }
      } else {
        formatted.push({
          id: p.id,
          productName: p.name,
          category: p.category ? p.category.replace('-', ' ').toUpperCase() : 'Accessories',
          sku: `VOR-${p.id}`,
          variantName: 'Standard',
          price: p.price,
          mrp: p.mrp || p.price,
          stock: p.stock || 50,
          status: (p.stock || 50) === 0 ? 'OUT_OF_STOCK' : (p.stock || 50) <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
        });
      }
    }

    formatted.sort((a, b) => a.stock - b.stock);
    return successResponse(res, formatted);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
};
