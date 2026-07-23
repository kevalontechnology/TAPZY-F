import React from 'react';
import { useSelector } from 'react-redux';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminDashboard from './AdminDashboard';
import ExecutiveDashboard from './ExecutiveDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  if (user.role === 'super_admin') {
    return <SuperAdminDashboard />;
  } else if (user.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <ExecutiveDashboard />;
  }
};

export default Dashboard;
