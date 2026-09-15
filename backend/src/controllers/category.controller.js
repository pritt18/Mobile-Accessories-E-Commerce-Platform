const { successResponse, errorResponse } = require('../utils/response');
const products = require('../data/products.json');

const CATEGORIES = [
  {
    id: 1,
    name: 'Cases & Covers',
    slug: 'phone-cases',
    image: 'https://vortique.in/images/20260909131205_1-1.JPG',
    description: 'Shockproof, leather flip, and silicone cases with military-grade drop protection'
  },
  {
    id: 2,
    name: 'Fast Chargers',
    slug: 'chargers',
    image: 'https://vortique.in/images/20260912133602_charger.jpg',
    description: 'High-speed GaN adapters, dual-port PD wall chargers up to 65W'
  },
  {
    id: 3,
    name: 'Cables & Protectors',
    slug: 'cables',
    image: 'https://vortique.in/images/20260811001250_type%20c%20charger%20pack.webp',
    description: '100W braided nylon fast charging cables and silicone spiral cable protectors'
  },
  {
    id: 4,
    name: 'Audio & Earbuds',
    slug: 'audio',
    image: 'https://vortique.in/images/20260812173036_61YDbkyIGEL._AC_UY327_FMwebp_QL65_[1].jpg',
    description: 'ANC wireless earbuds, ENC calling, and over-ear studio headphones'
  },
  {
    id: 5,
    name: 'Power Banks',
    slug: 'power-banks',
    image: 'https://vortique.in/images/20260811004149_71j6QvV04SL._AC_UL480_FMwebp_QL65_[1].jpg',
    description: '10000mAh MagSafe magnetic wireless & 20000mAh 22.5W high capacity power banks'
  },
  {
    id: 6,
    name: 'Stands & Mounts',
    slug: 'stands-mounts',
    image: 'https://vortique.in/images/20260811002228_car%20phone%20holder.webp',
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
