import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Storefront components
import { Header } from './components/storefront/Header';
import { Footer } from './components/storefront/Footer';
import { CartDrawer } from './components/storefront/CartDrawer';
import { AuthModal } from './components/common/AuthModal';

// Storefront pages
import { HomePage } from './pages/storefront/HomePage';
import { ProductListingPage } from './pages/storefront/ProductListingPage';
import { ProductDetailPage } from './pages/storefront/ProductDetailPage';
import { CartPage } from './pages/storefront/CartPage';
import { CheckoutPage } from './pages/storefront/CheckoutPage';
import { OrderConfirmationPage } from './pages/storefront/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/storefront/OrderTrackingPage';
import { MyAccountPage } from './pages/storefront/MyAccountPage';
import { WishlistPage } from './pages/storefront/WishlistPage';
import { StaticCMSPage } from './pages/storefront/StaticCMSPage';
import { ContactUsPage } from './pages/storefront/ContactUsPage';

// Admin components & pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProductsAdmin } from './pages/admin/ProductsAdmin';
import { OrdersAdmin } from './pages/admin/OrdersAdmin';
import { CustomersAdmin } from './pages/admin/CustomersAdmin';
import { MarketingAdmin } from './pages/admin/MarketingAdmin';
import { ReviewsAdmin } from './pages/admin/ReviewsAdmin';
import { CMSAdmin } from './pages/admin/CMSAdmin';
import { ReportsAdmin } from './pages/admin/ReportsAdmin';
import { SettingsAdmin } from './pages/admin/SettingsAdmin';
import { PaymentSettingsAdmin } from './pages/admin/PaymentSettingsAdmin';
import { StaffRolesAdmin } from './pages/admin/StaffRolesAdmin';
import { AuditLogsAdmin } from './pages/admin/AuditLogsAdmin';

// Customer Layout Shell
const StorefrontLayout = ({ onOpenAuth }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900">
      <Header onOpenAuthModal={onOpenAuth} />
      <main className="flex-1 bg-[#f8fafc]">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              {/* Storefront Routes */}
              <Route path="/" element={<StorefrontLayout onOpenAuth={() => setIsAuthOpen(true)} />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductListingPage />} />
                <Route path="product/:slug" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-confirmation/:orderNo" element={<OrderConfirmationPage />} />
                <Route path="track/:idOrNumber" element={<OrderTrackingPage />} />
                <Route path="account" element={<MyAccountPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="page/:slug" element={<StaticCMSPage />} />
                <Route path="contact" element={<ContactUsPage />} />
                <Route path="*" element={<HomePage />} />
              </Route>

              {/* Admin Back Office Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="orders" element={<OrdersAdmin />} />
                <Route path="customers" element={<CustomersAdmin />} />
                <Route path="marketing" element={<MarketingAdmin />} />
                <Route path="reviews" element={<ReviewsAdmin />} />
                <Route path="cms" element={<CMSAdmin />} />
                <Route path="reports" element={<ReportsAdmin />} />
                <Route path="settings" element={<SettingsAdmin />} />
                <Route path="payment" element={<PaymentSettingsAdmin />} />
                <Route path="staff" element={<StaffRolesAdmin />} />
                <Route path="audit" element={<AuditLogsAdmin />} />
              </Route>
            </Routes>

            {/* Global Auth Modal */}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
