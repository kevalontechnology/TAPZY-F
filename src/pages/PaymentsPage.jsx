import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { CreditCard, Plus, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api';
import { useSelector } from 'react-redux';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    method: 'UPI',
    transactionId: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, ordRes] = await Promise.all([api.get('/payments'), api.get('/orders')]);
      setPayments(payRes.payments || []);
      setOrders(ordRes.orders || []);
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
      await api.post('/payments', formData);
      setIsModalOpen(false);
      fetchData();
      alert('Payment collection recorded successfully!');
    } catch (err) {
      alert(err.message || 'Error recording payment');
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/payments/${id}/verify`, { status });
      fetchData();
      alert(`Payment status set to ${status}`);
    } catch (err) {
      alert(err.message || 'Verification failed');
    }
  };

  const columns = [
    {
      header: 'Order Number',
      accessor: 'order',
      render: (row) => <span className="font-mono font-bold text-white text-xs">{row.order?.orderNumber}</span>,
    },
    {
      header: 'Client Company',
      accessor: 'client',
      render: (row) => <span className="font-bold text-slate-200 text-xs">{row.client?.companyName}</span>,
    },
    {
      header: 'Amount Collected',
      accessor: 'amount',
      render: (row) => <span className="font-bold text-emerald-400 text-xs">₹{row.amount?.toFixed(2)}</span>,
    },
    {
      header: 'Payment Mode',
      accessor: 'method',
      render: (row) => <Badge variant="purple">{row.method}</Badge>,
    },
    {
      header: 'Transaction Ref',
      accessor: 'transactionId',
      render: (row) => <span className="font-mono text-xs text-slate-300">{row.transactionId || 'N/A'}</span>,
    },
    {
      header: 'Verification Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Verified' ? 'success' : row.status === 'Rejected' ? 'danger' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div>
          {row.status === 'Pending' && ['super_admin', 'admin'].includes(user?.role) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVerify(row._id, 'Verified')}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                Verify
              </button>
              <button
                onClick={() => handleVerify(row._id, 'Rejected')}
                className="text-xs font-bold text-rose-400 hover:underline"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Payment Collections</h1>
          <p className="text-xs text-slate-400 mt-1">Record & verify client payments via Cash, UPI, Bank Transfer & Cheque</p>
        </div>
        <button
          onClick={() => {
            setFormData({ orderId: '', amount: '', method: 'UPI', transactionId: '', notes: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" /> Collect Payment
        </button>
      </div>

      <DataTable columns={columns} data={payments} searchPlaceholder="Search payment transactions..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment Collection">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Select Order *</label>
            <select
              required
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              <option value="">-- Choose Order --</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.orderNumber} - {o.client?.companyName} (Grand Total: ₹{o.grandTotal})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Amount Collected (₹) *</label>
              <input
                required
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Payment Method *</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Transaction Ref / Cheque No</label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
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
              Save Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
