import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney } from "../utils/format";
import GlassCard from "../components/GlassCard";
import { BUSINESS_TEMPLATES } from "../utils/economy";
import { Building2, Plus, Star, MapPin, X, AlertTriangle, TrendingUp, ShieldAlert, Zap } from "lucide-react";

const LOGOS = [
  "💼", "☕", "🍔", "👔", "📱", "💻", "🎮", "🚗",
  "💊", "⚡", "🏗️", "📦", "🌾", "🌱", "👕", "🍦",
  "🍕", "🍩", "🛠️", "🧹", "🛍️", "🚢", "🧠", "💡"
];

const COLORS = [
  "from-indigo-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-purple-500 to-indigo-500",
  "from-cyan-500 to-blue-500",
];

export const Businesses = () => {
  const { player, businesses, createBusiness, deleteBusiness } = useGameStore();

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [selectedLogo, setSelectedLogo] = useState(LOGOS[0] || "💼");
  const [selectedColor, setSelectedColor] = useState(COLORS[0] || "from-indigo-500 to-cyan-500");
  const [selectedCategory, setSelectedCategory] = useState("Food Business");
  const [selectedType, setSelectedType] = useState("Tea Stall");
  const [countryId, setCountryId] = useState("us"); // default US

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const types = Object.keys(BUSINESS_TEMPLATES[cat] || {});
    if (types.length > 0) {
      setSelectedType(types[0]);
    }
  };

  const template = BUSINESS_TEMPLATES[selectedCategory]?.[selectedType];
  const launchCost = template ? template.startupCost : 100;
  const isMultiBusinessLocked = businesses.length >= 1 && player.netWorth < 500000;

  const handleLaunch = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createBusiness(name, selectedLogo, selectedColor, selectedCategory, selectedType, countryId);
    setName("");
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Business Divisions
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Establish, analyze, and expand corporate branches globally.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isMultiBusinessLocked}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Launch Division
        </button>
      </div>

      {isMultiBusinessLocked && (
        <div className="p-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            Multiple businesses locked. Reach a net worth of <strong>$500,000</strong> to unlock managing multiple branches!
          </span>
        </div>
      )}

      {/* Grid List */}
      {businesses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-slate-800/40 border-dashed">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-slate-300 font-bold text-lg">
            No Active Divisions
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Launch your first branch to begin operations! Since you start with $100, try a micro-business like a Tea Stall or Cleaning Service.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-5 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            Launch Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => (
            <GlassCard
              key={biz.id}
              className="relative flex flex-col justify-between group overflow-hidden"
            >
              {/* Delete Button */}
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Dissolve ${biz.name}? All subsidiary products will be permanently discontinued!`,
                    )
                  ) {
                    deleteBusiness(biz.id);
                  }
                }}
                className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/40 transition cursor-pointer"
                title="Dissolve Branch"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Card Header */}
              <div>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${biz.brandColor} flex items-center justify-center text-3xl shadow-lg`}
                  >
                    {biz.logo}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg leading-tight tracking-tight">
                      {biz.name}
                    </h3>
                    <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-0.5 block">
                      {biz.type || biz.industry}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="uppercase">{biz.countryId}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500/80 text-amber-500/80" />
                    <span>{biz.rating.toFixed(1)} / 5</span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs mt-3 italic font-medium">
                  "{biz.description}"
                </p>

                {/* Division Info Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/20 text-[10px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>Margin: <strong className="text-slate-200">{biz.profitMargin}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>Risk: <strong className="text-slate-200">{biz.risk}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-400" />
                    <span>Comp: <strong className="text-slate-200">{biz.competition}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>Growth: <strong className="text-slate-200">{biz.growth}</strong></span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mt-6 pt-4 border-t border-slate-800/40 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Reputation
                  </span>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                      style={{ width: `${biz.reputation}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 block">
                    {biz.reputation.toFixed(0)}/100
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Value
                  </span>
                  <span className="text-sm text-white font-extrabold block mt-1">
                    {formatMoney(biz.businessValue)}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Launch Business Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800/80 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Launch New Division
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Scaffold a brand branch into a global industry.
              </p>
            </div>

            <form onSubmit={handleLaunch} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Division Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Cafe, Byte Software"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Logo Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Brand Logo
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-850">
                  {LOGOS.map((logo) => (
                    <button
                      key={logo}
                      type="button"
                      onClick={() => setSelectedLogo(logo)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition border cursor-pointer ${
                        selectedLogo === logo
                          ? "bg-indigo-600 border-indigo-500"
                          : "bg-slate-950 border-slate-850 hover:border-slate-700"
                      }`}
                    >
                      {logo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Brand Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-tr ${color} border transition cursor-pointer ${
                        selectedColor === color
                          ? "border-white scale-110"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Category & Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500 transition"
                  >
                    {Object.keys(BUSINESS_TEMPLATES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Business Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500 transition"
                  >
                    {Object.keys(BUSINESS_TEMPLATES[selectedCategory] || {}).map((type) => (
                      <option key={type} value={type}>
                        {type} (${BUSINESS_TEMPLATES[selectedCategory][type].startupCost})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* HQ Country */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  HQ Country
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

              {/* Template Specs */}
              {template && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-400">
                  <div>Margin: <span className="text-emerald-400">{template.margin}</span></div>
                  <div>Risk: <span className="text-slate-200">{template.risk}</span></div>
                  <div>Comp: <span className="text-slate-200">{template.comp}</span></div>
                  <div>Growth: <span className="text-cyan-400">{template.growth}</span></div>
                  <div className="col-span-2">Base Price: <span className="text-slate-200">${template.basePrice}</span></div>
                </div>
              )}

              {/* Registration Fee */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                    Registration Fee
                  </span>
                  <span className="text-white font-extrabold text-base">
                    {formatMoney(launchCost)}
                  </span>
                </div>
                {player.funds >= launchCost ? (
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Approved
                  </span>
                ) : (
                  <span className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Inadequate Balance
                  </span>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={player.funds < launchCost}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3 rounded-xl transition shadow-lg hover:shadow-indigo-600/10 cursor-pointer"
                >
                  Launch Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Businesses;
