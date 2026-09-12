const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// Helper to get or create cart
const getOrCreateCart = async (userId, sessionId) => {
  let cart;
  if (userId) {
    cart = await prisma.cart.findUnique({ where: { user_id: userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { user_id: userId } });
    }
  } else if (sessionId) {
    cart = await prisma.cart.findUnique({ where: { session_id: sessionId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { session_id: sessionId } });
    }
  }
  return cart;
};

const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    if (!userId && !sessionId) {
      return successResponse(res, { items: [], subtotal: 0, count: 0 });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) {
      return successResponse(res, { items: [], subtotal: 0, count: 0 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cart_id: cart.id },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: { orderBy: { sort_order: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    const items = cartItems.map((ci) => ({
      id: ci.id,
      variantId: ci.variant_id,
      qty: ci.qty,
      name: ci.variant.product.name,
      slug: ci.variant.product.slug,
      sku: ci.variant.sku,
      color: ci.variant.color,
      colorCode: ci.variant.color_code,
      model: ci.variant.size_or_model,
      price: ci.variant.price,
      mrp: ci.variant.mrp,
      stock: ci.variant.stock,
      image: ci.variant.image || ci.variant.product.images[0]?.url || '',
      itemTotal: ci.qty * ci.variant.price,
    }));

    const subtotal = items.reduce((acc, it) => acc + it.itemTotal, 0);
    const count = items.reduce((acc, it) => acc + it.qty, 0);

    return successResponse(res, {
      cartId: cart.id,
      items,
      subtotal: +subtotal.toFixed(2),
      count,
    });
  } catch (err) {
    console.error('getCart error:', err);
    return errorResponse(res, err.message, 500);
  }
};

const addToCart = async (req, res) => {
  try {
    const { variantId, qty = 1 } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;

    if (!variantId) {
      return errorResponse(res, 'Variant ID is required', 400);
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: parseInt(variantId) },
    });
    if (!variant) {
      return errorResponse(res, 'Product variant not found', 404);
    }

    if (variant.stock < qty) {
      return errorResponse(res, `Only ${variant.stock} units available in stock`, 400);
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) {
      return errorResponse(res, 'Unable to create shopping cart', 500);
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cart_id_variant_id: {
          cart_id: cart.id,
          variant_id: variant.id,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.qty + parseInt(qty);
      if (newQty > variant.stock) {
        return errorResponse(res, `Cannot add more. Stock limit (${variant.stock}) reached.`, 400);
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          variant_id: variant.id,
          qty: parseInt(qty),
        },
      });
    }

    return getCart(req, res);
  } catch (err) {
    console.error('addToCart error:', err);
    return errorResponse(res, err.message, 500);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // cartItem id
    const { qty } = req.body;

    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id: parseInt(id) } });
      return getCart(req, res);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: { variant: true },
    });
    if (!cartItem) {
      return errorResponse(res, 'Cart item not found', 404);
    }

    if (cartItem.variant.stock < qty) {
      return errorResponse(res, `Only ${cartItem.variant.stock} units available in stock`, 400);
    }

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { qty: parseInt(qty) },
    });

    return getCart(req, res);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.cartItem.delete({ where: { id: parseInt(id) } });
    return getCart(req, res);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    const cart = await getOrCreateCart(userId, sessionId);
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
    }
    return successResponse(res, { items: [], subtotal: 0, count: 0 }, 'Cart cleared');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
