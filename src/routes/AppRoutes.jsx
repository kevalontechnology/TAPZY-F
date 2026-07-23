import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import UsersPage from '../pages/UsersPage';
import ClientsPage from '../pages/ClientsPage';
import LeadsPage from '../pages/LeadsPage';
import ProductsPage from '../pages/ProductsPage';
import InventoryPage from '../pages/InventoryPage';
import OrdersPage from '../pages/OrdersPage';
import PaymentsPage from '../pages/PaymentsPage';
import InvoicesPage from '../pages/InvoicesPage';
import TargetsPage from '../pages/TargetsPage';
import IncentivesPage from '../pages/IncentivesPage';
import ReportsPage from '../pages/ReportsPage';
import ActivityLogsPage from '../pages/ActivityLogsPage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/targets" element={<TargetsPage />} />
                <Route path="/incentives" element={<IncentivesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/activities" element={<ActivityLogsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
