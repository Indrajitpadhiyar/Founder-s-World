import React from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  LayoutDashboard,
  Briefcase,
  ShoppingBag,
  Factory,
  Users,
  Megaphone,
  Cpu,
  Globe,
  TrendingUp,
  Landmark,
  Award,
  LogOut,
  X,
  Lock,
} from 'lucide-react';
import { formatMoney } from '../utils/format';

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentTab, setCurrentTab, resetGame, player, logout, addNotification } = useGameStore();

  const navigationItems = [
    { name: 'Overview', icon: LayoutDashboard, threshold: 0 },
    { name: 'Businesses', icon: Briefcase, threshold: 0 },
    { name: 'Products', icon: ShoppingBag, threshold: 0, label: 'Inventory' },
    { name: 'Stock Market', icon: TrendingUp, threshold: 1000 },
    { name: 'Banking', icon: Landmark, threshold: 1000 },
    { name: 'Marketing', icon: Megaphone, threshold: 5000 },
    { name: 'Employees', icon: Users, threshold: 10000 },
    { name: 'Factories', icon: Factory, threshold: 100000 },
    { name: 'World Map', icon: Globe, threshold: 1000000, label: 'Global Expansion' },
    { name: 'Research', icon: Cpu, threshold: 10000000, label: 'R&D' },
    { name: 'Missions', icon: Award, threshold: 0 },
  ];

  return (
    <>
      {/* Backdrop overlay on mobile when open */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
        />
      )}

      <aside
        className={`w-64 glass-panel border-r border-slate-800/40 flex flex-col h-screen fixed md:sticky top-0 z-50 transition-transform duration-300 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-emerald-500 p-[2px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-white tracking-wider text-lg">
                BE
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 text-sm tracking-wide leading-none uppercase">
                BizEmpire
              </h1>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
                Simulator
              </span>
            </div>
          </div>

          {/* Close trigger on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Link Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isLocked = player.netWorth < item.threshold;
            const isActive = currentTab === item.name;
            
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (isLocked) {
                    addNotification(
                      'Feature Locked',
                      `${item.name} unlocks at ${formatMoney(item.threshold)} net worth (Current: ${formatMoney(player.netWorth)}).`,
                      'warning'
                    );
                    return;
                  }
                  setCurrentTab(item.name);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isLocked
                    ? 'text-slate-600 hover:text-slate-500 bg-transparent border border-transparent cursor-not-allowed'
                    : isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 text-indigo-400 border border-indigo-500/20 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span>{item.label || item.name}</span>
                </div>
                {isLocked && <Lock className="w-3.5 h-3.5 text-slate-700" />}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800/30 space-y-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your business empire? All progress will be deleted!')) {
                resetGame();
                onClose();
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold text-rose-500/80 hover:bg-rose-950/20 hover:text-rose-400 border border-transparent transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Reset Progress
          </button>
          
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            Log Out Executive
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
