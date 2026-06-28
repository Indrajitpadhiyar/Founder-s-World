import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import GlassCard from "../components/GlassCard";
import { FlaskConical, CheckCircle2, Lock } from "lucide-react";

export const Research = () => {
  const { player, techTree, researchTech } = useGameStore();
  const [activeTab, setActiveTab] = useState("All");

  const filteredTree = techTree.filter((node) => {
    if (activeTab === "All") return true;
    return node.category === activeTab;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case "Automation":
        return "text-cyan-400 bg-cyan-950/40 border-cyan-900";
      case "Marketing":
        return "text-pink-400 bg-pink-950/40 border-pink-900";
      case "Quality":
        return "text-emerald-400 bg-emerald-950/40 border-emerald-900";
      case "Finance":
        return "text-amber-400 bg-amber-950/40 border-amber-900";
      case "Production":
      default:
        return "text-purple-400 bg-purple-950/40 border-purple-900";
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            R&D Laboratories
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Spend tech points accumulated by your R&D workforce to patent
            efficiency breakthroughs.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
          <FlaskConical className="w-5 h-5 text-cyan-400" />
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
              Available Tech Points
            </span>
            <span className="text-cyan-400 font-extrabold text-sm">
              {player.techPoints.toFixed(1)} TP
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/40 pb-4">
        {[
          "All",
          "Automation",
          "Marketing",
          "Quality",
          "Finance",
          "Production",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTree.map((node) => {
          const canResearch = player.techPoints >= node.cost;

          return (
            <GlassCard
              key={node.id}
              className={`p-6 flex flex-col justify-between ${
                node.unlocked ? "border-emerald-500/20" : "border-slate-800/40"
              }`}
              glowColor={node.unlocked ? "emerald" : "none"}
              hoverable
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryColor(node.category)}`}
                  >
                    {node.category}
                  </span>
                  {node.unlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-base leading-tight tracking-tight">
                    {node.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-normal">
                    {node.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                    Research Cost
                  </span>
                  <span className="text-white text-xs font-extrabold">
                    {node.cost} Tech Points
                  </span>
                </div>

                {!node.unlocked && (
                  <button
                    onClick={() => researchTech(node.id)}
                    disabled={!canResearch}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-850 disabled:border text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition shadow-md shadow-indigo-600/10"
                  >
                    Research
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
export default Research;
