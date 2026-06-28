import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney, formatPercent, formatNumber } from "../utils/format";
import GlassCard from "../components/GlassCard";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Building } from "lucide-react";
import confetti from "canvas-confetti";

export const StockMarket = () => {
  const {
    player,
    stocks,
    buyStock,
    sellStock,
    launchIpo,
    adjustDividends,
    buyBackShares,
    businesses,
    employees,
  } = useGameStore();

  // IPO Form State
  const [ticker, setTicker] = useState("");
  const [sharePrice, setSharePrice] = useState(10);
  const [issueShares, setIssueShares] = useState(1000000);

  // Buy/Sell quantities
  const [tradeShares, setTradeShares] = useState({});

  const handleLaunchIpo = (e) => {
    e.preventDefault();
    if (!ticker.trim() || ticker.length < 3 || ticker.length > 4) return;

    launchIpo(ticker, sharePrice, issueShares);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const getIPORequirements = () => {
    return [
      {
        text: "Company Valuation over $100M",
        met: player.netWorth >= 100000000,
      },
      {
        text: "Operating division branch established",
        met: businesses.length >= 1,
      },
      { text: "Workforce exceeds 3 staff members", met: employees.length >= 3 },
    ];
  };

  const ipoReqs = getIPORequirements();
  const allReqsMet = ipoReqs.every((r) => r.met);

  const playerCompanyStock = stocks.find((s) => s.isPlayerCompany);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Stock Brokerage & Listing
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Monitor public corporations, trade securities, or launch an IPO to
          raise public capital.
        </p>
      </div>

      {/* Corporate Listing Panel (IPO) */}
      {!player.isIpoCompleted ? (
        <GlassCard
          glowColor={player.ipoUnlocked ? "indigo" : "none"}
          className="p-6 space-y-6"
          hoverable={false}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Initial Public Offering (IPO)
                </h3>
              </div>
              <p className="text-slate-400 text-sm">
                Take your business empire public to trade outstanding shares,
                pay dividends, and raise capital.
              </p>
            </div>
            {player.ipoUnlocked ? (
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">
                Audits Passed
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-500 border border-slate-700/60 text-xs px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">
                Audit Pending
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-800/40">
            {/* Audit Checklist */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Audit Listing Checklist
              </h4>
              <div className="space-y-2.5">
                {ipoReqs.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-xs font-semibold"
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        req.met
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "border-slate-800 text-slate-650"
                      }`}
                    >
                      ✓
                    </div>
                    <span
                      className={req.met ? "text-slate-300" : "text-slate-500"}
                    >
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Form */}
            <form onSubmit={handleLaunchIpo} className="space-y-4">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Audit Form Setup
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">
                    Ticker Symbol (3-4 chars)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="e.g. APEX"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">
                    Offer Share Price ($)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    required
                    value={sharePrice}
                    onChange={(e) =>
                      setSharePrice(
                        Math.max(5, parseFloat(e.target.value) || 0),
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">
                  Outstanding Floating Volume
                </label>
                <select
                  value={issueShares}
                  onChange={(e) => setIssueShares(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={1000000}>1,000,000 shares</option>
                  <option value={5000000}>5,000,000 shares</option>
                  <option value={10000000}>10,000,000 shares</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!allReqsMet}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 font-bold py-3 rounded-xl transition shadow-lg hover:shadow-indigo-600/10 cursor-pointer text-xs"
              >
                Go Public (Confirm Listing)
              </button>
            </form>
          </div>
        </GlassCard>
      ) : (
        /* Listed Company controls */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard
            glowColor="indigo"
            className="p-5 flex flex-col justify-between"
            hoverable={false}
          >
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight leading-tight">
                Listed Corporation Info
              </h3>
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block mt-1">
                Ticker: {playerCompanyStock?.ticker}
              </span>
              <p className="text-slate-400 text-xs mt-4">
                Your outstanding shares are active in the local trading pool.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 text-xs font-semibold text-slate-400">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider">
                  Trading Price
                </span>
                <span className="text-white font-extrabold text-sm">
                  {formatMoney(playerCompanyStock?.currentPrice || 0)}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider">
                  Market Float
                </span>
                <span className="text-white font-bold">
                  {formatNumber(playerCompanyStock?.totalShares || 0)} shs
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider">
                  Ownership Rate
                </span>
                <span className="text-white font-bold">
                  {playerCompanyStock
                    ? (
                        (playerCompanyStock.playerShares /
                          playerCompanyStock.totalShares) *
                        100
                      ).toFixed(0)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            className="p-5 flex flex-col justify-between"
            hoverable={false}
          >
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight leading-tight">
                Securities Actions
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Declare dividend payments or repurchase float shares.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                  Dividend Payout Rate
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step={0.1}
                    value={player.dividendRate}
                    onChange={(e) =>
                      adjustDividends(
                        Math.max(0, parseFloat(e.target.value) || 0),
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 text-center"
                  />

                  <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                    $/share
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                  Share Buybacks
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => buyBackShares(100000)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg cursor-pointer transition w-full"
                  >
                    Buyback 100K shs
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Stock Exchange marketplace */}
      <div className="space-y-4 pt-6">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Stock Market Directory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stocks.map((stock) => {
            const pctChange = stock.dailyGain;
            const isPositive = pctChange >= 0;
            const size = stock.priceHistory.length;

            // Prepare sparkline chart data format
            const sparkData = stock.priceHistory.map((val, i) => ({ val }));

            // Manage local shares trade state
            const val = tradeShares[stock.ticker] || 100;

            return (
              <GlassCard
                key={stock.ticker}
                hoverable={false}
                className="p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-base leading-tight tracking-tight">
                        {stock.ticker} - {stock.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                        {stock.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-white font-extrabold text-base block">
                        {formatMoney(stock.currentPrice)}
                      </span>
                      <span
                        className={`text-[10px] font-bold flex items-center justify-end gap-0.5 mt-0.5 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatPercent(pctChange)}
                      </span>
                    </div>
                  </div>

                  {/* Sparkline chart */}
                  <div className="h-16 w-full opacity-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparkData}>
                        <Line
                          type="monotone"
                          dataKey="val"
                          stroke={isPositive ? "#10b981" : "#f43f5e"}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Portfolio Holding */}
                  <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-400">
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">
                        Your Shares
                      </span>
                      <span className="text-white font-extrabold">
                        {formatNumber(stock.playerShares)} shs
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">
                        Securities Value
                      </span>
                      <span className="text-white font-bold">
                        {formatMoney(stock.playerShares * stock.currentPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Buy/Sell form controls */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-800/40">
                    <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl p-1 w-28">
                      <input
                        type="number"
                        min={10}
                        value={val}
                        onChange={(e) =>
                          setTradeShares({
                            ...tradeShares,
                            [stock.ticker]: Math.max(
                              1,
                              parseInt(e.target.value) || 0,
                            ),
                          })
                        }
                        className="w-full bg-transparent border-none text-xs font-bold text-white text-center focus:outline-none"
                      />
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => buyStock(stock.ticker, val)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg cursor-pointer transition shadow-md shadow-indigo-600/10 text-center"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => sellStock(stock.ticker, val)}
                        disabled={stock.playerShares < val}
                        className="bg-slate-850 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-850 disabled:border text-slate-200 text-xs font-bold py-2 rounded-lg border border-slate-750 cursor-pointer transition text-center"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default StockMarket;
