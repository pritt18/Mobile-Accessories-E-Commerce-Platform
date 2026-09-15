const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

const { staticCoupons } = require('../coupon.controller');

// --- Coupons ---
const getCoupons = async (req, res) => {
  try {
    return successResponse(res, staticCoupons);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrderValue, maxDiscount, usageLimit, status } = req.body;
    if (!code || !value) return errorResponse(res, 'Code and value are required', 400);

    const coupon = {
      id: Date.now(),
      code: code.toUpperCase().trim(),
      type: type || 'PERCENTAGE',
      value: parseFloat(value),
      min_order_value: parseFloat(minOrderValue) || 0,
      max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
      usage_limit: parseInt(usageLimit) || 100,
      used_count: 0,
      status: status || 'ACTIVE',
    };
    staticCoupons.unshift(coupon);

    return successResponse(res, coupon, 'Coupon created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const cId = parseInt(id);
    const idx = staticCoupons.findIndex((c) => c.id === cId);
    if (idx !== -1) {
      staticCoupons.splice(idx, 1);
    }
    return successResponse(res, null, 'Coupon deleted');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const { staticBanners } = require('../banner.controller');

// --- Banners ---
let adminBannersList = [...staticBanners];

const getAdminBanners = async (req, res) => {
  try {
    return successResponse(res, adminBannersList);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link, position, sortOrder, status } = req.body;
    if (!title || !image) return errorResponse(res, 'Title and image are required', 400);

    const banner = {
      id: Date.now(),
      title,
      subtitle,
      image,
      link,
      position: position || 'HERO',
      sort_order: parseInt(sortOrder) || 0,
      status: status || 'ACTIVE',
    };
    adminBannersList.push(banner);

    return successResponse(res, banner, 'Banner created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    adminBannersList = adminBannersList.filter((b) => b.id !== parseInt(id));
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
