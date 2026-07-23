import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Plus, ShoppingCart, CheckCircle, FileText, QrCode, Eye, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useSelector } from 'react-redux';
import Button from '../components/Button';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailData, setOrderDetailData] = useState(null);

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

  const [refundForm, setRefundForm] = useState({
    amount: '',
    method: 'Bank Transfer',
    transactionId: '',
    notes: 'Order cancelled by user',
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

      setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetailModal = async (order) => {
    try {
      setSelectedOrder(order);
      const res = await api.get(`/orders/${order._id}`);
      setOrderDetailData(res);
      setIsDetailModalOpen(true);
    } catch (err) {
      alert(err.message || 'Error fetching order details');
    }
  };

  const handleSelectStatusChange = (newStatus) => {
    setStatusUpdate({ status: newStatus });
    if (newStatus === 'Cancelled') {
      setRefundForm({
        amount: selectedOrder?.grandTotal || 0,
        method: 'Bank Transfer',
        transactionId: `REF-${Date.now().toString().slice(-6)}`,
        notes: 'Order cancellation & payment refund',
      });
      setIsStatusModalOpen(false);
      setIsRefundModalOpen(true);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (statusUpdate.status === 'Cancelled') {
      setRefundForm({
        amount: selectedOrder?.grandTotal || 0,
        method: 'Bank Transfer',
        transactionId: `REF-${Date.now().toString().slice(-6)}`,
        notes: 'Order cancellation & payment refund',
      });
      setIsStatusModalOpen(false);
      setIsRefundModalOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/orders/${selectedOrder._id}/status`, statusUpdate);
      setIsStatusModalOpen(false);
      fetchData();
      alert(`Order status updated to ${statusUpdate.status}`);
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCancelWithRefund = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/orders/${selectedOrder._id}/status`, {
        status: 'Cancelled',
        refundDetails: refundForm,
      });
      setIsRefundModalOpen(false);
      fetchData();
      alert(`Order ${selectedOrder.orderNumber} cancelled. Stock restored (+) and target deducted (-)!`);
    } catch (err) {
      alert(err.message || 'Order cancellation failed');
    } finally {
      setSubmitting(false);
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
          <Badge size="sm" variant={row.paymentStatus === 'Paid' ? 'success' : row.paymentStatus === 'Refunded' ? 'danger' : 'amber'}>
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
          <button
            onClick={() => handleOpenDetailModal(row)}
            className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:underline"
          >
            <Eye className="h-3.5 w-3.5" /> Details
          </button>
          {['super_admin', 'admin'].includes(user?.role) && row.status !== 'Cancelled' && (
            <button
              onClick={() => {
                setSelectedOrder(row);
                setStatusUpdate({ status: row.status });
                setIsStatusModalOpen(true);
              }}
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              Update Status
            </button>
          )}
          {row.status !== 'Cancelled' && (
            <button
              onClick={() => {
                setSelectedOrder(row);
                setRefundForm({
                  amount: row.grandTotal || 0,
                  method: 'Bank Transfer',
                  transactionId: `REF-${Date.now().toString().slice(-6)}`,
                  notes: 'Order cancellation & payment refund',
                });
                setIsRefundModalOpen(true);
              }}
              className="text-xs font-bold text-rose-400 hover:underline"
            >
              Cancel Order
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
            <Button type="submit" loading={submitting}>
              Submit Order
            </Button>
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
              onChange={(e) => handleSelectStatusChange(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-bold"
            >
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved (Auto Deducts Stock & Generates GST Invoice)</option>
              <option value="Printing">Printing & Packaging</option>
              <option value="NFC Configuration">NFC Chip Configuration & URL Encoding</option>
              <option value="Delivery">Out for Delivery</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled (Auto Restores Stock [+] & Adjusts Target [-])</option>
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
            <Button type="submit" loading={submitting}>
              Update Stage
            </Button>
          </div>
        </form>
      </Modal>

      {/* Order Details View Modal (Available for Admin, Executive, Super Admin) */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Order Summary: ${selectedOrder?.orderNumber}`}>
        {orderDetailData?.order && (
          <div className="space-y-6 text-xs text-slate-200">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl bg-slate-800/40 p-4 border border-slate-700/50">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Client / Business</p>
                <p className="font-bold text-white text-sm mt-0.5">{orderDetailData.order.client?.companyName}</p>
                <p className="text-[11px] text-slate-400">Owner: {orderDetailData.order.client?.ownerName} ({orderDetailData.order.client?.mobile})</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Sales Executive</p>
                <p className="font-bold text-indigo-400 text-sm mt-0.5">{orderDetailData.order.executive?.name}</p>
                <p className="text-[11px] text-slate-400">{orderDetailData.order.executive?.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Pipeline Status</p>
                <div className="mt-1">
                  <Badge variant={getStatusVariant(orderDetailData.order.status)}>{orderDetailData.order.status}</Badge>
                </div>
              </div>
            </div>

            {/* Items Table Breakdown */}
            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-2">Order Items Breakdown</p>
              <div className="rounded-xl border border-slate-700/60 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-800 text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">Item Name</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-center">GST %</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {orderDetailData.order.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-bold text-white">{item.productName}</td>
                        <td className="p-2.5 text-center font-bold text-indigo-400">{item.quantity}</td>
                        <td className="p-2.5 text-right">₹{item.unitPrice}</td>
                        <td className="p-2.5 text-center">{item.gstPercentage}%</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">₹{item.subtotal?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="rounded-xl bg-slate-800/60 p-4 border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-slate-400">Order Date: <span className="text-white font-semibold">{new Date(orderDetailData.order.createdAt).toLocaleString()}</span></p>
                {orderDetailData.order.nfcDetails && (
                  <p className="text-indigo-400 mt-1 font-semibold">NFC Encoding: {orderDetailData.order.nfcDetails}</p>
                )}
              </div>
              <div className="text-right space-y-1 w-full sm:w-auto">
                <div className="flex justify-between sm:justify-end gap-6 text-slate-400"><span>Subtotal:</span><span>₹{orderDetailData.order.subTotal?.toFixed(2)}</span></div>
                <div className="flex justify-between sm:justify-end gap-6 text-slate-400"><span>GST (18%):</span><span>₹{orderDetailData.order.totalGst?.toFixed(2)}</span></div>
                {orderDetailData.order.discount > 0 && (
                  <div className="flex justify-between sm:justify-end gap-6 text-slate-400"><span>Discount:</span><span>-₹{orderDetailData.order.discount?.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between sm:justify-end gap-6 text-sm font-extrabold text-emerald-400 border-t border-slate-700 pt-1">
                  <span>Grand Total:</span><span>₹{orderDetailData.order.grandTotal?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Invoice & Payments */}
            {orderDetailData.invoice && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div>
                  <p className="font-bold text-white">GST Tax Invoice Generated</p>
                  <p className="text-[11px] text-indigo-300">Invoice #{orderDetailData.invoice.invoiceNumber}</p>
                </div>
                <a
                  href={`/api/invoices/${orderDetailData.invoice._id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 font-bold text-white text-xs hover:bg-indigo-500"
                >
                  <FileText className="h-4 w-4" /> Download PDF Invoice
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Order Cancellation & Refund Modal (For Admin & Executive) */}
      <Modal isOpen={isRefundModalOpen} onClose={() => setIsRefundModalOpen(false)} title={`Cancel Order & Issue Refund: ${selectedOrder?.orderNumber}`}>
        <form onSubmit={handleConfirmCancelWithRefund} className="space-y-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <p className="font-bold">Cancellation Action Effect:</p>
              <p className="mt-0.5">• Stock count will be restored (+) for ordered products.</p>
              <p>• Executive Monthly Target Cards Sold will be reduced (-).</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Refund Amount (₹) *</label>
            <input
              required
              type="number"
              value={refundForm.amount}
              onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Refund Method *</label>
              <select
                value={refundForm.method}
                onChange={(e) => setRefundForm({ ...refundForm, method: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Refund Transaction / Ref ID *</label>
              <input
                required
                type="text"
                value={refundForm.transactionId}
                onChange={(e) => setRefundForm({ ...refundForm, transactionId: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Reason / Refund Notes</label>
            <textarea
              rows={2}
              value={refundForm.notes}
              onChange={(e) => setRefundForm({ ...refundForm, notes: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsRefundModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Back
            </button>
            <Button type="submit" variant="danger" loading={submitting}>
              Confirm Cancellation & Issue Refund
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
