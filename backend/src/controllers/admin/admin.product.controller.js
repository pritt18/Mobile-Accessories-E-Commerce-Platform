const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

const getAdminProducts = async (req, res) => {
  try {
    const { category, brand, status, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (category) where.category_id = parseInt(category);
    if (brand) where.brand_id = parseInt(brand);
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          variants: true,
          images: { orderBy: { sort_order: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const formatted = products.map((p) => {
      const totalStock = p.variants.reduce((a, v) => a + v.stock, 0);
      const minPrice = p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : 0;
      const minMrp = p.variants.length ? Math.min(...p.variants.map((v) => v.mrp)) : 0;
      return {
        ...p,
        totalStock,
        priceRange: `?${minPrice}`,
        minPrice,
        minMrp,
        variantsCount: p.variants.length,
        primaryImage: p.images[0]?.url || p.variants[0]?.image || '',
      };
    });

    return successResponse(res, formatted, 'Products retrieved', 200, {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      categoryId,
      brandId,
      description,
      specsJson,
      status = 'ACTIVE',
      isFeatured = false,
      isBestSeller = false,
      variants = [],
      images = [],
    } = req.body;

    if (!name || !categoryId) {
      return errorResponse(res, 'Name and category are required', 400);
    }

    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingSlug = await prisma.product.findUnique({ where: { slug: productSlug } });
    const finalSlug = existingSlug ? `${productSlug}-${Date.now()}` : productSlug;

    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name,
          slug: finalSlug,
          category_id: parseInt(categoryId),
          brand_id: brandId ? parseInt(brandId) : null,
          description,
          specs_json: typeof specsJson === 'object' ? JSON.stringify(specsJson) : specsJson,
          status,
          is_featured: Boolean(isFeatured),
          is_best_seller: Boolean(isBestSeller),
          created_by: req.user.id,
        },
      });

      // Add variants
      if (variants && variants.length > 0) {
        for (const v of variants) {
          await tx.productVariant.create({
            data: {
              product_id: prod.id,
              sku: v.sku || `SKU-${prod.id}-${Math.floor(Math.random() * 10000)}`,
              color: v.color || null,
              color_code: v.colorCode || null,
              size_or_model: v.sizeOrModel || null,
              price: parseFloat(v.price) || 0,
              mrp: parseFloat(v.mrp) || parseFloat(v.price) || 0,
              stock: parseInt(v.stock) || 0,
              image: v.image || null,
            },
          });
        }
      }

      // Add images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await tx.productImage.create({
            data: {
              product_id: prod.id,
              url: images[i].url || images[i],
              is_primary: i === 0,
              sort_order: i,
            },
          });
        }
      }

      return prod;
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'products',
      action: 'create',
      description: `Created product "${name}" (ID: ${newProduct.id})`,
      req,
    });

    return successResponse(res, newProduct, 'Product created successfully', 201);
  } catch (err) {
    console.error('createProduct error:', err);
    return errorResponse(res, err.message, 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      categoryId,
      brandId,
      description,
      specsJson,
      status,
      isFeatured,
      isBestSeller,
      variants,
      images,
    } = req.body;

    const prodId = parseInt(id);
    const existing = await prisma.product.findUnique({ where: { id: prodId } });
    if (!existing) return errorResponse(res, 'Product not found', 404);

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id: prodId },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
          ...(categoryId && { category_id: parseInt(categoryId) }),
          ...(brandId !== undefined && { brand_id: brandId ? parseInt(brandId) : null }),
          ...(description !== undefined && { description }),
          ...(specsJson !== undefined && { specs_json: typeof specsJson === 'object' ? JSON.stringify(specsJson) : specsJson }),
          ...(status && { status }),
          ...(isFeatured !== undefined && { is_featured: Boolean(isFeatured) }),
          ...(isBestSeller !== undefined && { is_best_seller: Boolean(isBestSeller) }),
        },
      });

      // Update variants if provided
      if (variants && Array.isArray(variants)) {
        await tx.productVariant.deleteMany({ where: { product_id: prodId } });
        for (const v of variants) {
          await tx.productVariant.create({
            data: {
              product_id: prodId,
              sku: v.sku || `SKU-${prodId}-${Math.floor(Math.random() * 10000)}`,
              color: v.color || null,
              color_code: v.colorCode || null,
              size_or_model: v.sizeOrModel || null,
              price: parseFloat(v.price) || 0,
              mrp: parseFloat(v.mrp) || parseFloat(v.price) || 0,
              stock: parseInt(v.stock) || 0,
              image: v.image || null,
            },
          });
        }
      }

      // Update images if provided
      if (images && Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { product_id: prodId } });
        for (let i = 0; i < images.length; i++) {
          await tx.productImage.create({
            data: {
              product_id: prodId,
              url: images[i].url || images[i],
              is_primary: i === 0,
              sort_order: i,
            },
          });
        }
      }

      return prod;
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'products',
      action: 'update',
      description: `Updated product "${existing.name}" (ID: ${prodId})`,
      req,
    });

    return successResponse(res, updated, 'Product updated successfully');
  } catch (err) {
    console.error('updateProduct error:', err);
    return errorResponse(res, err.message, 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const prodId = parseInt(id);
    const existing = await prisma.product.findUnique({ where: { id: prodId } });
    if (!existing) return errorResponse(res, 'Product not found', 404);

    await prisma.product.delete({ where: { id: prodId } });

    await logAuditAction({
      userId: req.user.id,
      module: 'products',
      action: 'delete',
      description: `Deleted product "${existing.name}" (ID: ${prodId})`,
      req,
    });

    return successResponse(res, null, 'Product deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
