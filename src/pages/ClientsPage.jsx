import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Plus, Building2, ExternalLink, Phone, Mail, MapPin, QrCode } from 'lucide-react';
import api from '../services/api';
import { useSelector } from 'react-redux';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    gstNumber: '',
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380001',
    nfcProfileUrl: '',
    googleReviewUrl: '',
    notes: '',
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients');
      setClients(res.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await api.put(`/clients/${selectedClient._id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setIsModalOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (err) {
      alert(err.message || 'Error saving client');
    }
  };

  const openCreateModal = () => {
    setSelectedClient(null);
    setFormData({
      companyName: '',
      ownerName: '',
      mobile: '',
      whatsapp: '',
      email: '',
      gstNumber: '',
      address: '',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      nfcProfileUrl: '',
      googleReviewUrl: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      companyName: client.companyName || '',
      ownerName: client.ownerName || '',
      mobile: client.mobile || '',
      whatsapp: client.whatsapp || '',
      email: client.email || '',
      gstNumber: client.gstNumber || '',
      address: client.address || '',
      city: client.city || 'Ahmedabad',
      state: client.state || 'Gujarat',
      pincode: client.pincode || '380001',
      nfcProfileUrl: client.nfcProfileUrl || '',
      googleReviewUrl: client.googleReviewUrl || '',
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Company & Owner',
      accessor: 'companyName',
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.companyName}</p>
          <p className="text-[11px] text-slate-400">Owner: {row.ownerName}</p>
          {row.nfcProfileUrl && (
            <a
              href={row.nfcProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:underline mt-0.5"
            >
              <QrCode className="h-3 w-3" /> NFC Profile Link <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: 'mobile',
      render: (row) => (
        <div className="text-xs">
          <p className="text-slate-200">{row.mobile}</p>
          <p className="text-[11px] text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Location & GST',
      accessor: 'city',
      render: (row) => (
        <div className="text-xs">
          <p className="text-slate-300">{row.city}, {row.state}</p>
          <p className="text-[10px] text-slate-400">GST: {row.gstNumber || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Executive',
      accessor: 'assignedExecutive',
      render: (row) => (
        <span className="text-xs font-medium text-slate-300">
          {row.assignedExecutive?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedClient(row);
              setIsViewModalOpen(true);
            }}
            className="text-xs font-bold text-indigo-400 hover:underline"
          >
            View
          </button>
          <button
            onClick={() => openEditModal(row)}
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Client Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage onboarded client profiles & NFC business card configurations</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" /> Onboard Client
        </button>
      </div>

      <DataTable columns={columns} data={clients} searchPlaceholder="Search clients..." />

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedClient ? 'Edit Client Profile' : 'Onboard New Client'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Company Name *</label>
              <input
                required
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Owner Name *</label>
              <input
                required
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">GST Number</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Address *</label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tapzy NFC Profile URL</label>
              <input
                type="url"
                value={formData.nfcProfileUrl}
                onChange={(e) => setFormData({ ...formData, nfcProfileUrl: e.target.value })}
                placeholder="https://tapzy.in/p/client-name"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Google Review Link</label>
              <input
                type="url"
                value={formData.googleReviewUrl}
                onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                placeholder="https://g.page/r/..."
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
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
            >
              Save Client Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
