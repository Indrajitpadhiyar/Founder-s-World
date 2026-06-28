import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney, formatNumber } from "../utils/format";
import GlassCard from "../components/GlassCard";
import {
  Factory as FactoryIcon,
  Plus,
  Settings2,
  Package,
  Zap,
  Cpu,
} from "lucide-react";

export const Factories = () => {
  const {
    player,
    factories,
    products,
    purchaseFactory,
    upgradeFactoryMachines,
    setFactoryProduct,
    buyRawMaterials,
    toggleFactoryQC,
  } = useGameStore();

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("us");

  const handlePurchase = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    purchaseFactory(name, countryId);
    setName("");
    setShowPurchaseModal(false);
  };

  const getCountryName = (cid) => {
    switch (cid) {
      case "cn":
        return "China (🇨🇳)";
      case "de":
        return "Germany (🇩🇪)";
      case "jp":
        return "Japan (🇯🇵)";
      case "br":
        return "Brazil (🇧🇷)";
      case "us":
      default:
        return "United States (🇺🇸)";
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Factories & Logistics
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Build production sites, acquire materials, and optimize
            manufacturing pipelines.
          </p>
        </div>
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Buy Factory Site
        </button>
      </div>

      {/* Factories Grid */}
      {factories.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-slate-800/40 border-dashed">
          <FactoryIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-slate-300 font-bold text-lg">
            No Factories Purchased
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Buy a production facility to assemble raw goods.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {factories.map((factory) => {
            const activeProduct = products.find(
              (p) => p.id === factory.activeProductId,
            );
            const materialPurchaseCost = factory.rawMaterialCost;

            return (
              <GlassCard
                key={factory.id}
                hoverable={false}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                      <FactoryIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-lg tracking-tight">
                        {factory.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-bold">
                        {getCountryName(factory.countryId)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Machinery Level
                    </span>
                    <span className="text-sm text-indigo-400 font-extrabold">
                      Lv. {factory.machineUpgradeLevel}
                    </span>
                  </div>
                </div>

                {/* Production Queue Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-indigo-400" /> Active
                    Assembly Line Product
                  </label>
                  <select
                    value={factory.activeProductId || ""}
                    onChange={(e) =>
                      setFactoryProduct(factory.id, e.target.value || null)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Suspended (Assembly Line Halted)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity & speed metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-400">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">
                      Daily Limit
                    </span>
                    <span className="text-white text-sm font-extrabold">
                      {factory.capacity} units
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">
                      Speed Factor
                    </span>
                    <span className="text-white text-sm font-extrabold">
                      {factory.productionSpeed.toFixed(2)}x
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">
                      Maintenance
                    </span>
                    <span className="text-rose-400 text-sm font-extrabold">
                      {formatMoney(factory.maintenanceCost)}/mo
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">
                      Electricity
                    </span>
                    <span className="text-rose-400 text-sm font-extrabold">
                      {formatMoney(factory.electricityCost)}/mo
                    </span>
                  </div>
                </div>

                {/* Raw materials panel */}
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-indigo-400" />
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                        Raw Material Reserves
                      </span>
                      <span className="text-white font-extrabold text-base">
                        {formatNumber(factory.rawMaterials)} Units
                      </span>
                    </div>
                  </div>

                  {/* Buy Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => buyRawMaterials(factory.id, 100)}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold px-3 py-2 rounded-lg border border-slate-850 cursor-pointer"
                    >
                      +100 ({formatMoney(materialPurchaseCost * 100)})
                    </button>
                    <button
                      onClick={() => buyRawMaterials(factory.id, 500)}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold px-3 py-2 rounded-lg border border-slate-850 cursor-pointer"
                    >
                      +500 ({formatMoney(materialPurchaseCost * 500)})
                    </button>
                  </div>
                </div>

                {/* Footer Upgrades */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/40">
                  <button
                    onClick={() => upgradeFactoryMachines(factory.id)}
                    className="flex items-center justify-center gap-2 py-3 bg-indigo-950/20 hover:bg-indigo-950/30 text-indigo-400 border border-indigo-900 rounded-xl text-xs font-bold cursor-pointer transition"
                    title="Spend $50K to add Lv. Upgrade"
                  >
                    <Cpu className="w-4 h-4" /> Upgrade Tooling ($50K)
                  </button>

                  <button
                    onClick={() => toggleFactoryQC(factory.id)}
                    className={`flex items-center justify-center gap-2 py-3 border rounded-xl text-xs font-bold cursor-pointer transition ${
                      factory.qualityControlActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-850"
                    }`}
                  >
                    <Zap className="w-4 h-4" /> Quality Control (QC){" "}
                    {factory.qualityControlActive ? "ON" : "OFF"}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Buy Factory Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800/80 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Acquire Manufacturing Site
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Deploy capital to purchase a heavy assembly plant.
              </p>
            </div>

            <form onSubmit={handlePurchase} className="space-y-4">
              {/* Factory Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Facility Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gigafactory Texas, Shenzhen Plant"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Country select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Host Country
                </label>
                <select
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="us">United States (🇺🇸)</option>
                  <option value="cn">China (🇨🇳)</option>
                  <option value="de">Germany (🇩🇪)</option>
                  <option value="jp">Japan (🇯🇵)</option>
                  <option value="br">Brazil (🇧🇷)</option>
                </select>
              </div>

              {/* Cost Basis Banner */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                    Required Capital
                  </span>
                  <span className="text-white font-extrabold text-base">
                    {formatMoney(250000)}
                  </span>
                </div>
                {player.funds >= 250000 ? (
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Funded
                  </span>
                ) : (
                  <span className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Short $250K
                  </span>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={player.funds < 250000}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-650 text-white font-bold py-3 rounded-xl transition shadow-lg hover:shadow-indigo-600/10 cursor-pointer"
                >
                  Confirm Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Factories;
