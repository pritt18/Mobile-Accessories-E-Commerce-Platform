const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return errorResponse(res, 'Coupon code is required', 400);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || coupon.status !== 'ACTIVE') {
      return errorResponse(res, 'Invalid or expired promo code', 400);
    }

    const now = new Date();
    if (coupon.start_date && now < coupon.start_date) {
      return errorResponse(res, 'This coupon is not active yet', 400);
    }
    if (coupon.end_date && now > coupon.end_date) {
      return errorResponse(res, 'This coupon has expired', 400);
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return errorResponse(res, 'Coupon usage limit has been reached', 400);
    }

    const total = parseFloat(cartTotal) || 0;
    if (total < coupon.min_order_value) {
      return errorResponse(res, `Minimum order amount of ?${coupon.min_order_value} required for this coupon`, 400);
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (total * coupon.value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, total);

    return successResponse(res, {
      code: coupon.code,
      discount: +discount.toFixed(2),
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.min_order_value,
    }, 'Coupon applied successfully!');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  validateCoupon,
};
