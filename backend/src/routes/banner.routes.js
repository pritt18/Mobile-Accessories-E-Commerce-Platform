const express = require('express');
const router = express.Router();
const bannerCtrl = require('../controllers/banner.controller');

router.get('/', bannerCtrl.getBanners);

module.exports = router;
