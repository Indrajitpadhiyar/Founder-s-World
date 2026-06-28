import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { formatMoney } from '../utils/format';
import { Play, Pause, Zap, Calendar, Wallet, BarChart3, FlaskConical, TrendingUp, AlertTriangle, Menu } from 'lucide-react';

export const Topbar = ({ onMenuClick }) => {
  const { player, economyPhase, activeEvents, setSpeed, daysSimulated } = useGameStore();
  const [actualTime, setActualTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setActualTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getEconomyBadge = () => {
    switch (economyPhase) {
      case 'Boom':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">Boom</span>;
      case 'Recession':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">Recession</span>;
      case 'Crisis':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">Crisis</span>;
      case 'Normal':
      default:
        return <span className="bg-slate-500/10 text-slate-450 border border-slate-805 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider hidden sm:inline-block">Normal</span>;
    }
  };

  return (
    <header className="glass-panel border-b border-slate-800/40 h-20 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 gap-4">
      {/* Simulation Speed & Date */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Burger Menu Button for Mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-slate-405 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800/60 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300 bg-slate-900/60 border border-slate-800/40 rounded-xl px-2.5 sm:px-4 py-1 sm:py-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white leading-none">Day {Math.floor(daysSimulated) + 1}</span>
            <span className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">{actualTime}</span>
          </div>
          {getEconomyBadge()}
        </div>

        {/* Speed Controls */}
        <div className="flex items-center bg-slate-900/60 border border-slate-800/40 rounded-xl p-1 gap-0.5 sm:gap-1">
          <button
            onClick={() => setSpeed(0)}
            className={`p-1 sm:p-1.5 rounded-lg cursor-pointer transition-colors ${
              player.speed === 0 ? 'bg-indigo-500 text-white' : 'text-slate-450 hover:text-slate-200'
            }`}
            title="Pause Simulation"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSpeed(1)}
            className={`p-1 sm:p-1.5 rounded-lg cursor-pointer transition-colors ${
              player.speed === 1 ? 'bg-indigo-500 text-white' : 'text-slate-455 hover:text-slate-200'
            }`}
            title="Normal Speed (1x)"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSpeed(2)}
            className={`p-1 sm:p-1.5 rounded-lg cursor-pointer transition-colors ${
              player.speed === 2 ? 'bg-indigo-500 text-white' : 'text-slate-460 hover:text-slate-200'
            }`}
            title="Fast Speed (2x)"
          >
            <Zap className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Event Alerts */}
      {activeEvents.length > 0 && (
        <div className="hidden xl:flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-xl text-xs font-semibold animate-pulse shrink-0">
          <AlertTriangle className="w-4 h-4" />
          <span>Active Impact: {activeEvents[0]?.title} ({activeEvents[0]?.duration}d)</span>
        </div>
      )}

      {/* Main Wealth & Resource Stats */}
      <div className="flex items-center gap-3 sm:gap-6 md:gap-8 overflow-x-auto py-1">
        {/* Cash Funds */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Wallet className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div>
            <div className="hidden sm:block text-[10px] text-slate-450 uppercase tracking-wider font-bold">Liquid Cash</div>
            <div className="text-emerald-400 font-extrabold text-sm sm:text-base md:text-lg tracking-tight">
              {formatMoney(player.funds)}
            </div>
          </div>
        </div>

        {/* Corporate Valuation / Net Worth */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <BarChart3 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-400" />
          </div>
          <div>
            <div className="hidden sm:block text-[10px] text-slate-455 uppercase tracking-wider font-bold">Value</div>
            <div className="text-white font-extrabold text-sm sm:text-base md:text-lg tracking-tight">
              {formatMoney(player.netWorth)}
            </div>
          </div>
        </div>

        {/* Research Tech Points */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <FlaskConical className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-cyan-400" />
          </div>
          <div>
            <div className="hidden sm:block text-[10px] text-slate-460 uppercase tracking-wider font-bold">Tech</div>
            <div className="text-cyan-400 font-extrabold text-sm sm:text-base md:text-lg tracking-tight">
              {player.techPoints.toFixed(0)}
            </div>
          </div>
        </div>

        {/* IPO Status Badge */}
        {player.isIpoCompleted ? (
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" /> Public
          </span>
        ) : (
          player.ipoUnlocked && (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold uppercase tracking-wider shrink-0">
              IPO
            </span>
          )
        )}
      </div>
    </header>
  );
};
export default Topbar;
