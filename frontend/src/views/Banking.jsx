import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney } from "../utils/format";
import GlassCard from "../components/GlassCard";
import { Landmark, CreditCard, Landmark as BankIcon, ShieldCheck } from "lucide-react";

export const Banking = () => {
  const { player, bank, depositSavings, withdrawSavings, takeLoan, repayLoan } =
    useGameStore();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");

  // Calculate current interest rate for loans based on credit score
  const loanRate = 0.08 + (800 - bank.creditScore) / 10000;

  const handleDeposit = (e) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (!val || val <= 0 || val > player.funds) return;
    depositSavings(val);
    setDepositAmount("");
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (!val || val <= 0 || val > bank.savingsBalance) return;
    withdrawSavings(val);
    setWithdrawAmount("");
  };

  const handleBorrow = (e) => {
    e.preventDefault();
    const val = parseFloat(borrowAmount);
    if (!val || val <= 0 || val > 1000000) return; // Cap loan request at $1M
    takeLoan(val);
    setBorrowAmount("");
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Commercial Financing
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Manage corporate savings reserves, check credit reports, and issue
          liquidity loans.
        </p>
      </div>

      {/* Credit Score & Core Balance metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Balance */}
        <GlassCard className="flex flex-col justify-between" glowColor="none">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Savings Deposit
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {formatMoney(bank.savingsBalance)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <BankIcon className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="text-xs text-slate-400 font-semibold mt-4">
            Yield rate:{" "}
            <span className="text-emerald-400 font-bold">
              {(bank.savingsInterestRate * 100).toFixed(0)}% APY
            </span>{" "}
            paid daily
          </div>
        </GlassCard>

        {/* Credit Rating */}
        <GlassCard className="flex flex-col justify-between" glowColor="none">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Credit Score
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {bank.creditScore}
              </h3>
            </div>
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <CreditCard className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-xs text-slate-400 font-semibold mt-4 flex items-center gap-1.5">
            Rating Status:
            <span
              className={`font-bold ${
                bank.creditScore >= 750
                  ? "text-emerald-400"
                  : bank.creditScore >= 620
                    ? "text-indigo-400"
                    : "text-rose-400"
              }`}
            >
              {bank.creditScore >= 750
                ? "Excellent"
                : bank.creditScore >= 620
                  ? "Fair"
                  : "Subprime"}
            </span>
          </div>
        </GlassCard>

        {/* Total Debt */}
        <GlassCard className="flex flex-col justify-between" glowColor="none">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Outstanding Loans
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {formatMoney(
                  bank.loans.reduce((sum, l) => sum + l.principal, 0),
                )}
              </h3>
            </div>
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
              <Landmark className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-4">
            Total active notes: {bank.loans.length} agreements
          </div>
        </GlassCard>
      </div>

      {/* Savings Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-6 space-y-6" hoverable={false}>
          <h3 className="font-extrabold text-white text-lg tracking-tight">
            Corporate Savings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit Form */}
            <form onSubmit={handleDeposit} className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Deposit Capital
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Deposit
                </button>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setDepositAmount((player.funds * 0.5).toFixed(0))
                  }
                  className="text-[10px] text-indigo-400 font-bold hover:underline"
                >
                  50% Cash
                </button>
                <span className="text-[10px] text-slate-600 font-bold">|</span>
                <button
                  type="button"
                  onClick={() => setDepositAmount(player.funds.toFixed(0))}
                  className="text-[10px] text-indigo-400 font-bold hover:underline"
                >
                  Max Cash
                </button>
              </div>
            </form>

            {/* Withdraw Form */}
            <form onSubmit={handleWithdraw} className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Withdraw Capital
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Withdraw
                </button>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setWithdrawAmount((bank.savingsBalance * 0.5).toFixed(0))
                  }
                  className="text-[10px] text-indigo-400 font-bold hover:underline"
                >
                  50% Save
                </button>
                <span className="text-[10px] text-slate-600 font-bold">|</span>
                <button
                  type="button"
                  onClick={() =>
                    setWithdrawAmount(bank.savingsBalance.toFixed(0))
                  }
                  className="text-[10px] text-indigo-400 font-bold hover:underline"
                >
                  Max Save
                </button>
              </div>
            </form>
          </div>
        </GlassCard>

        {/* Financing Loans Request */}
        <GlassCard className="p-6 space-y-6" hoverable={false}>
          <h3 className="font-extrabold text-white text-lg tracking-tight">
            Financing Desk
          </h3>
          <form onSubmit={handleBorrow} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Loan Principal Requested
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="Amount (e.g. 50000)"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
                />

                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-5 rounded-xl transition shadow-lg shadow-rose-600/10 cursor-pointer text-xs"
                >
                  Disburse
                </button>
              </div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Interest Offer Rate:</span>
              <span className="text-rose-400 font-extrabold">
                {(loanRate * 100).toFixed(2)}% APR
              </span>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Active Borrowing Liabilities List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Active Borrowing Liabilities
        </h3>
        {bank.loans.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-slate-800/40 border-dashed">
            <ShieldCheck className="w-10 h-10 text-emerald-500/80 mx-auto mb-4" />
            <h3 className="text-slate-300 font-bold text-base">
              No Outstanding Debt
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Corporate liabilities sheet is clean.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bank.loans.map((loan) => (
              <GlassCard
                key={loan.id}
                hoverable={false}
                className="p-5 flex flex-col justify-between border-rose-500/10"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Remaining Debt
                      </span>
                      <h4 className="text-lg font-extrabold text-white">
                        {formatMoney(loan.principal)}
                      </h4>
                    </div>
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {(loan.interestRate * 100).toFixed(1)}% APR
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">
                        Daily Payment
                      </span>
                      <span className="text-white font-extrabold">
                        {formatMoney(loan.monthlyPayment / 30)}/d
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">
                        Payments Left
                      </span>
                      <span className="text-white font-bold">
                        {loan.remainingTerm} ticks
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-800/40">
                    <button
                      onClick={() =>
                        repayLoan(
                          loan.id,
                          Math.min(player.funds, loan.principal),
                        )
                      }
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-lg transition cursor-pointer shadow-md shadow-emerald-600/10"
                    >
                      Pay Off Total
                    </button>
                    <button
                      onClick={() =>
                        repayLoan(
                          loan.id,
                          Math.min(
                            player.funds,
                            Math.round(loan.principal * 0.25),
                          ),
                        )
                      }
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      Pay 25%
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Banking;
