import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import { DollarSign, ShoppingCart, Users, AlertTriangle, TrendingUp, CreditCard } from 'lucide-react';
import api from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Enterprise Analytics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Super Admin Master Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time enterprise metrics for Kevalon Technology (Tapzy NFC Cards & Standees)
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Lifetime Sales"
          value={`₹${(data?.totalSales || 0).toLocaleString('en-IN')}`}
          subtext="Cumulative gross revenue"
          icon={DollarSign}
          color="indigo"
        />
        <StatsCard
          title="Monthly Sales"
          value={`₹${(data?.monthlySales || 0).toLocaleString('en-IN')}`}
          subtext="Current month total"
          icon={TrendingUp}
          color="emerald"
        />
        <StatsCard
          title="Today's Sales"
          value={`₹${(data?.todaysSales || 0).toLocaleString('en-IN')}`}
          subtext="Orders processed today"
          icon={ShoppingCart}
          color="cyan"
        />
        <StatsCard
          title="Pending Payments"
          value={`₹${(data?.pendingPaymentsAmount || 0).toLocaleString('en-IN')}`}
          subtext="Awaiting client settlement"
          icon={CreditCard}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 glass-card shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Sales & Revenue Trend</h3>
              <p className="text-xs text-slate-400">Last 6 Months Order Value Breakdown</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.salesTrend || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 glass-card shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Top Selling NFC Products</h3>
            <p className="text-xs text-slate-400 mb-4">By Quantity Sold</p>
            <div className="space-y-3">
              {data?.topProducts && data.topProducts.length > 0 ? (
                data.topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <div>
                      <p className="text-xs font-bold text-white">{p._id}</p>
                      <p className="text-[10px] text-slate-400">{p.totalQuantity} units sold</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-400">₹{p.totalRevenue?.toLocaleString('en-IN')}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">No products sold yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
