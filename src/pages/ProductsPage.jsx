import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useSelector } from 'react-redux';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'NFC Business Card',
    costPrice: '',
    sellingPrice: '',
    gstPercentage: 18,
    description: '',
    initialStock: 50,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Error saving product');
    }
  };

  const columns = [
    {
      header: 'Product Name & SKU',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.name}</p>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
            {row.sku}
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <Badge variant="purple">{row.category}</Badge>,
    },
    {
      header: 'Cost / Selling Price',
      accessor: 'sellingPrice',
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-emerald-400">₹{row.sellingPrice}</p>
          <p className="text-[10px] text-slate-400">Cost: ₹{row.costPrice} | GST: {row.gstPercentage}%</p>
        </div>
      ),
    },
    {
      header: 'In Stock',
      accessor: 'stockQuantity',
      render: (row) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            (row.stockQuantity || 0) <= (row.lowStockThreshold || 20)
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {row.stockQuantity || 0} units
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Tapzy NFC Business Cards, Google Review Cards & Standees</p>
        </div>
        {['super_admin', 'admin'].includes(user?.role) && (
          <button
            onClick={() => {
              setSelectedProduct(null);
              setFormData({
                sku: '',
                name: '',
                category: 'NFC Business Card',
                costPrice: '',
                sellingPrice: '',
                gstPercentage: 18,
                description: '',
                initialStock: 50,
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        )}
      </div>

      <DataTable columns={columns} data={products} searchPlaceholder="Search catalog..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedProduct ? 'Edit Product' : 'Add New Tapzy Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">SKU Code *</label>
              <input
                required
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="TAP-NFC-CARD"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Product Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              >
                <option value="NFC Business Card">NFC Business Card</option>
                <option value="Google Review Card">Google Review Card</option>
                <option value="Google Review Standee">Google Review Standee</option>
                <option value="NFC Stand">NFC Stand</option>
                <option value="Custom Products">Custom Products</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Product Name *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Cost Price (₹) *</label>
              <input
                required
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Selling Price (₹) *</label>
              <input
                required
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">GST %</label>
              <input
                type="number"
                value={formData.gstPercentage}
                onChange={(e) => setFormData({ ...formData, gstPercentage: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {!selectedProduct && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Initial Stock Count</label>
              <input
                type="number"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
