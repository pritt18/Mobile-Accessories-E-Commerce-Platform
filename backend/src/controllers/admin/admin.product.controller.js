const products = require('../../data/products.json');
const { successResponse, errorResponse } = require('../../utils/response');

const getAdminProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let list = [...products];

    if (category) {
      list = list.filter((p) => p.category === category || String(p.id) === String(category));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    const total = list.length;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * take;

    const paginated = list.slice(skip, skip + take);

    const formatted = paginated.map((p) => {
      const totalStock = p.stock || (p.variants ? p.variants.reduce((a, v) => a + (v.stock || 0), 0) : 50);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: {
          id: p.category === 'phone-cases' ? 1 : 2,
          name: p.category ? p.category.toUpperCase() : 'General'
        },
        brand: {
          id: 1,
          name: p.brand || 'Mobixia'
        },
        status: 'ACTIVE',
        is_featured: !!p.isFeatured,
        is_best_seller: !!p.isBestSeller,
        variants: p.variants || [],
        images: (p.images || []).map((url, i) => ({ id: i + 1, url, is_primary: i === 0 })),
        totalStock,
        priceRange: `₹${p.price}`,
        minPrice: p.price,
        minMrp: p.mrp || p.price,
        variantsCount: (p.variants || []).length,
        primaryImage: p.primaryImage || (p.images && p.images[0]) || '',
      };
    });

    return successResponse(res, formatted, 'Products retrieved', 200, {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createProduct = async (req, res) => {
  return successResponse(res, req.body, 'Product catalog is configured in static mode', 201);
};

const updateProduct = async (req, res) => {
  return successResponse(res, req.body, 'Product updated (static mode)');
};

const deleteProduct = async (req, res) => {
  return successResponse(res, null, 'Product removed (static mode)');
};

module.exports = {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
