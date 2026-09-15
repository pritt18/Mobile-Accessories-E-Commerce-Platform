const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

const { staticCmsPages } = require('../cms.controller');

const getAdminPages = async (req, res) => {
  try {
    const pages = Object.values(staticCmsPages);
    return successResponse(res, pages);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateAdminPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, contentHtml, metaTitle, metaDescription } = req.body;

    staticCmsPages[slug] = {
      slug,
      title: title || slug,
      content_html: contentHtml || '<p>Content</p>',
      meta_title: metaTitle,
      meta_description: metaDescription,
      updated_by: req.user.name,
      updatedAt: new Date(),
    };

    return successResponse(res, staticCmsPages[slug], 'Page updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getContactEnquiries = async (req, res) => {
  try {
    const enquiries = await prisma.contactEnquiry.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(res, enquiries);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getAdminPages,
  updateAdminPage,
  getContactEnquiries,
};
