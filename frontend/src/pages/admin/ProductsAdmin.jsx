import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Image,
  Upload,
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';

export const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [imageUrl, setImageUrl] = useState('');

  // Variants in form
  const [variants, setVariants] = useState([
    { sku: '', color: 'Black', sizeOrModel: 'Standard', price: 999, mrp: 1999, stock: 50 },
  ]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get(`/admin/products?search=${encodeURIComponent(search)}`),
        api.get('/categories'),
      ]);
      if (pRes.data?.success) setProducts(pRes.data.data);
      if (cRes.data?.success) setCategories(cRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setBrandId('');
    setDescription('');
    setIsFeatured(false);
    setIsBestSeller(false);
    setStatus('ACTIVE');
    setImageUrl('https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80');
    setVariants([
      { sku: `SKU-${Date.now().toString().slice(-4)}-1`, color: 'Space Black', sizeOrModel: 'Universal', price: 999, mrp: 1999, stock: 50 },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setCategoryId(p.category_id);
    setBrandId(p.brand_id || '');
    setDescription(p.description || '');
    setIsFeatured(p.is_featured);
    setIsBestSeller(p.is_best_seller);
    setStatus(p.status);
    setImageUrl(p.primaryImage || '');
    if (p.variants && p.variants.length > 0) {
      setVariants(
        p.variants.map((v) => ({
          sku: v.sku,
          color: v.color || '',
          sizeOrModel: v.size_or_model || '',
          price: v.price,
          mrp: v.mrp,
          stock: v.stock,
        }))
      );
    }
    setIsModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setVariants([
      ...variants,
      { sku: `SKU-${Date.now().toString().slice(-4)}-${variants.length + 1}`, color: 'Titanium', sizeOrModel: 'Pro', price: 1299, mrp: 2499, stock: 30 },
    ]);
  };

  const handleRemoveVariantRow = (idx) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        categoryId: parseInt(categoryId),
        brandId: brandId ? parseInt(brandId) : null,
        description,
        isFeatured,
        isBestSeller,
        status,
        images: imageUrl ? [{ url: imageUrl }] : [],
        variants,
      };

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      loadProducts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Product Catalog Management</h1>
          <p className="text-xs text-gray-400 mt-1">Manage mobile accessories, variants, pricing, and stock levels</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-brand-500/20"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#11141d] rounded-2xl border border-gray-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or SKU..."
            className="w-full h-9 pl-9 pr-3 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Starting Price</th>
                <th className="p-4">Variants</th>
                <th className="p-4">Inventory Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Loading catalog...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-850/50 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.primaryImage || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=80&auto=format&fit=crop&q=80'}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-900 border border-gray-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate max-w-xs">{p.name}</div>
                          <div className="text-[10px] text-gray-500">{p.brand?.name || 'Mobixia'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{p.category?.name}</td>
                    <td className="p-4 font-bold text-white">{formatCurrency(p.minPrice)}</td>
                    <td className="p-4 text-gray-400 font-semibold">{p.variantsCount} options</td>
                    <td className="p-4">
                      {p.totalStock <= 5 ? (
                        <span className="inline-flex items-center space-x-1 text-rose-400 font-bold">
                          <AlertTriangle size={13} />
                          <span>{p.totalStock} left</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">{p.totalStock} units</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-400 hover:bg-gray-800 transition"
                        title="Edit Product"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition"
                        title="Delete Product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Product Details' : 'Add New Product to Catalog'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Product Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AeroShield Frosted MagSafe Case"
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Primary Image URL</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Product Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of features, materials, and benefits..."
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>

          {/* Variants Builder */}
          <div className="pt-2 border-t border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px]">Product Variants & Stock</span>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg flex items-center space-x-1"
              >
                <Plus size={13} />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {variants.map((v, idx) => (
                <div key={idx} className="p-3 bg-gray-900 rounded-xl border border-gray-800 grid grid-cols-6 gap-2 items-center">
                  <div className="col-span-2">
                    <label className="text-[10px] text-gray-400 block">Model/Size</label>
                    <input
                      type="text"
                      value={v.sizeOrModel}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].sizeOrModel = e.target.value;
                        setVariants(updated);
                      }}
                      placeholder="e.g. iPhone 15 Pro"
                      className="w-full h-8 px-2 bg-gray-950 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block">Color</label>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].color = e.target.value;
                        setVariants(updated);
                      }}
                      placeholder="Titanium"
                      className="w-full h-8 px-2 bg-gray-950 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block">Price (?)</label>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].price = parseFloat(e.target.value);
                        setVariants(updated);
                      }}
                      className="w-full h-8 px-2 bg-gray-950 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block">Stock</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].stock = parseInt(e.target.value);
                        setVariants(updated);
                      }}
                      className="w-full h-8 px-2 bg-gray-950 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariantRow(idx)}
                      className="text-gray-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6 pt-2 border-t border-gray-800">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600"
              />
              <span className="text-gray-300 font-bold">Best Seller Badge</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600"
              />
              <span className="text-gray-300 font-bold">Featured on Home</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg mt-4"
          >
            {editingId ? 'Save Changes' : 'Create Product'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
