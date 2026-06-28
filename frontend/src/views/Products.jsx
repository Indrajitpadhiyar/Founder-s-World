import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney, formatNumber } from "../utils/format";
import GlassCard from "../components/GlassCard";
import { BUSINESS_TEMPLATES } from "../utils/economy";
import { ShoppingBag, Plus, X, AlertTriangle, Sparkles, Layers, ChevronRight, Settings } from "lucide-react";
import confetti from "canvas-confetti";

const PRODUCT_LOGOS = ["📦", "📱", "💻", "👕", "🍦", "🍕", "🍔", "☕", "💊", "🛠️", "🚗", "🧸", "📚", "💎", "👟", "👜"];

const PACKAGING_OPTIONS = [
  { name: "Simple", cost: 0, qualityBoost: 0 },
  { name: "Eco-friendly", cost: 1, qualityBoost: 5 },
  { name: "Premium", cost: 3, qualityBoost: 15 },
  { name: "Luxury", cost: 10, qualityBoost: 30 }
];

const QUALITY_OPTIONS = [
  { name: "Economy", costMultiplier: 0.6, baseQuality: 30 },
  { name: "Standard", costMultiplier: 1.0, baseQuality: 55 },
  { name: "Premium", costMultiplier: 1.5, baseQuality: 78 },
  { name: "Luxury", costMultiplier: 3.0, baseQuality: 95 }
];

const CUSTOMER_OPTIONS = ["Mass Market", "Niche", "Professionals", "High Net Worth"];

const WAREHOUSE_UPGRADES = [
  { name: "Local Rack", capacity: 100, cost: 0 },
  { name: "Small Warehouse", capacity: 1000, cost: 2500 },
  { name: "Medium Warehouse", capacity: 5000, cost: 10000 },
  { name: "Large Warehouse", capacity: 20000, cost: 35000 }
];

