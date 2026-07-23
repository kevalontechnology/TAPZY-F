import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import { FileText, Download, Printer, Share2 } from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenPdf = (invoiceId) => {
    const url = `${API_BASE_URL}/invoices/${invoiceId}/pdf`;
    window.open(url, '_blank');
  };

  const columns = [
    {
      header: 'Invoice Number',
      accessor: 'invoiceNumber',
      render: (row) => <span className="font-mono font-bold text-white text-xs">{row.invoiceNumber}</span>,
    },
    {
      header: 'Order Ref',
      accessor: 'order',
      render: (row) => <span className="font-mono text-slate-300 text-xs">{row.order?.orderNumber}</span>,
    },
    {
      header: 'Billed To Client',
      accessor: 'client',
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.client?.companyName}</p>
          <p className="text-[10px] text-slate-400">GST: {row.client?.gstNumber || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Grand Total',
      accessor: 'grandTotal',
      render: (row) => <span className="font-bold text-emerald-400 text-xs">₹{row.grandTotal?.toFixed(2)}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status === 'Paid' ? 'success' : 'primary'}>{row.status}</Badge>,
    },
    {
      header: 'Invoice Actions',
      accessor: '_id',
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenPdf(row._id)}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> Download GST PDF
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">GST Tax Invoices</h1>
        <p className="text-xs text-slate-400 mt-1">Generated PDF invoices with itemized tax details, bank info & HSN codes</p>
      </div>

      <DataTable columns={columns} data={invoices} searchPlaceholder="Search invoice number..." />
    </div>
  );
};

export default InvoicesPage;
