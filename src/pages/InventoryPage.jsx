import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Boxes, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api';

const InventoryPage = () => {
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    type: 'Stock In',
    quantity: '',
    referenceId: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stkRes, txnRes, prodRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/transactions'),
        api.get('/products'),
      ]);
      setStocks(stkRes.stocks || []);
      setTransactions(txnRes.transactions || []);
      setProducts(prodRes.products || []);
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
      await api.post('/inventory/adjust', formData);
      setIsModalOpen(false);
      fetchData();
      alert('Stock transaction recorded!');
    } catch (err) {
      alert(err.message || 'Stock adjustment failed');
    }
  };

  const stockColumns = [
    {
      header: 'Product Name',
      accessor: 'product',
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.product?.name}</p>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
            {row.product?.sku}
          </span>
        </div>
      ),
    },
    {
      header: 'Current Stock Quantity',
      accessor: 'quantity',
      render: (row) => (
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            row.quantity <= row.lowStockThreshold
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {row.quantity} units {row.quantity <= row.lowStockThreshold && '(LOW STOCK)'}
        </span>
      ),
    },
    {
      header: 'Low Stock Threshold',
      accessor: 'lowStockThreshold',
      render: (row) => <span className="text-xs text-slate-300">{row.lowStockThreshold} units</span>,
    },
    {
      header: 'Warehouse Location',
      accessor: 'location',
      render: (row) => <span className="text-xs text-slate-400">{row.location}</span>,
    },
  ];

  const txnColumns = [
    {
      header: 'Date & Time',
      accessor: 'createdAt',
      render: (row) => <span className="text-xs text-slate-300">{new Date(row.createdAt).toLocaleString()}</span>,
    },
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => <span className="text-xs font-bold text-white">{row.product?.name}</span>,
    },
    {
      header: 'Transaction Type',
      accessor: 'type',
      render: (row) => (
        <Badge variant={['Stock In', 'Opening Stock', 'Purchase Entry'].includes(row.type) ? 'success' : 'danger'}>
          {row.type}
        </Badge>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (row) => <span className="text-xs font-bold text-white">{row.quantity} units</span>,
    },
    {
      header: 'Reference & Notes',
      accessor: 'notes',
      render: (row) => <span className="text-xs text-slate-400">{row.notes || row.referenceId || 'N/A'}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Inventory & Stock Management</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time stock tracking, purchase entries, adjustments & low stock alerts</p>
        </div>
        <button
          onClick={() => {
            setFormData({ productId: '', type: 'Stock In', quantity: '', referenceId: '', notes: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Stock Entry / Purchase
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Current Stock Levels</h3>
        <DataTable columns={stockColumns} data={stocks} searchPlaceholder="Search inventory..." />
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-base font-bold text-white">Stock Audit Transaction History</h3>
        <DataTable columns={txnColumns} data={transactions} searchPlaceholder="Search history..." />
      </div>

      {/* Adjust Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Stock Transaction Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Product *</label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Transaction Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              >
                <option value="Purchase Entry">Purchase Entry</option>
                <option value="Stock In">Stock In</option>
                <option value="Stock Out">Stock Out</option>
                <option value="Stock Adjustment">Stock Adjustment</option>
                <option value="Damaged Stock">Damaged Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Quantity *</label>
              <input
                required
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Notes / Invoice Ref</label>
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
              Save Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
