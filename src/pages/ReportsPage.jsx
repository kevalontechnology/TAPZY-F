import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { BarChart3, Download, Calendar } from 'lucide-react';
import api from '../services/api';

const ReportsPage = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/executive-performance');
      setReport(res.report || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const exportToCSV = () => {
    let csv = 'Executive,Target Cards,Sold Cards,Extra Sold,Earned Incentive (INR),Total Sales (INR)\n';
    report.forEach((r) => {
      csv += `"${r.executive?.name}",${r.targetCards},${r.totalSoldCards},${r.extraSoldCards},${r.earnedIncentive},${r.totalSales}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tapzy_Executive_Performance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const columns = [
    {
      header: 'Executive Name',
      accessor: 'executive',
      render: (row) => <span className="font-bold text-white text-xs">{row.executive?.name}</span>,
    },
    {
      header: 'Target Goal',
      accessor: 'targetCards',
      render: (row) => <span className="text-xs font-bold text-slate-300">{row.targetCards} Cards</span>,
    },
    {
      header: 'Cards Sold',
      accessor: 'totalSoldCards',
      render: (row) => <span className="text-xs font-bold text-indigo-400">{row.totalSoldCards} Cards</span>,
    },
    {
      header: 'Extra Sold',
      accessor: 'extraSoldCards',
      render: (row) => <span className="text-xs font-bold text-emerald-400">+{row.extraSoldCards}</span>,
    },
    {
      header: 'Incentive Earned',
      accessor: 'earnedIncentive',
      render: (row) => <span className="text-xs font-extrabold text-emerald-400">₹{row.earnedIncentive}</span>,
    },
    {
      header: 'Gross Sales Revenue',
      accessor: 'totalSales',
      render: (row) => <span className="text-xs font-extrabold text-white">₹{row.totalSales?.toLocaleString('en-IN')}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Enterprise Reports & Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">Executive performance, Target achievements & Revenue reports</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Download className="h-4 w-4" /> Export CSV Report
        </button>
      </div>

      <DataTable columns={columns} data={report} searchPlaceholder="Search executive performance..." />
    </div>
  );
};

export default ReportsPage;
