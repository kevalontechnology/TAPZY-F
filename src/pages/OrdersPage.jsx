import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Plus, ShoppingCart, CheckCircle, FileText, QrCode } from 'lucide-react';
import api from '../services/api';
import { useSelector } from 'react-redux';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user } = useSelector((state) => state.auth);

  // Form State
  const [clientId, setClientId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0 },
  ]);

  const [statusUpdate, setStatusUpdate] = useState({
    status: 'Approved',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordRes, cliRes, prodRes] = await Promise.all([
        api.get('/orders'),
        api.get('/clients'),
        api.get('/products'),
      ]);
      setOrders(ordRes.orders || []);
      setClients(cliRes.clients || []);
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

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, prodId) => {
    const prod = products.find((p) => p._id === prodId);
    const updated = [...orderItems];
    updated[index].productId = prodId;
    updated[index].unitPrice = prod ? prod.sellingPrice : 0;
    setOrderItems(updated);
  };

  const handleQtyChange = (index, qty) => {
    const updated = [...orderItems];
    updated[index].quantity = Number(qty);
    setOrderItems(updated);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      if (!clientId) return alert('Select client');
      if (orderItems.some((i) => !i.productId)) return alert('Select products');

      await api.post('/orders', {
        clientId,
        items: orderItems,
        discount: Number(discount),
        notes,
      });

      setIsModalOpen(false);
      fetchData();
      alert('Order created successfully!');
    } catch (err) {
      alert(err.message || 'Failed to create order');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, statusUpdate);
      setIsStatusModalOpen(false);
      fetchData();
      alert(`Order status updated to ${statusUpdate.status}`);
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending Approval': return 'warning';
      case 'Approved': return 'primary';
      case 'Stock Deducted': return 'purple';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  };

  const columns = [
    {
      header: 'Order # & Date',
      accessor: 'orderNumber',
      render: (row) => (
        <div>
          <p className="font-mono font-bold text-white text-xs">{row.orderNumber}</p>
          <p className="text-[10px] text-slate-400">{new Date(row.createdAt).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      header: 'Client Company',
      accessor: 'client',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-200 text-xs">{row.client?.companyName || 'N/A'}</p>
          <p className="text-[10px] text-slate-400">Owner: {row.client?.ownerName}</p>
        </div>
      ),
    },
    {
      header: 'Order Items',
      accessor: 'items',
      render: (row) => (
        <div className="text-xs text-slate-300">
          {row.items?.map((i, idx) => (
            <p key={idx} className="truncate max-w-xs">
              {i.quantity}x {i.productName}
            </p>
          ))}
        </div>
      ),
    },
    {
      header: 'Grand Total',
      accessor: 'grandTotal',
      render: (row) => (
        <div>
          <p className="font-bold text-emerald-400 text-xs">₹{row.grandTotal?.toFixed(2)}</p>
          <Badge size="sm" variant={row.paymentStatus === 'Paid' ? 'success' : 'amber'}>
            Payment: {row.paymentStatus}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Order Flow Status',
      accessor: 'status',
      render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          {['super_admin', 'admin'].includes(user?.role) && (
            <button
              onClick={() => {
                setSelectedOrder(row);
                setStatusUpdate({ status: row.status });
                setIsStatusModalOpen(true);
              }}
              className="text-xs font-bold text-indigo-400 hover:underline"
            >
              Update Status
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Orders & NFC Delivery</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-step order pipeline: Lead → Client → Order → Approval → Stock Deduction → Invoice → Delivery</p>
        </div>
        <button
          onClick={() => {
            setClientId('');
            setDiscount(0);
            setNotes('');
            setOrderItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create New Order
        </button>
      </div>

      <DataTable columns={columns} data={orders} searchPlaceholder="Search order number..." />

      {/* Create Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Tapzy Order">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Select Client *</label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              <option value="">-- Choose Client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName} ({c.ownerName})
                </option>
              ))}
            </select>
          </div>

          {/* Order Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase">Order Items & Products *</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] font-bold text-indigo-400 hover:underline"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    required
                    value={item.productId}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (₹{p.sellingPrice})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQtyChange(idx, e.target.value)}
                    placeholder="Qty"
                    className="w-20 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
                  />

                  <input
                    type="number"
                    value={item.unitPrice}
                    readOnly
                    placeholder="Price"
                    className="w-24 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-400"
                  />

                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Discount Amount (₹)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Order Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              Submit Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title={`Update Order Flow: ${selectedOrder?.orderNumber}`}>
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Order Pipeline Stage *</label>
            <select
              value={statusUpdate.status}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-bold"
            >
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved (Auto Deducts Stock & Generates GST Invoice)</option>
              <option value="Printing">Printing & Packaging</option>
              <option value="NFC Configuration">NFC Chip Configuration & URL Encoding</option>
              <option value="Delivery">Out for Delivery</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
            >
              Update Stage
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
