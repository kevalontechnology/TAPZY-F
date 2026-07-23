import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';

import Button from '../components/Button';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'executive',
    address: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
      alert('User record saved!');
    } catch (err) {
      alert(err.message || 'Error saving user');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Full Name & Email',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.name}</p>
          <p className="text-[10px] text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phone',
      render: (row) => <span className="text-xs text-slate-300">{row.phone}</span>,
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      render: (row) => <Badge variant={row.role === 'super_admin' ? 'purple' : row.role === 'admin' ? 'info' : 'success'}>{row.role}</Badge>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'danger'}>{row.status}</Badge>,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedUser(row);
            setFormData({
              name: row.name,
              email: row.email,
              password: '',
              phone: row.phone,
              role: row.role,
              address: row.address || '',
            });
            setIsModalOpen(true);
          }}
          className="text-xs font-bold text-amber-400 hover:underline"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System User Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">Super Admin control panel for managing Admins & Sales Executives</p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setFormData({ name: '', email: '', password: '', phone: '', role: 'executive', address: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create User Account
        </button>
      </div>

      <DataTable columns={columns} data={users} searchPlaceholder="Search users..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedUser ? 'Edit User Account' : 'Create New User Account'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email *</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Phone Number *</label>
              <input
                required
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">System Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-bold"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="executive">Sales Executive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password {selectedUser && '(Leave blank to keep current)'}</label>
              <input
                type="password"
                required={!selectedUser}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <Button type="submit" loading={submitting}>
              Save User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