export const Products = () => {
  const {
    player,
    products,
    businesses,
    createProduct,
    updateProductStatus,
    updateProductPrice,
    buyProductInventory,
    upgradeWarehouse,
    addNotification
  } = useGameStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(null);
  const [showBuyStockModal, setShowBuyStockModal] = useState(null);

  // Form States for Custom Product Designer
  const [name, setName] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [category, setCategory] = useState("Consumer Goods");
  const [price, setPrice] = useState(50);
  const [qualityLevel, setQualityLevel] = useState("Standard");
  const [packagingType, setPackagingType] = useState("Simple");
  const [targetCustomer, setTargetCustomer] = useState("Mass Market");
  const [logo, setLogo] = useState("📦");
  const [colorTheme, setColorTheme] = useState("from-indigo-500 to-cyan-500");
  const [marketingBudget, setMarketingBudget] = useState(100);
  const [initialQuantity, setInitialQuantity] = useState(50);
  const [buyAmount, setBuyAmount] = useState(100);

  const openModal = () => {
    if (businesses.length > 0 && !businessId) {
      setBusinessId(businesses[0]?.id || "");
    }
    setShowCreateModal(true);
  };

  const selectedBiz = businesses.find((b) => b.id === businessId);
  const selectedType = selectedBiz?.type || "Tea Stall";
  const selectedCategory = selectedBiz?.category || "Food Business";
  
  // Dynamic cost calculations based on selected business type template
  const template = BUSINESS_TEMPLATES[selectedCategory]?.[selectedType] || { basePrice: 10, rawCost: 3 };
  
  const qualitySpec = QUALITY_OPTIONS.find(q => q.name === qualityLevel) || QUALITY_OPTIONS[1];
  const packagingSpec = PACKAGING_OPTIONS.find(p => p.name === packagingType) || PACKAGING_OPTIONS[0];

  const rawManufacturingCost = Math.round(template.rawCost * qualitySpec.costMultiplier + packagingSpec.cost);
  const totalSetupCost = (rawManufacturingCost * initialQuantity) + parseFloat(marketingBudget || 0);

  const handleDevelop = (e) => {
    e.preventDefault();
    if (!name.trim() || !businessId) return;

    if (player.funds < totalSetupCost) {
      addNotification("Launch Failed", "Inadequate balance to fund this product launch and initial production batch.", "error");
      return;
    }

    const calculatedQuality = Math.min(100, qualitySpec.baseQuality + packagingSpec.qualityBoost);

    createProduct(
      name,
      category,
      selectedBiz?.name || "Generic",
      price,
      rawManufacturingCost,
      calculatedQuality,
      packagingType,
      targetCustomer,
      parseFloat(marketingBudget || 0),
      parseInt(initialQuantity || 0),
      businessId
    );

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 }
    });

    setName("");
    setShowCreateModal(false);
  };

  const isWarehouseUnlocked = player.netWorth >= 25000;
  const isInventoryLocked = player.netWorth < 500;

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Product Development
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Build inventory lines, adjust pricing schemas, and trace profit margins.
          </p>
        </div>
        <button
          onClick={openModal}
          disabled={businesses.length === 0}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Develop Product
        </button>
      </div>

      {businesses.length === 0 && (
        <div className="p-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5" />
          <span>
            You must create a business division before developing consumer products.
          </span>
        </div>
      )}

      {isInventoryLocked && (
        <div className="p-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <Sparkles className="w-5 h-5 shrink-0 animate-pulse" />
          <span>
            <strong>Auto-Manufacturing Active</strong>: Inventory management is currently locked (Unlocks at $500). Goods are auto-produced on sale, directly deducting the manufacturing cost from cash flow.
          </span>
        </div>
      )}

      {/* Product List */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-slate-800/40 border-dashed">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-slate-300 font-bold text-lg">
            No Products Created
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Develop custom goods to begin trading.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => {
            const biz = businesses.find((b) => b.id === product.businessId);
            const profitPerUnit = product.price - product.manufacturingCost;
            const currentLimit = isWarehouseUnlocked ? product.maxInventory : 100;
            
            return (
              <GlassCard
                key={product.id}
                className="p-6 relative group overflow-hidden"
                hoverable={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                  {/* Metadata */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase bg-indigo-950/40 border border-indigo-900 px-2.5 py-0.5 rounded-full">
                      {product.sku}
                    </span>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      {product.name}
                    </h3>
                    <div className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                      <span>{product.category}</span>
                      <span>•</span>
                      <span className="text-indigo-400">
                        {biz?.name || "Division"}
                      </span>
                    </div>
                    {product.quality && (
                      <div className="text-[10px] text-slate-400 font-semibold">
                        Quality: <span className="text-emerald-400">{product.quality}/100</span> | Packaging: <span className="text-slate-200">{product.packaging || "Simple"}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Stats */}
                  <div className="grid grid-cols-3 gap-4 lg:col-span-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Price Settings
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) =>
                            updateProductPrice(
                              product.id,
                              Math.max(1, parseFloat(e.target.value) || 0),
                            )
                          }
                          className="w-20 bg-slate-950 border border-slate-800/80 rounded px-1.5 py-0.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Cost Basis
                      </span>
                      <span className="text-sm font-bold text-slate-400 block mt-1">
                        {formatMoney(product.manufacturingCost)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Net Profit/Unit
                      </span>
                      <span
                        className={`text-sm font-extrabold block mt-1 ${
                          profitPerUnit >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {formatMoney(profitPerUnit)}
                      </span>
                    </div>
                  </div>

                  {/* Operations Toggles */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6">
                    {/* Inventory */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Stock Inventory
                      </span>
                      <span className="text-sm text-white font-extrabold mt-1 block">
                        {isInventoryLocked ? "Unlimited (Auto)" : `${formatNumber(product.inventory)} / ${formatNumber(currentLimit)}`}
                      </span>
                    </div>

                    {/* Status & Restock Select */}
                    <div className="flex items-center gap-2">
                      <select
                        value={product.status}
                        onChange={(e) =>
                          updateProductStatus(product.id, e.target.value)
                        }
                        className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Selling">Selling</option>
                        <option value="Paused">Paused</option>
                        <option value="Discontinued">Discontinued</option>
                      </select>

                      {!isInventoryLocked && (
                        <button
                          onClick={() => setShowBuyStockModal(product)}
                          className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-2.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                          title="Restock Inventory"
                        >
                          Restock
                        </button>
                      )}

                      {isWarehouseUnlocked && !isInventoryLocked && (
                        <button
                          onClick={() => setShowWarehouseModal(product)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 p-2 rounded-xl transition cursor-pointer"
                          title="Warehouse Upgrades"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Develop Product Modal */}
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
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Custom Product Designer
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Design custom brand items with specific quality grades and packaging types.
              </p>
            </div>

            <form onSubmit={handleDevelop} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Brand / Division */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Brand Division
                  </label>
                  <select
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Blend Cafe, Cotton Tee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gourmet Coffee, Streetwear"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Target Customers */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Target Customer
                  </label>
                  <select
                    value={targetCustomer}
                    onChange={(e) => setTargetCustomer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  >
                    {CUSTOMER_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quality Grade */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Quality Level
                  </label>
                  <select
                    value={qualityLevel}
                    onChange={(e) => setQualityLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  >
                    {QUALITY_OPTIONS.map((q) => (
                      <option key={q.name} value={q.name}>
                        {q.name} ({q.name === "Standard" ? "1.0x" : `${q.costMultiplier}x`} Cost)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Packaging Option */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Packaging Style
                  </label>
                  <select
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  >
                    {PACKAGING_OPTIONS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} (+${p.cost}/unit)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price and initial stock */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={price}
                    onChange={(e) => setPrice(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Initial Stock Run
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={initialQuantity}
                    onChange={(e) => setInitialQuantity(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Ad Launch Budget ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={marketingBudget}
                    onChange={(e) => setMarketingBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Budget Estimation Banner */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                    Est. Mfg Cost/Unit
                  </span>
                  <span className="font-extrabold text-slate-200">
                    {formatMoney(rawManufacturingCost)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                    Total Launch Capital Required
                  </span>
                  <span className={`font-extrabold ${player.funds >= totalSetupCost ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatMoney(totalSetupCost)}
                  </span>
                </div>
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
                  disabled={player.funds < totalSetupCost}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-650 text-white font-bold py-3 rounded-xl transition shadow-lg hover:shadow-indigo-600/10 cursor-pointer"
                >
                  Launch Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Buy Inventory Modal */}
      {showBuyStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800/80 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowBuyStockModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Order Inventory Batch
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Replenish product stock directly into your warehouse.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Select Order Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 100, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBuyAmount(amt)}
                      className={`py-2 text-xs font-bold border rounded-lg transition cursor-pointer ${buyAmount === amt ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"}`}
                    >
                      {amt} units
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Unit Mfg Cost:</span>
                  <span className="font-semibold text-slate-200">{formatMoney(showBuyStockModal.manufacturingCost)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Order Bill:</span>
                  <span className="font-bold text-emerald-400">{formatMoney(showBuyStockModal.manufacturingCost * buyAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  buyProductInventory(showBuyStockModal.id, buyAmount);
                  setShowBuyStockModal(null);
                }}
                disabled={player.funds < showBuyStockModal.manufacturingCost * buyAmount}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2.5 rounded-xl transition cursor-pointer"
              >
                Confirm Inventory Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Upgrade Modal */}
      {showWarehouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800/80 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowWarehouseModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Warehouse Storage Upgrades
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Increase max inventory capacity for {showWarehouseModal.name}.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {WAREHOUSE_UPGRADES.map((upgrade) => {
                const isCurrent = showWarehouseModal.maxInventory === upgrade.capacity;
                const canAfford = player.funds >= upgrade.cost;
                
                return (
                  <div
                    key={upgrade.name}
                    className={`p-4 rounded-xl border flex items-center justify-between transition ${isCurrent ? "bg-indigo-600/10 border-indigo-500 text-white" : "bg-slate-950 border-slate-850 hover:border-slate-800"}`}
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{upgrade.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Capacity: {formatNumber(upgrade.capacity)} units</p>
                    </div>
                    <div>
                      {isCurrent ? (
                        <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">Active</span>
                      ) : (
                        <button
                          onClick={() => {
                            upgradeWarehouse(showWarehouseModal.id, upgrade.capacity, upgrade.cost);
                            setShowWarehouseModal(null);
                          }}
                          disabled={!canAfford}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition cursor-pointer"
                        >
                          Buy for {formatMoney(upgrade.cost)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
