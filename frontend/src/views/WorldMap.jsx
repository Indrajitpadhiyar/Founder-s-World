import React from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney } from "../utils/format";
import GlassCard from "../components/GlassCard";
import { Lock, ShieldCheck, Building, Factory } from "lucide-react";

export const WorldMap = () => {
  const { player, countries, businesses, factories, unlockCountry } =
    useGameStore();

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Global Market Expansion
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Obtain trading licenses in international territories, utilizing tax
          rates and local supply advantages.
        </p>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => {
          const activeBiz = businesses.filter(
            (b) => b.countryId === country.id,
          );
          const activeFac = factories.filter((f) => f.countryId === country.id);
          const isAffordable = player.funds >= country.unlockCost;

          return (
            <GlassCard
              key={country.id}
              className={`p-6 flex flex-col justify-between overflow-hidden relative ${
                country.unlocked
                  ? "border-emerald-500/20"
                  : "border-slate-800/40"
              }`}
              glowColor={country.unlocked ? "emerald" : "none"}
              hoverable
            >
              {/* Blur backdrop overlay if locked */}
              {!country.unlocked && (
                <div className="absolute top-4 right-4 bg-slate-950/80 border border-slate-850 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" /> Locked
                </div>
              )}
              {country.unlocked && (
                <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Licensed
                </div>
              )}

              <div className="space-y-6">
                {/* Meta */}
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{country.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-white text-lg tracking-tight leading-tight">
                      {country.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Region ID: {country.id}
                    </span>
                  </div>
                </div>

                {/* Economics Multipliers */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-400">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider mb-1">
                      Corporate Tax
                    </span>
                    <span className="text-white">
                      {(country.taxRate * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider mb-1">
                      Labor Factor
                    </span>
                    <span
                      className={
                        country.laborCostFactor < 1
                          ? "text-emerald-400"
                          : "text-slate-300"
                      }
                    >
                      {country.laborCostFactor.toFixed(1)}x
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider mb-1">
                      Raw Factor
                    </span>
                    <span
                      className={
                        country.rawMaterialCostFactor < 1
                          ? "text-emerald-400"
                          : "text-slate-300"
                      }
                    >
                      {country.rawMaterialCostFactor.toFixed(1)}x
                    </span>
                  </div>
                </div>

                {/* Active Infrastructure */}
                {country.unlocked && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                      Local Assets
                    </span>
                    <div className="flex gap-4 text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-400" />{" "}
                        {activeBiz.length} Branches
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Factory className="w-3.5 h-3.5 text-indigo-400" />{" "}
                        {activeFac.length} Plants
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Unlock Footer */}
              {!country.unlocked && (
                <div className="mt-8 pt-4 border-t border-slate-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                      License Cost
                    </span>
                    <span className="text-white text-xs font-extrabold">
                      {formatMoney(country.unlockCost)}
                    </span>
                  </div>

                  <button
                    onClick={() => unlockCountry(country.id)}
                    disabled={!isAffordable}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-850 disabled:border text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition shadow-md shadow-indigo-600/10"
                  >
                    Unlock Market
                  </button>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
export default WorldMap;
