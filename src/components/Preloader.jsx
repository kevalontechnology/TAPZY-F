import React from 'react';

const Preloader = ({ message = 'Loading Kevalon Technology Tapzy CRM...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Pulsing Logo & Spinner Ring */}
        <div className="relative flex items-center justify-center h-24 w-24">
          {/* Outer Rotating Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-slate-800" />
          
          {/* Central Logo Box */}
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-indigo-500/40 animate-pulse">
            T
          </div>
        </div>

        {/* Brand & Loading Text */}
        <h2 className="mt-6 text-xl font-extrabold text-white tracking-tight">TAPZY CRM</h2>
        <p className="mt-1 text-xs font-semibold text-indigo-400 uppercase tracking-widest">
          Kevalon Technology Enterprise Portal
        </p>

        {/* Status Message */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
