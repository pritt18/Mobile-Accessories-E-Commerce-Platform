const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { generateInvoiceData, generateInvoiceHtml } = require('../utils/invoice');
const { sendNotification } = require('../utils/mailer');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const products = require('../data/products.json');

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

const getRazorpayConfig = async () => {
  let keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_Tb3eJTFsLj1VR9';
  let keySecret = process.env.RAZORPAY_KEY_SECRET || 'M3P24lGMoCy7QsEgPuomqA99';

  try {
    const activeSetting = await prisma.setting.findUnique({ where: { key: 'payment_razorpay_mode' } }).catch(() => null);
    const mode = activeSetting?.value || 'TEST';
    const cred = await prisma.paymentCredential.findFirst({
      where: { provider: 'RAZORPAY', mode, is_active: true },
    }).catch(() => null);

    if (cred && cred.key_id && !cred.key_id.includes('mobixiaDemo') && cred.key_secret_encrypted) {
      const { decryptSecret } = require('../config/security');
      const decrypted = decryptSecret(cred.key_secret_encrypted);
      if (decrypted) {
        keyId = cred.key_id;
        keySecret = decrypted;
      }
    }
  } catch (e) {
    console.warn('[RAZORPAY] Fallback to process.env credentials:', e.message);
  }

  let client = null;
  if (keyId && keySecret) {
    try {
      client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    } catch (e) {
      console.warn('[RAZORPAY] Client instantiation failed:', e.message);
    }
  }

  return { client, keyId, keySecret };
};

/**
 * Generate unique human-readable Order Number: e.g. VOR-2609-1234
 */
