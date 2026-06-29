import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import GlassCard from '../components/GlassCard';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login = () => {
  const { login, signup, addNotification } = useGameStore();
  const [isRegister, setIsRegister] = useState(false);
  
  // Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !username)) {
      addNotification('Form Error', 'Please fill out all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const success = await signup(username, email, password);
        if (success) {
          addNotification('Account Created', 'Welcome to the Funder World. Select your home location to begin.', 'success');
        }
      } else {
        const success = await login(email, password);
        if (success) {
          addNotification('Welcome Back!', 'Successfully logged into your corporation.', 'success');
        }
      }
    } catch (err) {
      addNotification('Auth Failed', err.message || 'An error occurred during authentication.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 overflow-hidden relative">
      {/* Background ambient glow shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-emerald-500 p-[2px] shadow-xl shadow-indigo-500/20 mb-4">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center font-black text-white tracking-widest text-2xl">
              BE
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight leading-none uppercase">
            BizEmpire Simulator
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Build your conglomerate from $100 to global dominance.
          </p>
        </div>

        <GlassCard hoverable={false} className="p-8 border-slate-800/60 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-slate-950 border border-slate-850 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setPassword(''); }}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition ${
                !isRegister
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setPassword(''); }}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition ${
                isRegister
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. janesmith"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer mt-6"
            >
              {loading ? 'Validating credentials...' : isRegister ? 'Confirm Registration' : 'Log In Executive'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
