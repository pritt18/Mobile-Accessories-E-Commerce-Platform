import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  Package,
  DollarSign,
  Star,
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';
import { RatingStars } from '../../components/common/RatingStars';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading || !data) {
    return <div className="text-center py-20 text-gray-400">Loading Dashboard Metrics...</div>;
  }

  const { kpi, chartData, statusBreakdown, recentOrders, recentReviews } = data;
  const maxRevenue = Math.max(...chartData.map((c) => c.revenue), 1000);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Operations Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">Live metrics, daily sales velocity, and fulfillment queue</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#11141d] border border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Revenue</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white">
            {formatCurrency(kpi.totalRevenue)}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
            <TrendingUp size={12} />
            <span>Active Volume</span>
          </div>
        </div>

        {/* Today Orders */}
        <div className="p-5 rounded-2xl bg-[#11141d] border border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Today's Orders</span>
            <ShoppingCart size={16} className="text-brand-400" />
          </div>
          <div className="text-xl font-black text-white">{kpi.todayOrders}</div>
          <div className="text-[10px] text-gray-500">Live order queue</div>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-[#11141d] border border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Pending Dispatch</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">{kpi.pendingOrders}</div>
          <div className="text-[10px] text-amber-400/80">Requires Packing</div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-[#11141d] border border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Low-Stock Alerts</span>
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400">{kpi.lowStockAlerts}</div>
          <div className="text-[10px] text-rose-400/80">&le; 5 units remaining</div>
        </div>

        {/* Customers */}
        <div className="p-5 rounded-2xl bg-[#11141d] border border-gray-800 space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Customers</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white">{kpi.totalCustomers}</div>
          <div className="text-[10px] text-gray-400">+{kpi.newCustomersToday} today</div>
        </div>
      </div>

      {/* Analytics Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#11141d] border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Revenue Trend (Last 7 Days)</h3>
              <p className="text-[11px] text-gray-400">Revenue generated from completed checkouts</p>
            </div>
            <span className="text-xs font-bold text-brand-400">INR (?)</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6">
            {chartData.map((bar, idx) => {
              const heightPercent = Math.max(12, Math.round((bar.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition">
                    ?{bar.revenue}
                  </div>
                  <div className="w-full bg-gray-800/80 rounded-xl overflow-hidden flex items-end h-32">
                    <div
                      className="w-full bg-gradient-to-t from-brand-600 to-cyan-400 rounded-xl transition-all duration-500 group-hover:brightness-125"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold">{bar.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="p-6 rounded-3xl bg-[#11141d] border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Order Pipeline Status</h3>
          <p className="text-[11px] text-gray-400">Current status distribution across system</p>

          <div className="space-y-3 pt-2">
            {statusBreakdown.map((st) => (
              <div key={st.status} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-gray-900 border border-gray-800">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${getStatusBadgeClass(st.status)}`}>
                  {st.status.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-black text-white font-mono">{st.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table & Reviews Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#11141d] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-brand-400 hover:underline flex items-center space-x-1">
              <span>View All Orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-850/50 transition">
                    <td className="py-3 font-mono font-bold text-white">#{o.orderNo}</td>
                    <td className="py-3 text-gray-300">{o.customerName}</td>
                    <td className="py-3 font-bold text-white">{formatCurrency(o.total)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadgeClass(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/admin/orders"
                        className="text-xs text-brand-400 hover:underline font-bold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Customer Reviews Widget */}
        <div className="p-6 rounded-3xl bg-[#11141d] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Reviews</h3>
            <Link to="/admin/reviews" className="text-xs font-bold text-brand-400 hover:underline">
              Moderate
            </Link>
          </div>

          <div className="space-y-3">
            {recentReviews.map((r) => (
              <div key={r.id} className="p-3 bg-gray-900/70 border border-gray-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{r.user?.name || 'Customer'}</span>
                  <RatingStars rating={r.rating} showValue={false} size={12} />
                </div>
                <div className="text-[11px] text-brand-400 font-semibold truncate">{r.product?.name}</div>
                <p className="text-[11px] text-gray-400 line-clamp-2">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
