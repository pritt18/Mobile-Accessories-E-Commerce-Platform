const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const products = require('../data/products.json');

// Helper to look up product and variant
const findProductAndVariant = (productId, variantId) => {
  let product = products.find((p) => p.id === parseInt(productId));
  let variant = null;
  if (!product && variantId) {
    product = products.find((p) => p.variants && p.variants.some((v) => v.id === parseInt(variantId)));
  }
  if (product && product.variants && product.variants.length > 0) {
    variant = product.variants.find((v) => v.id === parseInt(variantId)) || product.variants[0];
  }
  return { product, variant };
};

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
    const sessionId = req.headers['x-session-id'] || req.query?.sessionId || req.body?.sessionId;

    if (!userId && !sessionId) {
      return successResponse(res, { items: [], subtotal: 0, count: 0 });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) {
      return successResponse(res, { items: [], subtotal: 0, count: 0 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cart_id: cart.id },
      orderBy: { createdAt: 'desc' },
    });

    const items = [];
    for (const ci of cartItems) {
      const { product, variant } = findProductAndVariant(ci.product_id, ci.variant_id);
      if (!product) continue;

      const price = variant ? variant.price : product.price;
      const mrp = variant ? (variant.mrp || variant.price) : (product.mrp || product.price);
      const image = (variant && variant.image) || product.primaryImage || (product.images && product.images[0]) || '';
      const stock = variant ? variant.stock : (product.stock || 50);

      items.push({
        id: ci.id,
        productId: product.id,
        variantId: variant ? variant.id : null,
        qty: ci.qty,
        name: product.name,
        slug: product.slug,
        sku: variant ? variant.sku : `VOR-${product.id}`,
        color: variant ? variant.color : null,
        model: variant ? variant.model : null,
        price,
        mrp,
        stock,
        image,
        itemTotal: +(ci.qty * price).toFixed(2),
      });
    }

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
    const { variantId, productId, qty = 1 } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;

    if (!productId && !variantId) {
      return errorResponse(res, 'Product ID or Variant ID is required', 400);
    }

    const { product, variant } = findProductAndVariant(productId, variantId);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    const effectiveStock = variant ? variant.stock : (product.stock || 50);
    if (effectiveStock < qty) {
      return errorResponse(res, `Only ${effectiveStock} units available in stock`, 400);
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) {
      return errorResponse(res, 'Unable to create shopping cart', 500);
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        product_id: product.id,
        variant_id: variant ? variant.id : null,
      },
    });

    if (existingItem) {
      const newQty = existingItem.qty + parseInt(qty);
      if (newQty > effectiveStock) {
        return errorResponse(res, `Cannot add more. Stock limit (${effectiveStock}) reached.`, 400);
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          product_id: product.id,
          variant_id: variant ? variant.id : null,
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
    });
    if (!cartItem) {
      return errorResponse(res, 'Cart item not found', 404);
    }

    const { product, variant } = findProductAndVariant(cartItem.product_id, cartItem.variant_id);
    const stock = variant ? variant.stock : (product ? product.stock : 50);

    if (stock < qty) {
      return errorResponse(res, `Only ${stock} units available in stock`, 400);
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
