import React from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney } from "../utils/format";
import GlassCard from "../components/GlassCard";
import { Megaphone, Search, Users, Tv, Sparkles } from "lucide-react";

const CAMPAIGNS = [
  {
    id: "google",
    name: "Google Search Ads",
    cost: 1000,
    boost: 8,
    description: "Pay-per-click ads for search queries.",
    icon: Search,
  },
  {
    id: "social",
    name: "Social Media Blast",
    cost: 5000,
    boost: 35,
    description: "Viral campaign across major digital channels.",
    icon: Users,
  },
  {
    id: "billboard",
    name: "Metro Billboards",
    cost: 20000,
    boost: 120,
    description: "High-visibility physical advertisements.",
    icon: Tv,
  },
  {
    id: "influencer",
    name: "Celebrity Endorsement",
    cost: 75000,
    boost: 400,
    description: "A globally recognized icon promotes your brand.",
    icon: Sparkles,
  },
];

export const Marketing = () => {
  const { player, products, runMarketingCampaign } = useGameStore();

  const activeProducts = products.filter((p) => p.status === "Selling");

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Marketing Center
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Deploy corporate ad budgets, boost brand awareness, and accelerate
          consumer traffic.
        </p>
      </div>

      {activeProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-slate-800/40 border-dashed">
          <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-slate-300 font-bold text-lg">
            No Marketable Products
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Activate the "Selling" status on developed products to enable
            advertising operations.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {activeProducts.map((product) => (
            <GlassCard key={product.id} hoverable={false} className="p-6">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                {/* Product Meta */}
                <div className="space-y-1 md:w-80 shrink-0">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Product Target
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight tracking-tight">
                    {product.name}
                  </h3>
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    {product.brand} • Brand Score: {product.marketingScore}%
                  </span>
                  <div className="w-full h-1.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
                      style={{ width: `${product.marketingScore}%` }}
                    />
                  </div>
                </div>

                {/* Campaign Selection Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {CAMPAIGNS.map((camp) => {
                    const Icon = camp.icon;
                    const canAfford = player.funds >= camp.cost;

                    return (
                      <div
                        key={camp.id}
                        className="bg-slate-950/60 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-indigo-400" />
                            <h4 className="font-bold text-sm text-slate-200">
                              {camp.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            {camp.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-900/60">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                              Cost
                            </span>
                            <span className="text-xs text-white font-extrabold">
                              {formatMoney(camp.cost)}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              runMarketingCampaign(product.id, camp.cost)
                            }
                            disabled={!canAfford}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-850 disabled:border text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition shadow-md shadow-indigo-600/10"
                          >
                            Deploy
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
export default Marketing;
