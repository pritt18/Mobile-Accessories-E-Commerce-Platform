const express = require('express');
const router = express.Router();
const couponCtrl = require('../controllers/coupon.controller');

router.post('/validate', couponCtrl.validateCoupon);

module.exports = router;
