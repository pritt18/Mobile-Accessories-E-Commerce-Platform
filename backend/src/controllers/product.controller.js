const { successResponse, errorResponse } = require('../utils/response');
const products = require('../data/products.json');
const { CATEGORIES } = require('./category.controller');

/**
 * Helper to format product for responses
 */
const formatProduct = (p) => {
  const minPrice = p.price;
  const minMrp = p.mrp || p.price;
  const discountPercent = p.discountPercent || (minMrp > minPrice ? Math.round(((minMrp - minPrice) / minMrp) * 100) : 0);
  const primaryImage = p.primaryImage || (p.images && p.images[0]) || '';
  const totalStock = p.stock || (p.variants ? p.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 50);

  const images = (p.images && p.images.length > 0 ? p.images : [primaryImage]).map((img, idx) => ({
    id: idx + 1,
    url: typeof img === 'string' ? img : (img.url || primaryImage),
    is_primary: idx === 0,
  }));

  const variants = (p.variants || []).map((v) => ({
    ...v,
    image: v.image || primaryImage,
    size_or_model: v.model || v.size_or_model || 'Standard',
    color: v.color || 'Standard',
    sku: v.sku || `VOR-${p.id}-${v.id}`,
  }));

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: {
      id: p.category === 'phone-cases' ? 1 : p.category === 'chargers' ? 2 : p.category === 'cables' ? 3 : p.category === 'audio' ? 4 : p.category === 'power-banks' ? 5 : 6,
      name: p.category ? p.category.replace('-', ' ').toUpperCase() : 'Accessories',
      slug: p.category
    },
    brand: {
      id: 1,
      name: p.brand || 'Vortique',
      slug: (p.brand || 'vortique').toLowerCase().replace(/\s+/g, '-')
    },
    price: minPrice,
    mrp: minMrp,
    discountPercent,
    inStock: p.inStock !== false && totalStock > 0,
    totalStock,
    primaryImage,
    images,
    variants,
    avgRating: p.rating || 4.8,
    reviewCount: p.reviewCount || 15,
    isFeatured: !!p.isFeatured,
    isBestSeller: !!p.isBestSeller,
    specifications: p.specifications || {}
  };
};

/**
 * Get products listing with rich filters, sorting, and pagination
 */
const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      isFeatured,
      isBestSeller,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    let filtered = [...products];

    // Filter by Category
    if (category) {
      const catSlug = String(category).toLowerCase();
      filtered = filtered.filter((p) => {
        if (!p.category) return false;
        return p.category.toLowerCase() === catSlug ||
               (catSlug === '1' && p.category === 'phone-cases') ||
               (catSlug === '2' && p.category === 'chargers') ||
               (catSlug === '3' && p.category === 'cables') ||
               (catSlug === '4' && p.category === 'audio') ||
               (catSlug === '5' && p.category === 'power-banks') ||
               (catSlug === '6' && p.category === 'stands-mounts');
      });
    }

    // Filter by Brand
    if (brand) {
      const brandStr = String(brand).toLowerCase();
      filtered = filtered.filter((p) => (p.brand || '').toLowerCase().includes(brandStr));
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Filter by price
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
    }

    // Filter by stock
    if (inStock === 'true') {
      filtered = filtered.filter((p) => p.inStock !== false);
    }

    // Filter by rating
    if (rating) {
      filtered = filtered.filter((p) => (p.rating || 4.5) >= parseFloat(rating));
    }

    // Featured / Best Seller
    if (isFeatured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured);
    }
    if (isBestSeller === 'true') {
      filtered = filtered.filter((p) => p.isBestSeller);
    }

    // Sorting
    if (sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'popular') {
      filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * take;

    const paginated = filtered.slice(skip, skip + take);
    const formatted = paginated.map(formatProduct);

    return successResponse(res, formatted, 'Products retrieved successfully', 200, {
      page: pageNum,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    });
  } catch (err) {
    console.error('getProducts error:', err);
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Get product by unique slug or ID
 */
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = products.find(
      (p) => p.slug === slug || String(p.id) === String(slug)
    );

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    const formatted = formatProduct(product);

    // Related products in same category
    const related = products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        mrp: p.mrp,
        primaryImage: p.primaryImage || (p.images && p.images[0]) || '',
      }));

    // Realistic review distribution
    const ratingDistribution = { 5: 78, 4: 32, 3: 8, 2: 4, 1: 2 };

    return successResponse(res, {
      ...formatted,
      relatedProducts: related,
      ratingDistribution,
      reviews: [
        {
          id: 1,
          rating: 5,
          title: 'Outstanding quality and fit!',
          comment: 'Perfect match for my device. Authentic build quality, premium texture, and fast delivery.',
          user: { name: 'Rahul Sharma', avatar: null },
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          rating: 5,
          title: 'Value for money product',
          comment: 'Exceeded expectations at this price point. Packaging was top-notch.',
          user: { name: 'Priya Verma', avatar: null },
          createdAt: new Date().toISOString()
        }
      ]
    });
  } catch (err) {
    console.error('getProductBySlug error:', err);
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Global Search Autosuggest Dropdown
 */
const searchAutosuggest = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return successResponse(res, { products: [], categories: [] });
    }

    const query = q.trim().toLowerCase();

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(query) || (p.category && p.category.toLowerCase().includes(query)))
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        mrp: p.mrp,
        image: p.primaryImage || (p.images && p.images[0]) || '',
      }));

    const matchedCategories = CATEGORIES
      .filter((c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query))
      .slice(0, 4);

    return successResponse(res, {
      products: matchedProducts,
      categories: matchedCategories,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Home page featured, trending, and new arrivals feeds
 */
const getHomeFeed = async (req, res) => {
  try {
    const bestSellers = products.filter((p) => p.isBestSeller).map(formatProduct);
    const trending = products.filter((p) => p.isFeatured).map(formatProduct);
    const newArrivals = products.slice(0, 8).map(formatProduct);

    return successResponse(res, {
      bestSellers,
      trending,
      newArrivals,
      categories: CATEGORIES,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  searchAutosuggest,
  getHomeFeed,
};