const generateOrderNo = () => {
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MBX-${dateStr}-${random}`;
};

/**
 * Place a new Order (Checkout)
 */
const createOrder = async (req, res) => {
  try {
    const {
      addressId,
      shippingInfo, // For guest or custom address
      items, // Array of { variantId, qty }
      paymentMethod = 'COD',
      couponCode,
      notes,
      deliverySlot, // { speed: 'STANDARD' | 'EXPRESS', slot: string, estimatedDate: string }
      guestEmail: reqGuestEmail,
      guestPhone: reqGuestPhone,
      guestName: reqGuestName,
    } = req.body;

    const userId = req.user?.id || null;

    if (!items || items.length === 0) {
      return errorResponse(res, 'No items specified in the order', 400);
    }

    // Validate products and check stock & calculate subtotal
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { product, variant } = findProductAndVariant(item.productId, item.variantId);
      if (!product) {
        return errorResponse(res, 'One or more selected products are invalid', 400);
      }
      const qty = parseInt(item.qty) || 1;
      const stock = variant ? variant.stock : (product.stock || 50);

      if (stock < qty) {
        return errorResponse(
          res,
          `Sorry, "${product.name}" has only ${stock} units left in stock.`,
          400
        );
      }

      const price = variant ? variant.price : product.price;
      const mrp = variant ? (variant.mrp || variant.price) : (product.mrp || product.price);
      const itemTotal = price * qty;
      subtotal += itemTotal;

      orderItemsData.push({
        product_id: product.id,
        variant_id: variant ? variant.id : null,
        qty,
        price,
        mrp,
        product_name_snapshot: product.name,
        variant_snapshot: variant ? [variant.color, variant.model].filter(Boolean).join(' / ') : 'Standard',
        image_snapshot: (variant && variant.image) || product.primaryImage || (product.images && product.images[0]) || '',
      });
    }

    // Coupon discount logic
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase(), status: 'ACTIVE' },
      });

      if (appliedCoupon) {
        if (subtotal >= appliedCoupon.min_order_value) {
          if (appliedCoupon.type === 'PERCENTAGE') {
            discount = (subtotal * appliedCoupon.value) / 100;
            if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
              discount = appliedCoupon.max_discount;
            }
          } else {
            discount = appliedCoupon.value;
          }
          discount = Math.min(discount, subtotal);
        }
      }
    }

    // Dynamic Shipping calculation based on Admin Configuration Settings
    const freeThresholdSetting = await prisma.setting.findUnique({ where: { key: 'shipping_free_threshold' } }).catch(() => null);
    const standardFeeSetting = await prisma.setting.findUnique({ where: { key: 'shipping_standard_fee' } }).catch(() => null);
    const expressFeeSetting = await prisma.setting.findUnique({ where: { key: 'shipping_express_fee' } }).catch(() => null);

    const freeThreshold = freeThresholdSetting ? parseFloat(freeThresholdSetting.value) : 499;
    const standardFee = standardFeeSetting ? parseFloat(standardFeeSetting.value) : 50;
    const expressFee = expressFeeSetting ? parseFloat(expressFeeSetting.value) : 49;

    const isExpress = deliverySlot && deliverySlot.speed === 'EXPRESS';
    const shippingFee = isExpress ? expressFee : (subtotal >= freeThreshold ? 0 : standardFee);

    // GST Tax calculation: 18% included
    const taxable = Math.max(0, subtotal - discount);
    const tax = +(taxable * 0.18).toFixed(2);
    const grandTotal = +(taxable + shippingFee).toFixed(2);

    // Guest details extraction
    const parsedShippingObj = typeof shippingInfo === 'string' 
      ? (() => { try { return JSON.parse(shippingInfo); } catch { return {}; } })()
      : (shippingInfo || {});

    const guestEmail = !userId ? (reqGuestEmail || req.body.email || parsedShippingObj.email || null) : null;
    const guestPhone = !userId ? (reqGuestPhone || req.body.phone || parsedShippingObj.phone || null) : null;
    const guestName = !userId ? (reqGuestName || req.body.name || parsedShippingObj.name || 'Guest Customer') : null;

    // Shipping address capture
    let finalShippingInfo = null;
    let finalAddressId = null;

    if (addressId) {
      const addr = await prisma.address.findUnique({ where: { id: parseInt(addressId) } });
      if (addr) {
        finalAddressId = addr.id;
        finalShippingInfo = JSON.stringify({
          name: addr.name,
          phone: addr.phone,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          deliverySlot: deliverySlot || null,
        });
      }
    } else if (shippingInfo) {
      const enrichedShipping = {
        ...parsedShippingObj,
        deliverySlot: deliverySlot || null,
      };
      finalShippingInfo = JSON.stringify(enrichedShipping);
    }

    const orderNo = generateOrderNo();

    // Create Order with Items and Status History in transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: {
          order_no: orderNo,
          user_id: userId,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          guest_name: guestName,
          address_id: finalAddressId,
          shipping_info: finalShippingInfo,
          status: 'PLACED',
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          subtotal: +subtotal.toFixed(2),
          discount: +discount.toFixed(2),
          shipping_fee: shippingFee,
          tax,
          total: grandTotal,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          items: {
            create: orderItemsData,
          },
          status_history: {
            create: {
              status: 'PLACED',
              notes: `Order placed successfully via ${paymentMethod}. Delivery Slot: ${deliverySlot?.speed || 'STANDARD'} (${deliverySlot?.slot || 'ANYTIME'}).`,
              changed_by: userId ? (req.user?.name || 'Customer') : (guestName || 'Guest Customer'),
            },
          },
        },
        include: {
          items: true,
        },
      });



      // 3. Update coupon usage count if applied
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { used_count: { increment: 1 } },
        });
      }

      // 4. Clear user's cart
      if (userId) {
        const userCart = await tx.cart.findUnique({ where: { user_id: userId } });
        if (userCart) {
          await tx.cartItem.deleteMany({ where: { cart_id: userCart.id } });
        }
      }

      return order;
    });

    // Send real order confirmation email via Nodemailer
    const recipientEmail = guestEmail || req.user?.email || parsedShippingObj.email || req.body.email || 'pritamgangurde18@gmail.com';
    const recipientPhone = guestPhone || req.user?.mobile || parsedShippingObj.phone || req.body.phone;

    await sendNotification({
      userId,
      type: 'ORDER_PLACED',
      channel: 'EMAIL',
      recipient: recipientEmail,
      content: `Your order #${newOrder.order_no} of ₹${newOrder.total} has been confirmed! We are preparing your shipment.`,
      orderData: newOrder,
    });

    if (recipientPhone) {
      await sendNotification({
        userId,
        type: 'ORDER_PLACED_SMS',
        channel: 'SMS',
        recipient: recipientPhone,
        content: `Mobixia: Your order #${newOrder.order_no} of ₹${newOrder.total} is confirmed! Track your shipment: http://localhost:5173/track/${newOrder.order_no}`,
      });
    }

    // If online payment (Razorpay), prepare gateway details
    let razorpayPayload = null;
    if (paymentMethod === 'RAZORPAY') {
      const { client, keyId } = await getRazorpayConfig();
      let rzpOrderId = null;
      if (client) {
        try {
          const rzpOrder = await client.orders.create({
            amount: Math.round(newOrder.total * 100), // in paise
            currency: 'INR',
            receipt: newOrder.order_no,
          });
          rzpOrderId = rzpOrder.id;
          console.log(`[RAZORPAY] Created order ${rzpOrderId} for ${newOrder.order_no} (₹${newOrder.total})`);
        } catch (e) {
          console.warn('[RAZORPAY] Order creation error:', e.message);
        }
      }

      razorpayPayload = {
        orderId: rzpOrderId,
        amount: Math.round(newOrder.total * 100), // in paise
        currency: 'INR',
        keyId: keyId,
        name: 'Mobixia Mobile Accessories',
        description: `Order #${newOrder.order_no}`,
      };
    }

    return successResponse(
      res,
      {
        order: newOrder,
        razorpay: razorpayPayload,
      },
      'Order placed successfully!',
      201
    );
  } catch (err) {
    console.error('createOrder error:', err);
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Get customer order history
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { user_id: req.user.id },
      include: {
        items: true,
        status_history: { orderBy: { changed_at: 'asc' } },
      },
      orderBy: { placed_at: 'desc' },
    });
    return successResponse(res, orders);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Get single order details for tracking & review
 */
