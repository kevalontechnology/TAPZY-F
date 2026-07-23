import React from 'react';
import { Target, Award, TrendingUp, Zap } from 'lucide-react';

const ExecutiveTargetWidget = ({ target = 100, sold = 112, extraSold = 12, incentiveEarned = 360 }) => {
  const percentage = Math.min(100, Math.round((sold / (target || 1)) * 100));
  const remaining = Math.max(0, target - sold);

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/90 to-slate-900 p-6 glass-card shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Monthly Target Performance</h3>
            <p className="text-xs text-slate-400">NFC & Google Review Cards Sales Goal</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <Zap className="h-3.5 w-3.5" /> {percentage >= 100 ? 'Target Achieved!' : 'In Progress'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs font-medium text-slate-300">
          <span>{sold} Cards Sold</span>
          <span>Target: {target} Cards ({percentage}%)</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-700/50 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Detailed Metrics Breakdown */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 text-center">
          <p className="text-[11px] font-medium text-slate-400">Target Goal</p>
          <p className="mt-1 text-lg font-bold text-white">{target}</p>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 text-center">
          <p className="text-[11px] font-medium text-slate-400">Cards Sold</p>
          <p className="mt-1 text-lg font-bold text-indigo-400">{sold}</p>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 text-center">
          <p className="text-[11px] font-medium text-slate-400">Extra Sold</p>
          <p className="mt-1 text-lg font-bold text-emerald-400">+{extraSold}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-[11px] font-medium text-emerald-300">Earned Incentive</p>
          <p className="mt-1 text-lg font-extrabold text-emerald-400">₹{incentiveEarned}</p>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveTargetWidget;
