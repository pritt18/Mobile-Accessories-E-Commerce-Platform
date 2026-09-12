import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, ShieldCheck, Bookmark } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    items,
    savedForLater,
    subtotal,
    count,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeItem,
    saveForLater,
    moveToCartFromSaved,
    removeSavedForLater,
    coupon,
    discount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    const res = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const freeShippingThreshold = 499;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : 50;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const finalTotal = Math.max(0, subtotal - discount) + (subtotal > 0 ? shippingFee : 0);

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="text-brand-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900 tracking-wide">
                Your Shopping Cart <span className="text-slate-500 text-sm font-normal">({count})</span>
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={22} />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          {subtotal > 0 && (
            <div className="bg-slate-50 px-5 py-2.5 border-b border-gray-200 text-xs">
              {amountNeededForFreeShipping > 0 ? (
                <div>
                  <span className="text-slate-600">
                    Add <strong className="text-amber-600">{formatCurrency(amountNeededForFreeShipping)}</strong> more to get{' '}
                    <strong className="text-emerald-600">FREE Shipping</strong>!
                  </span>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-emerald-700 font-semibold flex items-center space-x-1.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Congratulations! You've unlocked FREE Express Shipping!</span>
                </div>
              )}
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your cart is currently empty</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Discover premium MagSafe cases, fast GaN chargers, and high-speed braided cables.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/products');
                  }}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-3 bg-slate-50 rounded-xl border border-gray-200/90 hover:border-gray-300 transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-18 h-18 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                    style={{ width: '4.5rem', height: '4.5rem' }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate hover:text-brand-600">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {[item.color, item.model].filter(Boolean).join(' • ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-0.5 bg-white">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold text-slate-900 px-2">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrency(item.itemTotal)}
                        </span>
                        <div className="flex items-center justify-end space-x-2 mt-1">
                          <button
                            type="button"
                            onClick={() => saveForLater(item)}
                            className="text-[10px] font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                            title="Save for later"
                          >
                            Save for later
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-rose-500 transition"
                            title="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Saved for Later Section */}
            {savedForLater && savedForLater.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  <Bookmark size={14} className="text-brand-600" />
                  <span>Saved For Later ({savedForLater.length})</span>
                </div>
                <div className="space-y-2">
                  {savedForLater.map((saved) => (
                    <div
                      key={saved.variantId}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img
                          src={saved.image}
                          alt={saved.name}
                          className="w-10 h-10 object-cover rounded-lg bg-white border border-gray-200 shrink-0"
                        />
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 truncate">{saved.name}</div>
                          <div className="text-[10px] text-slate-500">{formatCurrency(saved.price)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => moveToCartFromSaved(saved)}
                          className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-[11px] transition"
                        >
                          Move to Cart
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSavedForLater(saved.variantId)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Remove saved item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-white space-y-4 shadow-lg">
              {/* Coupon Form */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <Tag size={15} />
                      <span>Coupon <strong>{coupon.code}</strong> applied (-{formatCurrency(discount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-500 hover:text-rose-600 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Discount code (e.g. FIRST10)"
                      className="flex-1 h-9 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-4 h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-500 mt-1 pl-1">{couponError}</p>
                )}
              </div>

              {/* Price Table */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Taxes (18% GST)</span>
                  <span>Included in prices</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-brand-600 font-black">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleProceedCheckout}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-brand-500/25 transition"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
                >
                  View Full Cart & Saved Items
                </button>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>256-Bit SSL Encrypted & RBI Gateway Compliant</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
