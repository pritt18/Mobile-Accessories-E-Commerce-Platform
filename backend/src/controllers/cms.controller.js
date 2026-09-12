const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getCmsPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await prisma.cmsPage.findUnique({ where: { slug } });
    if (!page) return errorResponse(res, 'Page not found', 404);
    return successResponse(res, page);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return errorResponse(res, 'Name, email, and message are required', 400);
    }

    const enquiry = await prisma.contactEnquiry.create({
      data: { name, email, phone, subject, message },
    });

    return successResponse(res, enquiry, 'Thank you! Your enquiry has been received. Our team will contact you shortly.', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getCmsPage,
  submitContact,
};
