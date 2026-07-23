import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Gift, Zap, Settings, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useSelector } from 'react-redux';

const IncentivesPage = () => {
  const [incentives, setIncentives] = useState([]);
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, ruleRes] = await Promise.all([
        api.get('/incentives'),
        api.get('/incentives/rules'),
      ]);
      setIncentives(incRes.incentives || []);
      setRules(ruleRes.rule || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <span className="text-xs text-indigo-300">
          {new Date(row.year, row.month - 1).toLocaleString('default', { month: 'long' })} {row.year}
        </span>
      ),
    },
    {
      header: 'Total Sold',
      accessor: 'totalSold',
      render: (row) => <span className="text-xs font-bold text-slate-200">{row.totalSold} Cards</span>,
    },
    {
      header: 'Target Goal',
      accessor: 'targetQty',
      render: (row) => <span className="text-xs font-bold text-slate-400">{row.targetQty} Cards</span>,
    },
    {
      header: 'Extra Sold',
      accessor: 'extraSold',
      render: (row) => (
        <span className="text-xs font-extrabold text-emerald-400">
          +{row.extraSold} Cards
        </span>
      ),
    },
    {
      header: 'Earned Incentive (₹)',
      accessor: 'earnedAmount',
      render: (row) => (
        <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
          ₹{row.earnedAmount}
        </span>
      ),
    },
    {
      header: 'Payout Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status === 'Paid' ? 'success' : 'purple'}>{row.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Dynamic Incentive Matrix</h1>
        <p className="text-xs text-slate-400 mt-1">Automatic slab-based executive bonus calculations & payout history</p>
      </div>

      {/* Dynamic Slabs Config Display */}
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 glass-card shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Active Dynamic Incentive Slabs</h3>
              <p className="text-xs text-indigo-300">Rate per extra card after target completion</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rules?.slabs ? (
            rules.slabs.map((s, idx) => (
              <div key={idx} className="rounded-xl border border-indigo-500/20 bg-slate-900/60 p-3.5 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">
                  {s.minQty} - {s.maxQty === 10000 || s.maxQty === Infinity ? '201+' : s.maxQty} Cards
                </p>
                <p className="mt-1 text-lg font-extrabold text-emerald-400">
                  {s.ratePerCard === 0 ? '₹0 (Base)' : `₹${s.ratePerCard} / card`}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">Loading slab rules...</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Calculated Executive Incentives</h3>
        <DataTable columns={columns} data={incentives} searchPlaceholder="Search incentives..." />
      </div>
    </div>
  );
};

export default IncentivesPage;
