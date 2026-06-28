import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Overview from './views/Overview';
import Businesses from './views/Businesses';
import Products from './views/Products';
import Factories from './views/Factories';
import Employees from './views/Employees';
import Marketing from './views/Marketing';
import Research from './views/Research';
import WorldMap from './views/WorldMap';
import StockMarket from './views/StockMarket';
import Banking from './views/Banking';
import Missions from './views/Missions';
import Login from './views/Login';
import { X, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const App = () => {
  const { currentTab, player, tick, initializeGame, notifications, clearNotifications, isAuthenticated } = useGameStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load game state on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Main Ticker Engine
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timer);
  }, [tick, isAuthenticated]);

  // Route View Tabs
  const renderView = () => {
    switch (currentTab) {
      case 'Overview':
        return <Overview />;
      case 'Businesses':
        return <Businesses />;
      case 'Products':
        return <Products />;
      case 'Factories':
        return <Factories />;
      case 'Employees':
        return <Employees />;
      case 'Marketing':
        return <Marketing />;
      case 'Research':
        return <Research />;
      case 'World Map':
        return <WorldMap />;
      case 'Stock Market':
        return <StockMarket />;
      case 'Banking':
        return <Banking />;
      case 'Missions':
        return <Missions />;
      default:
        return <Overview />;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex bg-slate-950 text-slate-50 min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Statistics Topbar */}
        <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Route Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <div className="max-w-7xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Real-time Notification Log Ticker drawer / Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="self-end text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 shadow-md hover:bg-slate-800 transition cursor-pointer mb-1"
          >
            Clear Log
          </button>
        )}
        <AnimatePresence>
          {notifications.slice(0, 4).map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              layout
              className="glass-panel border-slate-800/40 rounded-xl p-4 shadow-xl flex items-start gap-3 relative overflow-hidden"
            >
              {/* Highlight bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  toast.type === 'success'
                    ? 'bg-emerald-500'
                    : toast.type === 'warning'
                    ? 'bg-amber-500'
                    : toast.type === 'error'
                    ? 'bg-rose-500'
                    : 'bg-indigo-500'
                }`}
              />

              {getNotificationIcon(toast.type)}

              <div className="flex-1 pr-4">
                <h4 className="font-bold text-sm text-slate-100">{toast.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
                <span className="text-[9px] text-slate-500 mt-2 block font-mono">{toast.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default App;
