const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { authorize, requireRole } = require('../../middleware/rbac');
const upload = require('../../middleware/upload');
const { successResponse } = require('../../utils/response');

// Import controllers
const dashCtrl = require('../../controllers/admin/admin.dashboard.controller');
const prodCtrl = require('../../controllers/admin/admin.product.controller');
const ordCtrl = require('../../controllers/admin/admin.order.controller');
const custCtrl = require('../../controllers/admin/admin.customer.controller');
const mktCtrl = require('../../controllers/admin/admin.marketing.controller');
const revCtrl = require('../../controllers/admin/admin.review.controller');
const cmsCtrl = require('../../controllers/admin/admin.cms.controller');
const repCtrl = require('../../controllers/admin/admin.reports.controller');
const setCtrl = require('../../controllers/admin/admin.settings.controller');
const payCtrl = require('../../controllers/admin/admin.payment.controller');
const staffCtrl = require('../../controllers/admin/admin.staff.controller');
const auditCtrl = require('../../controllers/admin/admin.audit.controller');

// Require authentication for all admin routes
router.use(authenticate);

// File Upload endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.destination.split('uploads')[1].replace(/\\/g, '/').replace(/^\//, '')}/${req.file.filename}`;
  return successResponse(res, { url: fileUrl }, 'File uploaded successfully');
});

// Dashboard
router.get('/dashboard', authorize('reports', 'view'), dashCtrl.getDashboardStats);

// Products
router.get('/products', authorize('products', 'view'), prodCtrl.getAdminProducts);
router.post('/products', authorize('products', 'create'), prodCtrl.createProduct);
router.put('/products/:id', authorize('products', 'edit'), prodCtrl.updateProduct);
router.delete('/products/:id', authorize('products', 'delete'), prodCtrl.deleteProduct);

// Orders
router.get('/orders', authorize('orders', 'view'), ordCtrl.getAdminOrders);
router.put('/orders/:id/status', authorize('orders', 'edit'), ordCtrl.updateOrderStatus);

// Customers
router.get('/customers', authorize('customers', 'view'), custCtrl.getAdminCustomers);
router.put('/customers/:id/status', authorize('customers', 'edit'), custCtrl.toggleCustomerStatus);

// Marketing: Coupons & Banners
router.get('/coupons', authorize('marketing', 'view'), mktCtrl.getCoupons);
router.post('/coupons', authorize('marketing', 'create'), mktCtrl.createCoupon);
router.delete('/coupons/:id', authorize('marketing', 'delete'), mktCtrl.deleteCoupon);

router.get('/banners', authorize('marketing', 'view'), mktCtrl.getAdminBanners);
router.post('/banners', authorize('marketing', 'create'), mktCtrl.createBanner);
router.delete('/banners/:id', authorize('marketing', 'delete'), mktCtrl.deleteBanner);

// Reviews Moderation
router.get('/reviews', authorize('reviews', 'view'), revCtrl.getAdminReviews);
router.put('/reviews/:id', authorize('reviews', 'edit'), revCtrl.updateReviewStatus);
router.delete('/reviews/:id', authorize('reviews', 'delete'), revCtrl.deleteReview);

// CMS & Enquiries
router.get('/cms', authorize('cms', 'view'), cmsCtrl.getAdminPages);
router.put('/cms/:slug', authorize('cms', 'edit'), cmsCtrl.updateAdminPage);
router.get('/enquiries', authorize('cms', 'view'), cmsCtrl.getContactEnquiries);

// Reports
router.get('/reports/sales', authorize('reports', 'view'), repCtrl.getSalesReport);
router.get('/reports/inventory', authorize('reports', 'view'), repCtrl.getInventoryReport);

// Settings
router.get('/settings', authorize('settings', 'view'), setCtrl.getSettings);
router.put('/settings', authorize('settings', 'edit'), setCtrl.updateSettings);

// Super Admin Only: Payment Gateway Configuration & Secrets
router.get('/payment-config', requireRole('SUPER_ADMIN'), payCtrl.getPaymentConfig);
router.post('/payment-config/reveal', requireRole('SUPER_ADMIN'), payCtrl.revealKeySecret);
router.post('/payment-config', requireRole('SUPER_ADMIN'), payCtrl.updatePaymentCredentials);

// Super Admin Only: Staff & Role RBAC Matrix
router.get('/staff', requireRole('SUPER_ADMIN'), staffCtrl.getStaffMembers);
router.post('/staff', requireRole('SUPER_ADMIN'), staffCtrl.createStaffMember);
router.put('/roles/permissions', requireRole('SUPER_ADMIN'), staffCtrl.updateRolePermissions);

// Audit Logs
router.get('/audit-logs', authorize('audit', 'view'), auditCtrl.getAuditLogs);

module.exports = router;
