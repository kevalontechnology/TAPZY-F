import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import { ShoppingCart, Users, CheckCircle, Clock, Award, Shield } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
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
    return <div className="p-8 text-center text-slate-400">Loading Operations Dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Operations Control</h1>
        <p className="text-xs text-slate-400 mt-1">Manage Client Leads, Order Approvals, Stock and Sales Team Targets</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Clients" value={data?.totalClients || 0} subtext="Active Accounts" icon={Users} color="indigo" />
        <StatsCard title="Total Orders" value={data?.totalOrders || 0} subtext="Lifetime processed" icon={ShoppingCart} color="emerald" />
        <StatsCard title="Monthly Sales" value={`₹${(data?.monthlySales || 0).toLocaleString('en-IN')}`} subtext="Current Month" icon={CheckCircle} color="purple" />
        <StatsCard title="Low Stock Alerts" value={data?.lowStockCount || 0} subtext="Items below threshold" icon={Clock} color="rose" />
      </div>
    </div>
  );
};

export default AdminDashboard;
