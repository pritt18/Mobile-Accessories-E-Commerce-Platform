const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/product.controller');

router.get('/', productCtrl.getProducts);
router.get('/home-feed', productCtrl.getHomeFeed);
router.get('/autosuggest', productCtrl.searchAutosuggest);
router.get('/:slug', productCtrl.getProductBySlug);

module.exports = router;
