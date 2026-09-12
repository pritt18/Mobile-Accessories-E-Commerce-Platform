const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/category.controller');

router.get('/', categoryCtrl.getCategories);
router.get('/:slug', categoryCtrl.getCategoryBySlug);

module.exports = router;
