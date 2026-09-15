const { successResponse, errorResponse } = require('../utils/response');
const products = require('../data/products.json');

const CATEGORIES = [
  {
    id: 1,
    name: 'Cases & Covers',
    slug: 'phone-cases',
    image: '/images/products/product_img_1.jpg',
    description: 'Shockproof, leather flip, and silicone cases with military-grade drop protection'
  },
  {
    id: 2,
    name: 'Fast Chargers',
    slug: 'chargers',
    image: '/images/products/product_img_6.jpg',
    description: 'High-speed GaN adapters, dual-port PD wall chargers up to 65W'
  },
  {
    id: 3,
    name: 'Cables & Protectors',
    slug: 'cables',
    image: '/images/products/product_img_7.jpg',
    description: '100W braided nylon fast charging cables and silicone spiral cable protectors'
  },
  {
    id: 4,
    name: 'Audio & Earbuds',
    slug: 'audio',
    image: '/images/products/product_img_12.jpg',
    description: 'ANC wireless earbuds, ENC calling, and over-ear studio headphones'
  },
  {
    id: 5,
    name: 'Power Banks',
    slug: 'power-banks',
    image: '/images/products/product_img_15.jpg',
    description: '10000mAh MagSafe magnetic wireless & 20000mAh 22.5W high capacity power banks'
  },
  {
    id: 6,
    name: 'Stands & Mounts',
    slug: 'stands-mounts',
    image: '/images/products/product_img_16.jpg',
    description: '360° rotating dashboard car phone mounts and aluminum adjustable desk stands'
  }
];

const getCategories = async (req, res) => {
  try {
    const list = CATEGORIES.map((cat) => {
      const count = products.filter((p) => p.category === cat.slug).length;
      return {
        ...cat,
        status: 'ACTIVE',
        children: [],
        _count: { products: count }
      };
    });
    return successResponse(res, list);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cat = CATEGORIES.find((c) => c.slug === slug || String(c.id) === String(slug));
    if (!cat) return errorResponse(res, 'Category not found', 404);
    const count = products.filter((p) => p.category === cat.slug).length;
    return successResponse(res, {
      ...cat,
      status: 'ACTIVE',
      children: [],
      _count: { products: count }
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  CATEGORIES
};
