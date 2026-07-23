import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import ExecutiveTargetWidget from '../components/ExecutiveTargetWidget';
import { DollarSign, ShoppingCart, Calendar, CheckSquare, Plus, PhoneCall } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const ExecutiveDashboard = () => {
  const [targetInfo, setTargetInfo] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const curMonth = new Date().getMonth() + 1;
        const curYear = new Date().getFullYear();

        const [dbRes, incRes, leadRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get(`/incentives?month=${curMonth}&year=${curYear}`),
          api.get('/leads?status=Follow-up&limit=5'),
        ]);

        setDashboardData(dbRes.data);
        if (incRes.incentives && incRes.incentives.length > 0) {
          setTargetInfo(incRes.incentives[0]);
        }
        setLeads(leadRes.leads || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Executive Dashboard...</div>;
  }

  const sold = targetInfo?.totalSold || 112;
  const target = targetInfo?.targetQty || 100;
  const extraSold = targetInfo?.extraSold || (sold > target ? sold - target : 0);
  const earnedIncentive = targetInfo?.earnedAmount || 360;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Sales Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Track your daily sales, target achievements, client follow-ups & incentives</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/leads"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add New Lead
          </Link>
          <Link
            to="/orders"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" /> Create Order
          </Link>
        </div>
      </div>

      {/* Target & Incentive Performance Gauge Component */}
      <ExecutiveTargetWidget
        target={target}
        sold={sold}
        extraSold={extraSold}
        incentiveEarned={earnedIncentive}
      />

      {/* Sales Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Today's Sales"
          value={`₹${(dashboardData?.todaysSales || 0).toLocaleString('en-IN')}`}
          subtext="Processed today"
          icon={DollarSign}
          color="indigo"
        />
        <StatsCard
          title="Monthly Total Sales"
          value={`₹${(dashboardData?.monthlySales || 0).toLocaleString('en-IN')}`}
          subtext="Current month gross"
          icon={ShoppingCart}
          color="emerald"
        />
        <StatsCard
          title="Clients Managed"
          value={dashboardData?.totalClients || 0}
          subtext="Assigned account profiles"
          icon={CheckSquare}
          color="cyan"
        />
      </div>

      {/* Upcoming Follow-ups & Reminders */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 glass-card shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-indigo-400" /> Pending Follow-up Reminders
          </h3>
          <Link to="/leads" className="text-xs font-bold text-indigo-400 hover:underline">
            View All Leads →
          </Link>
        </div>
        <div className="space-y-3">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <div key={lead._id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <p className="text-xs font-bold text-white">{lead.companyName}</p>
                  <p className="text-[11px] text-slate-400">Contact: {lead.clientName} ({lead.mobile})</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">No scheduled follow-ups right now.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
