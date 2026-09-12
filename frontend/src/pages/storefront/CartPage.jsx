import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Bookmark,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

export const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    count,
    discount,
    coupon,
    updateQty,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    savedForLater,
    saveForLater,
    moveToCartFromSaved,
    removeSavedForLater,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Free shipping threshold = ₹499
  const freeShippingThreshold = 499;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : 50;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);
  const finalTotal = Math.max(0, subtotal - discount) + (subtotal > 0 ? shippingFee : 0);

  const handleApplyCoupon = async (codeToApply) => {
    const targetCode = (codeToApply || couponInput).trim();
    if (!targetCode) return;
    setCouponError('');
    setCouponSuccess('');
    setIsApplyingCoupon(true);

    try {
      const res = await applyCoupon(targetCode);
      if (res && res.success) {
        setCouponSuccess(res.message || `Coupon "${targetCode}" applied successfully!`);
        setCouponInput('');
      } else {
        setCouponError(res?.message || 'Invalid coupon or criteria not met.');
      }
    } catch (err) {
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess('');
    setCouponError('');
  };

  if (items.length === 0 && (!savedForLater || savedForLater.length === 0)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-md">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-600 shadow-xs">
            <ShoppingBag size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">Your Shopping Cart is Empty</h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
              Looks like you haven't added any mobile accessories to your bag yet.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/products"
              className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-6 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition transform active:scale-[0.98]"
            >
              <span>Explore Top Accessories</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Link to="/" className="hover:text-brand-600 transition">Home</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Shopping Cart <span className="text-base sm:text-lg font-bold text-slate-400">({count} {count === 1 ? 'item' : 'items'})</span>
          </h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Trash2 size={14} />
            <span>Clear Entire Cart</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items & Saved for Later Shelf */}
        <div className="lg:col-span-8 space-y-6">
          {/* Free Shipping Progress Meter */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center space-x-2">
                <Truck size={16} className="text-brand-600" />
                <span>
                  {isFreeShipping ? (
                    <strong className="text-emerald-600">🎉 Congratulations! You unlocked FREE Express Delivery</strong>
                  ) : (
                    <span>
                      Add <strong className="text-brand-600">{formatCurrency(remainingForFree)}</strong> more for <strong>FREE Delivery</strong>
                    </span>
                  )}
                </span>
              </span>
              <span className="font-bold text-slate-500">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Active Cart Items Table / List */}
          {items.length > 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/50"
                >
                  {/* Product Info */}
                  <div className="flex items-center space-x-4 min-w-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=120&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-50 border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-brand-600">
                        Mobixia Signature
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                        {item.name}
                      </h3>
                      {(item.color || item.model) && (
                        <div className="text-xs text-slate-500 flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-medium">
                            {[item.color, item.model].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                      )}
                      <div className="text-xs font-semibold text-slate-700 sm:hidden pt-1">
                        Price: {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {/* Unit Price (Desktop) */}
                    <div className="hidden sm:block text-right">
                      <div className="text-xs text-slate-400">Unit Price</div>
                      <div className="text-xs font-bold text-slate-800">{formatCurrency(item.price)}</div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-gray-200 rounded-xl bg-slate-50 p-1">
                      <button
                        onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        disabled={item.qty <= 1}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-gray-200 text-slate-700 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={item.qty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1 && val <= 10) {
                            updateQty(item.id, val);
                          }
                        }}
                        className="w-10 text-center font-bold text-xs text-slate-900 bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-gray-200 text-slate-700 flex items-center justify-center transition"
                        title="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Item Total Price */}
                    <div className="text-right min-w-[75px]">
                      <div className="text-xs text-slate-400 hidden sm:block">Total</div>
                      <div className="text-sm font-black text-slate-900">
                        {formatCurrency(item.itemTotal)}
                      </div>
                    </div>

                    {/* Action buttons (Save for later / Remove) */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => saveForLater(item)}
                        className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-blue-50 transition"
                        title="Save for Later"
                      >
                        <Bookmark size={16} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-3">
              <p className="text-xs text-slate-500 font-medium">All items have been saved for later or moved to checkout.</p>
              <Link to="/products" className="text-xs font-bold text-brand-600 hover:underline">
                Continue Shopping Accessories
              </Link>
            </div>
          )}

          {/* Saved For Later Shelf */}
          {savedForLater && savedForLater.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Bookmark size={18} className="text-brand-600" />
                  <span>Saved For Later ({savedForLater.length})</span>
                </h2>
                <span className="text-xs text-slate-500">Items saved for future checkout</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedForLater.map((saved) => (
                  <div
                    key={saved.variantId}
                    className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between gap-3 hover:border-brand-300 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={saved.image}
                        alt={saved.name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{saved.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {[saved.color, saved.model].filter(Boolean).join(' • ') || 'Standard'}
                        </div>
                        <div className="text-xs font-black text-slate-900 mt-1">
                          {formatCurrency(saved.price)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2 shrink-0">
                      <button
                        onClick={() => moveToCartFromSaved(saved)}
                        className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs transition border border-brand-200 shadow-xs"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => removeSavedForLater(saved.variantId)}
                        className="text-[11px] text-slate-400 hover:text-rose-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <RotateCcw size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">7-Day Easy Returns</div>
                <div className="text-[11px] text-slate-500">Hassle-free doorstep pickup</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">100% Genuine Gear</div>
                <div className="text-[11px] text-slate-500">Direct from OEM brands</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Express Courier</div>
                <div className="text-[11px] text-slate-500">Bluedart & Delhivery Air</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Price Summary & Coupons */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-md space-y-6 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 border-b border-gray-200 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-slate-500">{count} Items</span>
            </h2>

            {/* Coupon Application Box */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Promo or Coupon Code</label>
              {coupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <Tag size={16} />
                    <span>
                      Coupon <strong>{coupon.code}</strong> applied (-{formatCurrency(discount)})
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-slate-600 hover:text-rose-600 ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. FIRST10"
                      className="flex-1 h-10 px-3.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 uppercase font-mono placeholder:normal-case placeholder-slate-400 focus:bg-white focus:border-brand-500"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-4 h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>

                  {/* Quick Clickable Promo Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">Try:</span>
                    <button
                      onClick={() => handleApplyCoupon('FIRST10')}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                    >
                      FIRST10 (10% OFF)
                    </button>
                    <button
                      onClick={() => handleApplyCoupon('FREESHIP')}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      FREESHIP
                    </button>
                  </div>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] font-semibold text-rose-500 mt-1">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-[11px] font-semibold text-emerald-600 mt-1">{couponSuccess}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-slate-600 border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal ({count} items)</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-emerald-600 font-bold">FREE</strong>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Goods & Services Tax (18% GST)</span>
                <span>Included in prices</span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-brand-600 font-black">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              disabled={items.length === 0}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-brand-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            {/* Security Guarantee */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>256-Bit SSL Checkout • RBI Compliant</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Safe payment with UPI, Credit/Debit Cards, NetBanking, or COD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
