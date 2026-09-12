const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

const getAdminPages = async (req, res) => {
  try {
    const pages = await prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } });
    return successResponse(res, pages);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateAdminPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, contentHtml, metaTitle, metaDescription } = req.body;

    const updated = await prisma.cmsPage.upsert({
      where: { slug },
      update: {
        title,
        content_html: contentHtml,
        meta_title: metaTitle,
        meta_description: metaDescription,
        updated_by: req.user.name,
      },
      create: {
        slug,
        title: title || slug,
        content_html: contentHtml || '<p>Content</p>',
        meta_title: metaTitle,
        meta_description: metaDescription,
        updated_by: req.user.name,
      },
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'cms',
      action: 'update_page',
      description: `Updated CMS page "${slug}"`,
      req,
    });

    return successResponse(res, updated, 'Page updated successfully');
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
