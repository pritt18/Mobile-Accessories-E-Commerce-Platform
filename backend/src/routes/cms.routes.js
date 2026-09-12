const express = require('express');
const router = express.Router();
const cmsCtrl = require('../controllers/cms.controller');

router.get('/:slug', cmsCtrl.getCmsPage);
router.post('/contact', cmsCtrl.submitContact);

module.exports = router;
