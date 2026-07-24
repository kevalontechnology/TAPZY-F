import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, toggleDarkMode } from '../redux/slices/uiSlice';
import { logout } from '../redux/slices/authSlice';
import { Menu, Bell, Sun, Moon, LogOut, User as UserIcon, Shield, ChevronDown, Check } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    return 'Sales Executive';
  };

  return (
    <header className={`sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b ${
      darkMode ? 'border-slate-800 bg-slate-900/90 text-white' : 'border-slate-200 bg-white/90 text-slate-800 shadow-sm'
    } px-4 sm:px-6 backdrop-blur-md transition-colors duration-300`}>
      {/* Left: Sidebar Toggle & Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`rounded-xl border p-2 transition-colors ${
            darkMode ? 'border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs tracking-tighter shadow-md shadow-indigo-500/30">
            T
          </div>
          <span className={`font-extrabold text-base sm:text-lg tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            TAPZY
          </span>
          <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            Kevalon CRM
          </span>
        </div>
      </div>

      {/* Right: Actions (Theme, Notification Bell, User Profile) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Switch */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className={`rounded-xl border p-2 transition-colors ${
            darkMode ? 'border-slate-700/60 text-amber-400 hover:bg-slate-800' : 'border-slate-200 text-indigo-600 hover:bg-slate-100'
          }`}
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`relative rounded-xl border p-2 transition-colors ${
              darkMode ? 'border-slate-700/60 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border ${
              darkMode ? 'border-slate-800 bg-slate-900 shadow-2xl' : 'border-slate-200 bg-white shadow-xl'
            } p-4 z-50`}>
              <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'} pb-3`}>
                <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>System Notifications</h4>
                <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">{unreadCount} unread</span>
              </div>
              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markRead(n._id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        n.isRead
                          ? darkMode ? 'bg-slate-800/30 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
                          : darkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-indigo-50 border-indigo-200 text-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold">{n.title}</p>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />}
                      </div>
                      <p className="text-xs mt-1 leading-relaxed opacity-90">{n.message}</p>
                      <p className="text-[10px] mt-1.5 opacity-60">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-2 rounded-xl border p-1.5 pr-3 transition-colors ${
              darkMode ? 'border-slate-700/60 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className={`text-xs font-bold leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'User'}</p>
              <p className="text-[10px] font-medium text-indigo-400 mt-0.5">{getRoleLabel(user?.role)}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-2xl border ${
              darkMode ? 'border-slate-800 bg-slate-900 shadow-2xl' : 'border-slate-200 bg-white shadow-xl'
            } p-2 z-50`}>
              <div className={`px-3 py-2 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <a
                href="/profile"
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  darkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <UserIcon className="h-4 w-4" /> Profile Settings
              </a>
              <button
                onClick={() => dispatch(logout())}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
