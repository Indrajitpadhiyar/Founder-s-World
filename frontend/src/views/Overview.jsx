import React from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney } from "../utils/format";
import GlassCard from "../components/GlassCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Building2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Award,
  Globe2,
} from "lucide-react";

export const Overview = () => {
  const {
    player,
    businesses,
    employees,
    economyPhase,
    activeEvents,
    notifications,
  } = useGameStore();

  // Determine Empire Rank
  const getEmpireRank = (netWorth) => {
    if (netWorth < 50000)
      return {
        rank: "Small Business",
        next: 50000,
        desc: "Operating locally out of a home office.",
      };
    if (netWorth < 250000)
      return {
        rank: "Local Company",
        next: 250000,
        desc: "A registered storefront with local customers.",
      };
    if (netWorth < 1000000)
      return {
        rank: "Regional Company",
        next: 1000000,
        desc: "Expanding operations across state lines.",
      };
    if (netWorth < 10000000)
      return {
        rank: "National Company",
        next: 10000000,
        desc: "A well-known household brand nationwide.",
      };
    if (netWorth < 100000000)
      return {
        rank: "International Company",
        next: 100000000,
        desc: "Managing logistics and operations in multiple borders.",
      };
    if (netWorth < 1000000000)
      return {
        rank: "Global Corporation",
        next: 1000000000,
        desc: "Multinational conglomerate trading worldwide.",
      };
    if (netWorth < 10000000000)
      return {
        rank: "Public Company",
        next: 10000000000,
        desc: "Listed corporation serving board stakeholders.",
      };
    return {
      rank: "Mega Conglomerate",
      next: 100000000000,
      desc: "Billion-dollar corporate empire controlling global markets.",
    };
  };

  const { rank, next, desc } = getEmpireRank(player.netWorth);
  const prevLimit =
    rank === "Small Business"
      ? 0
      : rank === "Local Company"
        ? 50000
        : rank === "Regional Company"
          ? 250000
          : rank === "National Company"
            ? 1000000
            : rank === "International Company"
              ? 10000000
              : rank === "Global Corporation"
                ? 100000000
                : rank === "Public Company"
                  ? 1000000000
                  : 10000000000;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((player.netWorth - prevLimit) / (next - prevLimit)) * 100),
  );

  // Prepare chart data
  const chartData = player.netWorthHistory.map((val, idx) => ({
    name: `T-${player.netWorthHistory.length - 1 - idx}d`,
    value: val,
  }));

  // Net change calculations
  const netWorthStart = player.netWorthHistory[0] || 10000;
  const netWorthEnd = player.netWorth;
  const netChange = netWorthEnd - netWorthStart;
  const percentChange = (netChange / netWorthStart) * 100;

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Executive Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time indicators and operational health logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
              Economy Phase
            </span>
            <span className="text-indigo-400 font-extrabold text-sm">
              {economyPhase}
            </span>
          </div>
        </div>
      </div>

      {/* Empire Rank Progression Card */}
      <GlassCard glowColor="indigo">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {rank}
              </h3>
            </div>
            <p className="text-slate-400 text-sm">{desc}</p>
          </div>
          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Progress to Next Rank</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-[2px]">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{formatMoney(prevLimit)}</span>
              <span>{formatMoney(next)}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard hoverable>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Cash Flow
              </span>
              <h4 className="text-2xl font-black text-white tracking-tight">
                {formatMoney(player.funds)}
              </h4>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>Liquid Liquidity</span>
          </div>
        </GlassCard>

        <GlassCard hoverable>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Net Worth Change
              </span>
              <h4 className="text-2xl font-black text-white tracking-tight">
                {netChange >= 0
                  ? `+${formatMoney(netChange)}`
                  : formatMoney(netChange)}
              </h4>
            </div>
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div
            className={`flex items-center gap-1 mt-4 text-xs font-semibold ${netChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {netChange >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{percentChange.toFixed(1)}% (Last 30d)</span>
          </div>
        </GlassCard>

        <GlassCard hoverable>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Divisions Open
              </span>
              <h4 className="text-2xl font-black text-white tracking-tight">
                {businesses.length}
              </h4>
            </div>
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <Globe2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-slate-400">
            <span>Operating internationally</span>
          </div>
        </GlassCard>

        <GlassCard hoverable>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Active Workforce
              </span>
              <h4 className="text-2xl font-black text-white tracking-tight">
                {employees.length}
              </h4>
            </div>
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-purple-400">
            <span>Across all departments</span>
          </div>
        </GlassCard>
      </div>

      {/* Main Charts & Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Net Worth Chart */}
        <div className="lg:col-span-2">
          <GlassCard
            className="h-[400px] flex flex-col justify-between"
            hoverable={false}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-white text-lg tracking-tight">
                  Corporate Growth
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Asset & cash valuation trend over time
                </p>
              </div>
            </div>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(tick) => formatMoney(tick)}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                    formatter={(val) => [formatMoney(val), "Valuation"]}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Real-time Ticker / Log feed */}
        <div className="lg:col-span-1">
          <GlassCard className="h-[400px] flex flex-col" hoverable={false}>
            <h3 className="font-extrabold text-white text-lg tracking-tight mb-4">
              Corporate Logs
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No notifications recorded yet.
                </div>
              ) : (
                notifications.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/40 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          log.type === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : log.type === "warning"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : log.type === "error"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {log.timestamp}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-200 mt-1">
                      {log.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default Overview;
