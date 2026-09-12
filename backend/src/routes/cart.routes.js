const express = require('express');
const router = express.Router();
const cartCtrl = require('../controllers/cart.controller');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/', cartCtrl.getCart);
router.post('/add', cartCtrl.addToCart);
router.put('/item/:id', cartCtrl.updateCartItem);
router.delete('/item/:id', cartCtrl.removeCartItem);
router.delete('/clear', cartCtrl.clearCart);

module.exports = router;
