import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Star,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  UserCheck,
  History,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin, isAdmin, isStaff } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect non-staff
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-[#06080e] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0c1220] border border-cyan-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <Shield size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">Access Restricted</h2>
          <p className="text-xs text-gray-400">
            You must be logged in as an Administrator or Staff Member to access the Mobixia back office.
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-xs font-bold"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products & Catalog', path: '/admin/products', icon: Package },
    { label: 'Orders & Dispatch', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Marketing & Promos', path: '/admin/marketing', icon: Tag, show: isAdmin },
    { label: 'Review Moderation', path: '/admin/reviews', icon: Star, show: isAdmin },
    { label: 'CMS & Enquiries', path: '/admin/cms', icon: FileText, show: isAdmin },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings, show: isSuperAdmin },
    { label: 'Payment Gateway', path: '/admin/payment', icon: CreditCard, show: isSuperAdmin, badge: 'Secrets' },
    { label: 'Staff & RBAC Matrix', path: '/admin/staff', icon: UserCheck, show: isSuperAdmin },
    { label: 'Audit Trail Logs', path: '/admin/audit', icon: History, show: isAdmin },
  ];

  return (
    <div className="min-h-screen bg-[#06080e] text-gray-100 flex">
      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#080c16] border-r border-cyan-500/20 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo with Back Office label */}
          <div className="h-20 p-4 border-b border-gray-800/80 flex items-center justify-between">
            <Logo to="/admin" showSubtitle={false} />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav list */}
          <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-3 mb-2">
              Back Office Operations
            </div>
            {navItems.map((item) => {
              if (item.show === false) return null;
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0057e0] to-[#00c6ff] text-white shadow-neon-blue'
                      : 'text-gray-400 hover:text-white hover:bg-gray-850/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-gray-800 bg-[#060911]">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#00c6ff]"
            />
            <div className="flex-1 min-w-0 text-xs">
              <div className="font-bold text-white truncate">{user?.name}</div>
              <span className="inline-block text-[9px] uppercase font-bold text-[#00c6ff]">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Link
              to="/"
              className="flex-1 py-1.5 px-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 border border-gray-700/60"
              title="Return to Customer Storefront"
            >
              <span>Storefront</span>
              <ExternalLink size={12} />
            </Link>
            <button
              onClick={logout}
              className="py-1.5 px-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-[11px] font-bold rounded-lg flex items-center justify-center border border-rose-500/20"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Back Office View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-[#080c16]/80 backdrop-blur-md border-b border-cyan-500/20 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu size={22} />
            </button>
            <span className="text-xs font-bold text-gray-400">
              Role Access: <strong className="text-[#00c6ff]">{user?.role}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-[#00c6ff] hover:underline font-semibold"
            >
              <span>Open Customer Storefront</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        {/* Content View Outlet */}
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