const getOrderById = async (req, res) => {
  try {
    const { idOrNumber } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { order_no: idOrNumber },
          ...(isNaN(idOrNumber) ? [] : [{ id: parseInt(idOrNumber) }]),
        ],
      },
      include: {
        items: true,
        address: true,
        user: { select: { id: true, name: true, email: true, mobile: true } },
        status_history: { orderBy: { changed_at: 'asc' } },
      },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // If customer is logged in, verify ownership unless staff
    if (req.user && req.user.role.name === 'CUSTOMER' && order.user_id && order.user_id !== req.user.id) {
      return errorResponse(res, 'Unauthorized to view this order', 403);
    }

    return successResponse(res, order);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Cancel an order before shipping
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!order) return errorResponse(res, 'Order not found', 404);

    if (req.user && req.user.role.name === 'CUSTOMER' && order.user_id !== req.user.id) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    if (!['PLACED', 'CONFIRMED'].includes(order.status)) {
      return errorResponse(res, `Cannot cancel order in "${order.status}" status. It may have already shipped.`, 400);
    }

    // Restore stock and update status
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancel_reason: reason || 'Cancelled by customer',
          status_history: {
            create: {
              status: 'CANCELLED',
              notes: `Order cancelled. Reason: ${reason || 'Customer request'}`,
              changed_by: req.user?.name || 'Customer',
            },
          },
        },
      });

      // Restore variants stock
      for (const item of order.items) {
        if (item.variant_id) {
          await tx.productVariant.update({
            where: { id: item.variant_id },
            data: { stock: { increment: item.qty } },
          });
        }
      }
    });

    return successResponse(res, null, 'Order has been cancelled successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Request Return / Replacement for delivered order
 */
const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order) return errorResponse(res, 'Order not found', 404);

    if (order.status !== 'DELIVERED') {
      return errorResponse(res, 'Return/Replacement is only eligible for delivered orders', 400);
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'RETURNED',
        return_reason: reason,
        status_history: {
          create: {
            status: 'RETURN_REQUESTED',
            notes: `Return requested. Reason: ${reason}`,
            changed_by: req.user?.name || 'Customer',
          },
        },
      },
    });

    return successResponse(res, null, 'Return request submitted successfully. Our team will contact you.');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Download / View GST Invoice
 */
const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isNaN(id) ? [] : [{ id: parseInt(id) }]),
          { order_no: id },
        ],
      },
      include: {
        items: true,
        address: true,
        user: true,
      },
    });

    if (!order) return errorResponse(res, 'Order not found', 404);

    const invoiceData = generateInvoiceData(order);

    if (req.query.format === 'json') {
      return successResponse(res, invoiceData);
    }

    const html = generateInvoiceHtml(invoiceData);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Verify Razorpay payment and mark order as PAID
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderId || isNaN(parseInt(orderId))) {
      return errorResponse(res, 'Valid orderId is required', 400);
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
    if (!order) return errorResponse(res, 'Order not found', 404);

    // Cryptographic signature verification if signature is provided
    const { keySecret } = await getRazorpayConfig();
    if (razorpaySignature && razorpayOrderId && razorpayPaymentId && keySecret) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        console.warn(`[RAZORPAY] Signature mismatch for Order #${order.order_no}`);
        return errorResponse(res, 'Payment signature verification failed', 400);
      }
      console.log(`[RAZORPAY] Signature successfully verified for Order #${order.order_no}`);
    }

    // Update order status to PAID and CONFIRMED
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        payment_status: 'PAID',
        payment_id: razorpayPaymentId || `pay_mock_${Date.now()}`,
        status: 'CONFIRMED',
        status_history: {
          create: {
            status: 'CONFIRMED',
            notes: `Online payment verified. Payment ID: ${razorpayPaymentId || 'mock_pay'}`,
            changed_by: 'PAYMENT_GATEWAY',
          },
        },
      },
      include: { items: true },
    });

    return successResponse(res, updated, 'Payment verified successfully!');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
  getInvoice,
  verifyPayment,
};
