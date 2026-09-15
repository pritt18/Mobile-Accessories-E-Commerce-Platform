const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const staticCmsPages = {
  'about-us': {
    slug: 'about-us',
    title: 'About Mobixia',
    content_html: `<h2>Engineered for Modern Devices</h2><p>At Mobixia, we craft premium smartphone and tech accessories that combine minimalist industrial aesthetics with unyielding durability. From military-spec drop protection to high-efficiency GaN power delivery, every product in our catalog undergoes rigorous quality testing.</p><p>Headquartered in Mumbai, India, we ship nationwide with express door-to-door courier delivery and hassle-free warranty backing.</p>`,
    meta_title: 'About Mobixia - Mobile Accessories',
    meta_description: 'Learn more about Mobixia and our mission to provide authentic mobile accessories.',
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content_html: `<h2>Your Privacy Matters</h2><p>We collect and utilize your personal information strictly for order processing, customer support, and tailored shopping experiences. We never sell or lease your personal data to third parties. All online payments are processed through RBI-authorized payment gateways under 256-bit SSL encryption.</p>`,
    meta_title: 'Privacy Policy - Mobixia',
    meta_description: 'How Mobixia protects and handles your personal information securely.',
  },
  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    content_html: `<h2>Terms of Service</h2><p>By browsing or purchasing from Mobixia, you agree to our standard terms of service. Products are subject to stock availability and prices may be updated without prior notice. Dispatched orders can be tracked in real-time through our order tracking portal.</p>`,
    meta_title: 'Terms & Conditions - Mobixia',
    meta_description: 'Terms and conditions governing purchases on Mobixia.',
  },
  'shipping-policy': {
    slug: 'shipping-policy',
    title: 'Shipping & Delivery Policy',
    content_html: `<h2>Fast & Reliable Express Shipping</h2><p>We offer <strong>Free Standard Shipping</strong> on all orders exceeding the configured threshold. Orders are typically processed and dispatched within 24 business hours. Estimated delivery timelines: Metro cities (1-3 business days), rest of India (3-5 business days).</p>`,
    meta_title: 'Shipping Policy - Mobixia',
    meta_description: 'Delivery timelines, shipping methods, and rates across India.',
  },
  'refund-policy': {
    slug: 'refund-policy',
    title: 'Refund & Return Policy',
    content_html: `<h2>7-Day Hassle-Free Returns</h2><p>If you receive a defective or incompatible product, you can initiate a return or replacement request within 7 days of delivery directly through your account dashboard or order tracking page. Refunds are processed to original payment methods within 3-5 business days of return verification.</p>`,
    meta_title: 'Refund & Return Policy - Mobixia',
    meta_description: '7-day replacement and refund policy for all purchases.',
  },
};

const getCmsPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = staticCmsPages[slug];
    if (!page) {
      // Return a basic fallback if page not found
      return successResponse(res, {
        slug,
        title: slug.replace(/-/g, ' ').toUpperCase(),
        content_html: `<p>Information for ${slug} will be available shortly.</p>`,
      });
    }
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

const getStoreSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const map = {};
    settings.forEach((s) => {
      // Don't expose sensitive keys publicly
      if (!s.key.includes('secret') && !s.key.includes('key_secret')) {
        map[s.key] = s.value;
      }
    });
    return successResponse(res, map);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getCmsPage,
  submitContact,
  getStoreSettings,
  staticCmsPages,
};

