import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Check,
  Share2,
  MapPin,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { RatingStars } from '../../components/common/RatingStars';
import { ProductCard } from '../../components/storefront/ProductCard';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);

  // Review submission modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const inWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.data?.success) {
          const p = res.data.data;
          setProduct(p);
          if (p.variants?.length > 0) {
            setSelectedVariant(p.variants[0]);
          }
          const primaryImg = p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url || p.variants?.[0]?.image;
          setSelectedImage(primaryImg || '');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setPincodeChecking(true);
    try {
      const res = await api.get(`/auth/check-pincode?pincode=${pincode}`);
      if (res.data?.success) {
        setPincodeResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPincodeChecking(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    await addToCart(selectedVariant.id, qty);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    await addToCart(selectedVariant.id, qty);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment) return;
    setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      if (res.data?.success) {
        setReviewSuccess('Review published successfully! Thank you.');
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewSuccess('');
          setReviewComment('');
          setReviewTitle('');
          // Refresh product
          api.get(`/products/${slug}`).then((r) => r.data?.success && setProduct(r.data.data));
        }, 1000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <Link to="/products" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-white text-xs font-bold inline-block shadow-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.price || 0;
  const currentMrp = selectedVariant?.mrp || product.mrp || 0;
  const discountPercent = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;
  const currentStock = selectedVariant ? selectedVariant.stock : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 bg-white">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-brand-600 transition">Home</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category?.slug}`} className="hover:text-brand-600 transition">
          {product.category?.name || 'Category'}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Section: Gallery + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Gallery */}
        <div className="space-y-4 sticky top-24">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-gray-200 shadow-sm flex items-center justify-center">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-18 h-18 rounded-2xl overflow-hidden bg-slate-50 border-2 transition shrink-0 ${
                    selectedImage === img.url ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ width: '4.5rem', height: '4.5rem' }}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="space-y-6">
          {/* Brand & SKU */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              {product.brand?.name || 'Mobixia'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              SKU: {selectedVariant?.sku || 'N/A'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Ratings & Reviews summary */}
          <div className="flex items-center space-x-3 text-xs">
            <RatingStars rating={product.avgRating || 4.8} count={product.reviewCount || 12} size={16} />
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600 font-semibold flex items-center space-x-1">
              <ShieldCheck size={14} />
              <span>Verified Authentic</span>
            </span>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 flex items-baseline space-x-4">
            <span className="text-3xl font-black text-slate-950 tracking-tight">
              {formatCurrency(currentPrice)}
            </span>
            {currentMrp > currentPrice && (
              <>
                <span className="text-base text-slate-400 line-through">
                  {formatCurrency(currentMrp)}
                </span>
                <span className="text-xs font-bold text-rose-600">
                  Save {formatCurrency(currentMrp - currentPrice)} ({discountPercent}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Stock Status Badge */}
          <div>
            {currentStock > 5 ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Stock • Ready to Dispatch</span>
              </span>
            ) : currentStock > 0 ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle size={14} />
                <span>Only {currentStock} units left in stock!</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                <span>Sold Out</span>
              </span>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Option / Device Model:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.image) setSelectedImage(v.image);
                      }}
                      className={`p-3 rounded-xl text-left border transition ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs ring-1 ring-brand-500'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {[v.size_or_model, v.color].filter(Boolean).join(' • ') || 'Standard'}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mt-0.5">
                        {formatCurrency(v.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-300 rounded-xl p-1 bg-slate-50">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-2 text-slate-500 hover:text-slate-900 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold text-slate-900 px-3">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(currentStock, qty + 1))}
                  className="p-2 text-slate-500 hover:text-slate-900 transition"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add To Cart */}
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="flex-1 py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center space-x-2 active:scale-95 shadow-sm"
              >
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition ${
                  inWishlist
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-gray-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Save to Wishlist"
              >
                <Heart size={18} className={inWishlist ? 'fill-rose-500' : ''} />
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={currentStock <= 0}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-brand-500/25 transition active:scale-[0.99]"
            >
              <Zap size={16} className="fill-white" />
              <span>Buy Now (Instant Checkout)</span>
            </button>
          </div>

          {/* Pincode Delivery Estimator */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
              <Truck size={16} className="text-brand-600" />
              <span>Estimated Delivery Date</span>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode (e.g. 400050)"
                  className="w-full h-9 pl-9 pr-3 bg-white border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
                <MapPin className="absolute left-3 top-2 text-gray-400" size={14} />
              </div>
              <button
                type="submit"
                disabled={pincodeChecking || pincode.length !== 6}
                className="px-4 h-9 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
              >
                {pincodeChecking ? '...' : 'Check'}
              </button>
            </form>

            {pincodeResult && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center space-x-2">
                <Check size={16} className="shrink-0 text-emerald-600" />
                <span>
                  Delivery to <strong>{pincodeResult.city || pincode}</strong> in <strong>{pincodeResult.estimatedDelivery}</strong> • Free Shipping
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="pt-10 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Product Overview</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Key Specs Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="pt-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Technical Specifications
              </h4>
              <div className="rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-200 bg-white shadow-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 p-3 text-xs">
                    <span className="font-semibold text-slate-500">{key}</span>
                    <span className="col-span-2 text-slate-800">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assurance Cards */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <Truck size={16} className="text-brand-600" />
              <span>Free Shipping Nationwide</span>
            </div>
            <p className="text-xs text-slate-500">On all prepaid orders over ₹499 via BlueDart & Delhivery.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <RotateCcw size={16} className="text-emerald-600" />
              <span>7-Day Replacement Guarantee</span>
            </div>
            <p className="text-xs text-slate-500">Hassle-free replacement for defective or incompatible items.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <ShieldCheck size={16} className="text-brand-600" />
              <span>Official Manufacturer Warranty</span>
            </div>
            <p className="text-xs text-slate-500">Backed by 1-year direct replacement warranty support.</p>
          </div>
        </div>
      </div>

      {/* Ratings & Customer Reviews Section */}
      <section className="pt-10 border-t border-gray-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Customer Reviews</h3>
            <div className="flex items-center space-x-3 mt-1.5">
              <RatingStars rating={product.avgRating || 4.8} count={product.reviews?.length || 0} size={18} />
              <span className="text-xs text-slate-500">Based on verified purchases</span>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-5 py-2.5 bg-white hover:bg-brand-50 text-slate-800 hover:text-brand-600 text-xs font-bold rounded-xl border border-gray-300 hover:border-brand-300 transition shadow-xs self-start sm:self-auto"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-gray-200 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{rev.user?.name || 'Verified Buyer'}</span>
                    <span className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      Verified Purchase
                    </span>
                  </div>
                  <RatingStars rating={rev.rating} showValue={false} size={13} />
                </div>
                {rev.title && <div className="text-xs font-bold text-slate-800">{rev.title}</div>}
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No reviews yet. Be the first to share your experience with this product!
            </div>
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-gray-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">You May Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Review Submission Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Write a Customer Review"
      >
        {reviewSuccess ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 text-center font-medium">
            {reviewSuccess}
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star
                      size={24}
                      className={star <= reviewRating ? 'fill-amber-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="E.g. Great build quality, fits like a glove"
                className="w-full h-10 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Review</label>
              <textarea
                required
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your honest thoughts on performance, material, and durability..."
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              {reviewSubmitting ? 'Publishing...' : 'Submit Review'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
