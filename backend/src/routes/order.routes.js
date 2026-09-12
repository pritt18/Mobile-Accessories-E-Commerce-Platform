const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Allow checkout as guest or authenticated customer
router.post('/', optionalAuth, orderCtrl.createOrder);
router.post('/checkout', optionalAuth, orderCtrl.createOrder);
router.post('/verify-payment', orderCtrl.verifyPayment);

// Customer specific
router.get('/my-orders', authenticate, orderCtrl.getMyOrders);
router.get('/:idOrNumber', optionalAuth, orderCtrl.getOrderById);
router.post('/:id/cancel', authenticate, orderCtrl.cancelOrder);
router.post('/:id/return', authenticate, orderCtrl.returnOrder);
router.get('/:id/invoice', optionalAuth, orderCtrl.getInvoice);

module.exports = router;
