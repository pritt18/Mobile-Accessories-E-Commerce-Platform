const { successResponse, errorResponse } = require('../utils/response');

let staticCoupons = [
  {
    id: 1,
    code: 'FIRST10',
    type: 'PERCENTAGE',
    value: 10,
    min_order_value: 499,
    max_discount: 500,
    usage_limit: 1000,
    used_count: 0,
    status: 'ACTIVE',
  },
  {
    id: 2,
    code: 'FLAT200',
    type: 'FLAT',
    value: 200,
    min_order_value: 1499,
    max_discount: null,
    usage_limit: 500,
    used_count: 0,
    status: 'ACTIVE',
  },
  {
    id: 3,
    code: 'MOBIXIA10',
    type: 'PERCENTAGE',
    value: 10,
    min_order_value: 299,
    max_discount: 200,
    usage_limit: 1000,
    used_count: 0,
    status: 'ACTIVE',
  },
  {
    id: 4,
    code: 'WELCOME50',
    type: 'FLAT',
    value: 50,
    min_order_value: 399,
    max_discount: null,
    usage_limit: 1000,
    used_count: 0,
    status: 'ACTIVE',
  },
];

const getStaticCoupon = (code) => {
  if (!code) return null;
  return staticCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.status === 'ACTIVE') || null;
};

const incrementCouponUsage = (code) => {
  const c = getStaticCoupon(code);
  if (c) c.used_count += 1;
};

const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return errorResponse(res, 'Coupon code is required', 400);

    const coupon = getStaticCoupon(code);
    if (!coupon) {
      return errorResponse(res, 'Invalid or expired promo code', 400);
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return errorResponse(res, 'Coupon usage limit has been reached', 400);
    }

    const total = parseFloat(cartTotal) || 0;
    if (total < coupon.min_order_value) {
      return errorResponse(res, `Minimum order amount of ₹${coupon.min_order_value} required for this coupon`, 400);
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
  staticCoupons,
  getStaticCoupon,
  incrementCouponUsage,
};
