import React, { useState, useEffect } from 'react';
import { History, Search, Shield } from 'lucide-react';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

export const AuditLogsAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        if (res.data?.success) setLogs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">System Audit Trail</h1>
        <p className="text-xs text-gray-400 mt-1">Immutable log of staff mutations, status updates, and security credentials access</p>
      </div>

      <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Module</th>
                <th className="p-4">Action</th>
                <th className="p-4">Description</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading audit trail...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No audit events recorded yet.</td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-850/50 transition">
                    <td className="p-4 text-gray-400 whitespace-nowrap font-mono text-[11px]">{formatDateTime(l.created_at)}</td>
                    <td className="p-4 font-bold text-white">{l.user?.name || 'System Admin'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-brand-300 font-mono text-[10px] uppercase">
                        {l.module}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-200 uppercase text-[11px]">{l.action}</td>
                    <td className="p-4 text-gray-300 max-w-md">{l.description}</td>
                    <td className="p-4 text-gray-500 font-mono text-[11px]">{l.ip_address || '127.0.0.1'}</td>
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
