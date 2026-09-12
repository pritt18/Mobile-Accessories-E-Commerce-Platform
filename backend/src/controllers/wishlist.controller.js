const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getWishlist = async (req, res) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { user_id: req.user.id },
      include: {
        product: {
          include: {
            variants: true,
            images: { orderBy: { sort_order: 'asc' }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map((w) => ({
      id: w.id,
      productId: w.product_id,
      name: w.product.name,
      slug: w.product.slug,
      price: w.product.variants[0]?.price || 0,
      mrp: w.product.variants[0]?.mrp || 0,
      image: w.product.images[0]?.url || w.product.variants[0]?.image || '',
      inStock: w.product.variants.some((v) => v.stock > 0),
    }));

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
