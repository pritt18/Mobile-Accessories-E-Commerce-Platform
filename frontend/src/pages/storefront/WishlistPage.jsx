import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/storefront/ProductCard';

export const WishlistPage = () => {
  const { wishlist, loading } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center space-x-2">
          <Heart className="text-rose-500 fill-rose-500" size={26} />
          <span>My Saved Wishlist</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Keep track of accessories you want to buy later</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Heart size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Your wishlist is currently empty</h2>
          <p className="text-xs text-slate-500">Explore our catalog and click the heart icon on any product to save it here.</p>
          <Link to="/products" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-white text-xs font-bold inline-block shadow-xs">
            Discover Gear
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {wishlist.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.productId,
                name: item.name,
                slug: item.slug,
                price: item.price,
                mrp: item.mrp,
                primaryImage: item.image,
                inStock: item.inStock,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
