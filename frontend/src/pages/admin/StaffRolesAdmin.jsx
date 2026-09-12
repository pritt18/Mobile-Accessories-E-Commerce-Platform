import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, Check, Lock } from 'lucide-react';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';

export const StaffRolesAdmin = () => {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected role for permissions matrix
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermIds, setRolePermIds] = useState(new Set());
  const [savingMatrix, setSavingMatrix] = useState(false);

  // Create staff modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffMobile, setStaffMobile] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRoleId, setStaffRoleId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/staff');
      if (res.data?.success) {
        setStaff(res.data.data.staff);
        setRoles(res.data.data.roles);
        setAllPermissions(res.data.data.allPermissions);

        // Pick MANAGER or ADMIN by default
        const defaultRole = res.data.data.roles.find((r) => r.name === 'MANAGER') || res.data.data.roles[0];
        if (defaultRole) {
          setSelectedRole(defaultRole);
          setRolePermIds(new Set(defaultRole.permissions.map((rp) => rp.permission_id)));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRole = (r) => {
    setSelectedRole(r);
    setRolePermIds(new Set(r.permissions.map((rp) => rp.permission_id)));
  };

  const handleTogglePermission = (pId) => {
    const updated = new Set(rolePermIds);
    if (updated.has(pId)) {
      updated.delete(pId);
    } else {
      updated.add(pId);
    }
    setRolePermIds(updated);
  };

  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    setSavingMatrix(true);
    try {
      await api.put('/admin/roles/permissions', {
        roleId: selectedRole.id,
        permissionIds: Array.from(rolePermIds),
      });
      alert(`Permissions matrix updated for ${selectedRole.name}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingMatrix(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/staff', {
        name: staffName,
        email: staffEmail,
        mobile: staffMobile,
        password: staffPassword,
        roleId: staffRoleId,
      });
      setIsStaffModalOpen(false);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Creation failed');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading RBAC permissions matrix...</div>;

  const modulesList = [
    'products',
    'orders',
    'inventory',
    'customers',
    'marketing',
    'reviews',
    'cms',
    'reports',
    'settings',
    'staff',
    'audit',
  ];
  const actionsList = ['view', 'create', 'edit', 'delete'];

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
          <Shield size={14} />
          <span>Super Admin Access Control</span>
        </div>
        <h1 className="text-2xl font-black text-white">Staff Accounts & RBAC Permissions Matrix</h1>
        <p className="text-xs text-gray-400 mt-1">
          Create operational staff logins and configure granular View/Create/Edit/Delete permissions per module
        </p>
      </div>

      {/* Staff Accounts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <UserCheck size={18} className="text-brand-400" />
            <span>Staff Members ({staff.length})</span>
          </h2>
          <button
            onClick={() => {
              setStaffRoleId(roles[0]?.id || '');
              setIsStaffModalOpen(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
          >
            <Plus size={14} />
            <span>New Staff Member</span>
          </button>
        </div>

        <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-850/50 transition">
                  <td className="p-4 font-bold text-white">{s.name}</td>
                  <td className="p-4 text-gray-300">{s.email}</td>
                  <td className="p-4 text-gray-400">{s.mobile || 'N/A'}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {s.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{formatDateTime(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Granular RBAC Permissions Matrix */}
      <div className="space-y-4 pt-6 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Lock size={18} className="text-amber-400" />
              <span>Granular Permissions Matrix</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Select a role to inspect and configure access rights</p>
          </div>

          <button
            onClick={handleSaveMatrix}
            disabled={savingMatrix || selectedRole?.name === 'SUPER_ADMIN'}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg transition"
          >
            <Check size={14} />
            <span>{savingMatrix ? 'Saving...' : `Save Matrix for ${selectedRole?.name || ''}`}</span>
          </button>
        </div>

        {/* Role Switcher tabs */}
        <div className="flex space-x-2">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectRole(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedRole?.id === r.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {selectedRole?.name === 'SUPER_ADMIN' && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400">
            Super Administrator role inherently has full master access across all modules and actions.
          </div>
        )}

        {/* Matrix Table */}
        <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                <th className="p-4">System Module</th>
                {actionsList.map((a) => (
                  <th key={a} className="p-4 text-center">{a.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {modulesList.map((mod) => (
                <tr key={mod} className="hover:bg-gray-850/50 transition">
                  <td className="p-4 font-bold text-white capitalize">{mod}</td>
                  {actionsList.map((act) => {
                    const perm = allPermissions.find((p) => p.module === mod && p.action === act);
                    if (!perm) return <td key={act} className="p-4 text-center text-gray-700">-</td>;
                    const isChecked = selectedRole?.name === 'SUPER_ADMIN' || rolePermIds.has(perm.id);

                    return (
                      <td key={act} className="p-4 text-center">
                        <input
                          type="checkbox"
                          disabled={selectedRole?.name === 'SUPER_ADMIN'}
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-brand-600 focus:ring-0 cursor-pointer disabled:opacity-50"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title="Create Staff Account">
        <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-300 mb-1">Mobile</label>
            <input
              type="tel"
              value={staffMobile}
              onChange={(e) => setStaffMobile(e.target.value)}
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-300 mb-1">Initial Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-300 mb-1">Assign Role</label>
            <select
              value={staffRoleId}
              onChange={(e) => setStaffRoleId(e.target.value)}
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ? {r.description}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition mt-2"
          >
            Create Staff Account
          </button>
        </form>
      </Modal>
    </div>
  );
};
