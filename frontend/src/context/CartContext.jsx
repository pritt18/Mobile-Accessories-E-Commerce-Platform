import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [count, setCount] = useState(0);
  const [cartId, setCartId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savedForLater, setSavedForLater] = useState(() => {
    try {
      const s = localStorage.getItem('mobixia_saved_for_later');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mobixia_saved_for_later', JSON.stringify(savedForLater));
    } catch (e) {
      console.error(e);
    }
  }, [savedForLater]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data?.success) {
        setItems(res.data.data.items || []);
        setSubtotal(res.data.data.subtotal || 0);
        setCount(res.data.data.count || 0);
        setCartId(res.data.data.cartId);
      }
    } catch (err) {
      console.warn('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Recalculate discount when coupon or subtotal changes
  useEffect(() => {
    if (coupon) {
      if (subtotal < coupon.minOrderValue) {
        setCoupon(null);
        setDiscount(0);
      } else if (coupon.type === 'PERCENTAGE') {
        let disc = (subtotal * coupon.value) / 100;
        setDiscount(disc);
      } else {
        setDiscount(coupon.value);
      }
    } else {
      setDiscount(0);
    }
  }, [subtotal, coupon]);

  const addToCart = async (variantId, qty = 1) => {
    try {
      const res = await api.post('/cart/add', { variantId, qty });
      if (res.data?.success) {
        setItems(res.data.data.items || []);
        setSubtotal(res.data.data.subtotal || 0);
        setCount(res.data.data.count || 0);
        setIsCartOpen(true);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateQty = async (itemId, qty) => {
    try {
      const res = await api.put(`/cart/item/${itemId}`, { qty });
      if (res.data?.success) {
        setItems(res.data.data.items || []);
        setSubtotal(res.data.data.subtotal || 0);
        setCount(res.data.data.count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/item/${itemId}`);
      if (res.data?.success) {
        setItems(res.data.data.items || []);
        setSubtotal(res.data.data.subtotal || 0);
        setCount(res.data.data.count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setItems([]);
      setSubtotal(0);
      setCount(0);
      setCoupon(null);
      setDiscount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/coupons/validate', { code, cartTotal: subtotal });
      if (res.data?.success) {
        setCoupon(res.data.data);
        setDiscount(res.data.data.discount);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid coupon' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscount(0);
  };

  const saveForLater = async (item) => {
    await removeItem(item.id);
    setSavedForLater((prev) => {
      const exists = prev.find((s) => s.variantId === item.variantId);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const moveToCartFromSaved = async (item) => {
    await addToCart(item.variantId, item.qty || 1);
    setSavedForLater((prev) => prev.filter((s) => s.variantId !== item.variantId));
  };

  const removeSavedForLater = (variantId) => {
    setSavedForLater((prev) => prev.filter((s) => s.variantId !== variantId));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        savedForLater,
        subtotal,
        count,
        cartId,
        loading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        saveForLater,
        moveToCartFromSaved,
        removeSavedForLater,
        coupon,
        discount,
        applyCoupon,
        removeCoupon,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
