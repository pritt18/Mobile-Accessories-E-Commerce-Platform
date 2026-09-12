import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data?.success) {
        setWishlist(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      return { requireLogin: true };
    }
    try {
      const res = await api.post('/wishlist/toggle', { productId });
      if (res.data?.success) {
        await fetchWishlist();
        return { success: true, inWishlist: res.data.data.inWishlist };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update wishlist' };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        toggleWishlist,
        isInWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
