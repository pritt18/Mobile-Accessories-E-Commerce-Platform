const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const products = require('../data/products.json');

const getWishlist = async (req, res) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { user_id: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = [];
    for (const w of items) {
      const prod = products.find((p) => p.id === w.product_id);
      if (!prod) continue;
      formatted.push({
        id: w.id,
        productId: prod.id,
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        mrp: prod.mrp || prod.price,
        image: prod.primaryImage || (prod.images && prod.images[0]) || '',
        inStock: prod.inStock !== false,
      });
    }

    return successResponse(res, formatted);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const existing = await prisma.wishlist.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: parseInt(productId),
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return successResponse(res, { inWishlist: false }, 'Removed from wishlist');
    } else {
      await prisma.wishlist.create({
        data: {
          user_id: userId,
          product_id: parseInt(productId),
        },
      });
      return successResponse(res, { inWishlist: true }, 'Added to wishlist');
    }
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
