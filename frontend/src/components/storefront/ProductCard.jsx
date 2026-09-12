import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { RatingStars } from '../common/RatingStars';
import { formatCurrency } from '../../utils/formatters';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;

    setAdding(true);
    const variantId = product.variants?.[0]?.id || product.id;
    const res = await addToCart(variantId, 1);
    setAdding(false);

    if (res?.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const brandName = (product.brand?.name || product.category?.name || 'Mobixia')
    .replace(/NexGear/gi, 'Mobixia');
  const productName = (product.name || '').replace(/NexGear/gi, 'Mobixia');

  return (
    <div className="group relative bg-white border border-gray-200/90 rounded-2xl overflow-hidden hover:border-brand-500/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between shadow-xs">
      {/* Top Image Container */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-slate-50 border-b border-gray-100 overflow-hidden">
        <img
          src={product.primaryImage || product.images?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'}
          alt={productName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discountPercent > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs font-bold">
              Best Seller
            </span>
          )}
          {!product.inStock && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white shadow-xs">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition shadow-sm z-10 ${
            inWishlist
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 hover:bg-white text-slate-600 hover:text-rose-500 border border-gray-200'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} className={inWishlist ? 'fill-white' : ''} />
        </button>
      </Link>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Category */}
          <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider truncate mb-1">
            {brandName}
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="text-sm font-bold text-slate-900 hover:text-brand-600 line-clamp-2 transition leading-snug"
          >
            {productName}
          </Link>
        </div>

        <div>
          {/* Ratings */}
          <div className="my-1.5">
            <RatingStars rating={product.avgRating || 4.8} count={product.reviewCount || 12} size={13} />
          </div>

          {/* Price Row */}
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-base font-black text-slate-950">
              {formatCurrency(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.mrp)}
              </span>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="mt-3">
            {product.inStock ? (
              <button
                onClick={handleQuickAdd}
                disabled={adding}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-sm ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-[0.98]'
                }`}
              >
                {added ? (
                  <>
                    <Check size={14} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    <span>{adding ? 'Adding...' : 'Quick Add'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-center"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
