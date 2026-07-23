import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Target, Plus } from 'lucide-react';
import api from '../services/api';
import { useSelector } from 'react-redux';

const TargetsPage = () => {
  const [targets, setTargets] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    executiveId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    targetCards: 100,
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tarRes, userRes] = await Promise.all([
        api.get('/targets'),
        api.get('/users?role=executive'),
      ]);
      setTargets(tarRes.targets || []);
      setExecutives(userRes.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/targets', formData);
      setIsModalOpen(false);
      fetchData();
      alert('Monthly target assigned successfully!');
    } catch (err) {
      alert(err.message || 'Target assignment failed');
    }
  };

  const columns = [
    {
      header: 'Executive Name',
      accessor: 'executive',
      render: (row) => <span className="font-bold text-white text-xs">{row.executive?.name}</span>,
    },
    {
      header: 'Month & Year',
      accessor: 'month',
      render: (row) => (
        <span className="text-xs font-semibold text-indigo-300">
          {new Date(row.year, row.month - 1).toLocaleString('default', { month: 'long' })} {row.year}
        </span>
      ),
    },
    {
      header: 'Assigned Goal Cards',
      accessor: 'targetCards',
      render: (row) => <span className="font-bold text-emerald-400 text-xs">{row.targetCards} Cards</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status === 'Achieved' ? 'success' : 'primary'}>{row.status}</Badge>,
    },
    {
      header: 'Assigned By',
      accessor: 'assignedBy',
      render: (row) => <span className="text-xs text-slate-400">{row.assignedBy?.name || 'Admin'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Monthly Target Allocation</h1>
          <p className="text-xs text-slate-400 mt-1">Assign monthly card sales quotas for sales executives</p>
        </div>
        {['super_admin', 'admin'].includes(user?.role) && (
          <button
            onClick={() => {
              setFormData({
                executiveId: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                targetCards: 100,
                notes: '',
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Assign Monthly Target
          </button>
        )}
      </div>

      <DataTable columns={columns} data={targets} searchPlaceholder="Search targets..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Monthly Target to Executive">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Select Executive *</label>
            <select
              required
              value={formData.executiveId}
              onChange={(e) => setFormData({ ...formData, executiveId: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              <option value="">-- Choose Executive --</option>
              {executives.map((exec) => (
                <option key={exec._id} value={exec._id}>
                  {exec.name} ({exec.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Month *</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Year *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Target Cards *</label>
              <input
                required
                type="number"
                value={formData.targetCards}
                onChange={(e) => setFormData({ ...formData, targetCards: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-bold text-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
            >
              Assign Target
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TargetsPage;
