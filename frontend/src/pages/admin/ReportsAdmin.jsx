import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ReportsAdmin = () => {
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [sRes, iRes] = await Promise.all([
          api.get('/admin/reports/sales'),
          api.get('/admin/reports/inventory'),
        ]);
        if (sRes.data?.success) setSalesReport(sRes.data.data);
        if (iRes.data?.success) setInventoryReport(sRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const exportCSV = (filename, rows) => {
    if (!rows || rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [keys.join(','), ...rows.map((r) => keys.map((k) => `"${r[k] || ''}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading Reports...</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Reports & Business Analytics</h1>
          <p className="text-xs text-gray-400 mt-1">Exportable sales summaries and inventory turnover velocity</p>
        </div>

        <button
          onClick={() => exportCSV('inventory_report', inventoryReport)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-bold flex items-center space-x-2"
        >
          <Download size={14} />
          <span>Export Inventory CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      {salesReport?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#11141d] border border-gray-800 space-y-1">
            <div className="text-xs text-gray-400">Paid Sales Revenue</div>
            <div className="text-2xl font-black text-white">{formatCurrency(salesReport.summary.totalRevenue)}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#11141d] border border-gray-800 space-y-1">
            <div className="text-xs text-gray-400">Total Completed Orders</div>
            <div className="text-2xl font-black text-brand-400">{salesReport.summary.totalOrders}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#11141d] border border-gray-800 space-y-1">
            <div className="text-xs text-gray-400">Average Order Value (AOV)</div>
            <div className="text-2xl font-black text-emerald-400">{formatCurrency(salesReport.summary.averageOrderValue)}</div>
          </div>
        </div>
      )}

      {/* Inventory Stock Levels Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Package size={18} className="text-brand-400" />
          <span>Inventory Stock Status & Low-Stock Alerts</span>
        </h2>

        <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Variant</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Units Available</th>
                  <th className="p-4">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {inventoryReport.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-850/50 transition">
                    <td className="p-4 font-mono text-gray-300">{item.sku}</td>
                    <td className="p-4 font-bold text-white">{item.productName}</td>
                    <td className="p-4 text-gray-400">{item.category}</td>
                    <td className="p-4 text-gray-300">{item.variantName}</td>
                    <td className="p-4 font-bold text-white">{formatCurrency(item.price)}</td>
                    <td className="p-4 font-bold text-white">{item.stock}</td>
                    <td className="p-4">
                      {item.status === 'OUT_OF_STOCK' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                          OUT OF STOCK
                        </span>
                      ) : item.status === 'LOW_STOCK' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 flex items-center space-x-1">
                          <AlertTriangle size={11} />
                          <span>LOW STOCK (&le;5)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          HEALTHY
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
