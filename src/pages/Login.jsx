import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('superadmin@kevalon.com');
  const [password, setPassword] = useState('admin123');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const res = await dispatch(login({ email, password }));
    if (res.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-8 glass-card border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-500/30">
            T
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">Kevalon Technology</h2>
          <p className="mt-1 text-xs text-indigo-400 font-semibold tracking-wide uppercase">
            Tapzy NFC & Google Review Cards CRM
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@kevalon.com"
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            icon={ArrowRight}
            className="w-full py-3 text-sm font-bold"
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Demo Fast Logins */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase text-center mb-3">
            Quick Demo Role Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoFill('superadmin@kevalon.com', 'admin123')}
              className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
            >
              Super Admin
            </button>
            <button
              onClick={() => handleDemoFill('admin@kevalon.com', 'admin123')}
              className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => handleDemoFill('rahul@kevalon.com', 'exec123')}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              Executive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
