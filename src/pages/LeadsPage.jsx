import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Plus, UserCheck, Phone, Calendar, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    status: 'New',
    source: 'Direct Visit',
    followUpDate: '',
    notes: '',
  });

  const [convertData, setConvertData] = useState({
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380001',
    gstNumber: '',
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads');
      setLeads(res.leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (selectedLead) {
        await api.put(`/leads/${selectedLead._id}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      setIsModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      alert(err.message || 'Error saving lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post(`/leads/${selectedLead._id}/convert`, convertData);
      setIsConvertModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
      alert('Lead successfully converted into Client!');
    } catch (err) {
      alert(err.message || 'Error converting lead');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'New': return 'primary';
      case 'Contacted': return 'info';
      case 'Follow-up': return 'warning';
      case 'Interested': return 'purple';
      case 'Negotiation': return 'amber';
      case 'Converted': return 'success';
      case 'Lost': return 'danger';
      default: return 'default';
    }
  };

  const columns = [
    {
      header: 'Company & Contact',
      accessor: 'companyName',
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.companyName}</p>
          <p className="text-[11px] text-slate-400">Contact: {row.clientName} ({row.mobile})</p>
        </div>
      ),
    },
    {
      header: 'Lead Status',
      accessor: 'status',
      render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      header: 'Follow-up Date',
      accessor: 'followUpDate',
      render: (row) => (
        <span className="text-xs text-slate-300">
          {row.followUpDate ? new Date(row.followUpDate).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Assigned Executive',
      accessor: 'assignedExecutive',
      render: (row) => (
        <span className="text-xs text-slate-300">{row.assignedExecutive?.name || 'Unassigned'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status !== 'Converted' && (
            <button
              onClick={() => {
                setSelectedLead(row);
                setIsConvertModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/20"
            >
              Convert to Client
            </button>
          )}
          <button
            onClick={() => {
              setSelectedLead(row);
              setFormData({
                clientName: row.clientName,
                companyName: row.companyName,
                mobile: row.mobile,
                whatsapp: row.whatsapp,
                email: row.email,
                status: row.status,
                source: row.source,
                followUpDate: row.followUpDate ? row.followUpDate.split('T')[0] : '',
                notes: row.notes,
              });
              setIsModalOpen(true);
            }}
            className="text-xs font-bold text-amber-400 hover:underline"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Lead CRM Management</h1>
          <p className="text-xs text-slate-400 mt-1">Track prospective business leads, scheduled follow-ups & conversions</p>
        </div>
        <button
          onClick={() => {
            setSelectedLead(null);
            setFormData({
              clientName: '',
              companyName: '',
              mobile: '',
              whatsapp: '',
              email: '',
              status: 'New',
              source: 'Direct Visit',
              followUpDate: '',
              notes: '',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Lead
        </button>
      </div>

      <DataTable columns={columns} data={leads} searchPlaceholder="Search leads..." />

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedLead ? 'Edit Lead' : 'Add New Prospect Lead'}>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Client Contact Name *</label>
              <input
                required
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Company / Business Name *</label>
              <input
                required
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mobile *</label>
              <input
                required
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Lead Stage *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Interested">Interested</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Follow-up Reminder Date</label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Notes / Requirement Details</label>
            <textarea
              rows={3}
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
            <Button type="submit" loading={submitting}>
              Save Lead Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* Convert to Client Modal */}
      <Modal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} title={`Convert Lead "${selectedLead?.companyName}" to Client`}>
        <form onSubmit={handleConvertSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Client Address *</label>
            <textarea
              required
              rows={2}
              value={convertData.address}
              onChange={(e) => setConvertData({ ...convertData, address: e.target.value })}
              placeholder="Full shop / office address"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">City</label>
              <input
                type="text"
                value={convertData.city}
                onChange={(e) => setConvertData({ ...convertData, city: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">State</label>
              <input
                type="text"
                value={convertData.state}
                onChange={(e) => setConvertData({ ...convertData, state: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">GST Number</label>
              <input
                type="text"
                value={convertData.gstNumber}
                onChange={(e) => setConvertData({ ...convertData, gstNumber: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white uppercase"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsConvertModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <Button type="submit" variant="success" loading={submitting}>
              Convert to Active Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeadsPage;
