import React from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney, formatNumber } from "../utils/format";
import GlassCard from "../components/GlassCard";
import { Award, CheckCircle2, Star, Coins } from "lucide-react";

export const Missions = () => {
  const { missions } = useGameStore();

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Corporate Achievements
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Reach strategic targets to claim corporate funding rewards and boost
          industry reputation.
        </p>
      </div>

      {/* Grid of Missions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {missions.map((mission) => {
          const progress = Math.min(
            100,
            Math.max(0, (mission.currentValue / mission.targetValue) * 100),
          );

          return (
            <GlassCard
              key={mission.id}
              className={`p-6 flex flex-col justify-between overflow-hidden relative ${
                mission.completed
                  ? "border-emerald-500/20"
                  : "border-slate-800/40"
              }`}
              glowColor={mission.completed ? "emerald" : "none"}
              hoverable
            >
              {mission.completed && (
                <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award
                    className={`w-8 h-8 ${mission.completed ? "text-emerald-400" : "text-slate-500"}`}
                  />
                  <div>
                    <h3 className="font-extrabold text-white text-base tracking-tight leading-tight">
                      {mission.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {mission.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>
                      Progress: {formatNumber(mission.currentValue)} /{" "}
                      {formatNumber(mission.targetValue)}
                    </span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-850 p-[1px] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        mission.completed ? "bg-emerald-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Rewards */}
              <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-bold text-slate-200">
                    <Coins className="w-4 h-4 text-amber-400" /> +
                    {formatMoney(mission.rewardMoney)}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-indigo-400">
                    <Star className="w-4 h-4 text-indigo-400" /> +
                    {mission.rewardReputation} Rep
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
export default Missions;
