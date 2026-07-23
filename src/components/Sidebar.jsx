import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Package,
  Boxes,
  ShoppingCart,
  CreditCard,
  FileText,
  Target,
  Gift,
  BarChart3,
  Activity,
  Settings,
  User,
} from 'lucide-react';

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  if (!sidebarOpen) return null;

  const role = user?.role || 'executive';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'executive'] },
    { label: 'User Management', path: '/users', icon: Users, roles: ['super_admin'] },
    { label: 'Client Directory', path: '/clients', icon: Building2, roles: ['super_admin', 'admin', 'executive'] },
    { label: 'Lead CRM', path: '/leads', icon: UserCheck, roles: ['super_admin', 'admin', 'executive'] },
    { label: 'Product Catalog', path: '/products', icon: Package, roles: ['super_admin', 'admin'] },
    { label: 'Inventory & Stock', path: '/inventory', icon: Boxes, roles: ['super_admin', 'admin'] },
    { label: 'Orders & NFC Config', path: '/orders', icon: ShoppingCart, roles: ['super_admin', 'admin', 'executive'] },
    { label: 'Payments', path: '/payments', icon: CreditCard, roles: ['super_admin', 'admin', 'executive'] },
    { label: 'GST Invoices', path: '/invoices', icon: FileText, roles: ['super_admin', 'admin', 'executive'] },
    { label: 'Monthly Targets', path: '/targets', icon: Target, roles: ['super_admin', 'admin', 'executive'] },
    { label: 'Incentive Matrix', path: '/incentives', icon: Gift, roles: ['super_admin', 'admin', 'executive'] },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['super_admin', 'admin'] },
    { label: 'Audit Logs', path: '/activities', icon: Activity, roles: ['super_admin'] },
    { label: 'Company Settings', path: '/settings', icon: Settings, roles: ['super_admin'] },
    { label: 'My Profile', path: '/profile', icon: User, roles: ['super_admin', 'admin', 'executive'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900/90 glass-card p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="mb-4 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <p className="text-[10px] uppercase font-bold text-indigo-400">Authenticated Role</p>
        <p className="text-xs font-bold text-white uppercase mt-0.5">{role.replace('_', ' ')}</p>
      </div>

      <nav className="space-y-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
