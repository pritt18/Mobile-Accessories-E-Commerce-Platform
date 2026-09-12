import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle, ShoppingCart } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const CustomersAdmin = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/customers?search=${encodeURIComponent(search)}`);
      if (res.data?.success) setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/admin/customers/${id}/status`);
      if (res.data?.success) loadCustomers();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Customer Account Management</h1>
        <p className="text-xs text-gray-400 mt-1">Manage buyer profiles, spending history, and block/unblock accounts</p>
      </div>

      <div className="p-4 bg-[#11141d] rounded-2xl border border-gray-800">
        <div className="relative max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or mobile..."
            className="w-full h-9 pl-9 pr-3 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-850/50 transition">
                    <td className="p-4 font-bold text-white">{c.name}</td>
                    <td className="p-4 text-gray-300">{c.email}</td>
                    <td className="p-4 text-gray-400">{c.mobile || 'N/A'}</td>
                    <td className="p-4 font-bold text-white">{c.ordersCount}</td>
                    <td className="p-4 font-bold text-brand-400">{formatCurrency(c.totalSpent)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          c.status === 'ACTIVE'
                            ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white'
                            : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white'
                        }`}
                      >
                        {c.status === 'ACTIVE' ? 'Block Account' : 'Unblock Account'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
