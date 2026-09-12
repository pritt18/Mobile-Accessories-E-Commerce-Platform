const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

// --- Coupons ---
const getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(res, coupons);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrderValue, maxDiscount, usageLimit, startDate, endDate, status } = req.body;
    if (!code || !value) return errorResponse(res, 'Code and value are required', 400);

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        type: type || 'PERCENTAGE',
        value: parseFloat(value),
        min_order_value: parseFloat(minOrderValue) || 0,
        max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
        usage_limit: parseInt(usageLimit) || 100,
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        status: status || 'ACTIVE',
      },
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'marketing',
      action: 'create_coupon',
      description: `Created coupon code "${coupon.code}"`,
      req,
    });

    return successResponse(res, coupon, 'Coupon created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id: parseInt(id) } });
    return successResponse(res, null, 'Coupon deleted');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// --- Banners ---
const getAdminBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { sort_order: 'asc' } });
    return successResponse(res, banners);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link, position, sortOrder, status } = req.body;
    if (!title || !image) return errorResponse(res, 'Title and image are required', 400);

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        image,
        link,
        position: position || 'HERO',
        sort_order: parseInt(sortOrder) || 0,
        status: status || 'ACTIVE',
      },
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'marketing',
      action: 'create_banner',
      description: `Created promotional banner "${title}"`,
      req,
    });

    return successResponse(res, banner, 'Banner created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id: parseInt(id) } });
    return successResponse(res, null, 'Banner deleted');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  deleteCoupon,
  getAdminBanners,
  createBanner,
  deleteBanner,
};
