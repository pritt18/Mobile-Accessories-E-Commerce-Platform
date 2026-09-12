const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/send-otp', authCtrl.sendOtp);
router.post('/verify-otp', authCtrl.verifyOtp);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);
router.post('/google', authCtrl.googleLogin);
router.delete('/account', authenticate, authCtrl.deleteAccount);
router.get('/profile', authenticate, authCtrl.getProfile);
router.put('/profile', authenticate, authCtrl.updateProfile);
router.put('/change-password', authenticate, authCtrl.changePassword);

// Addresses
router.get('/addresses', authenticate, authCtrl.getAddresses);
router.post('/addresses', authenticate, authCtrl.addAddress);
router.put('/addresses/:id', authenticate, authCtrl.updateAddress);
router.delete('/addresses/:id', authenticate, authCtrl.deleteAddress);

// Pincode
router.get('/check-pincode', authCtrl.checkPincode);

module.exports = router;
