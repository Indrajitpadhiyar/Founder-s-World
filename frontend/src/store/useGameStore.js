import { create } from 'zustand';
import { calculateDemand, calculateDailySales, tickStockPrice, POTENTIAL_EVENTS, INDUSTRY_PARAMS, BUSINESS_TEMPLATES } from '../utils/economy';

const INITIAL_COUNTRIES = [
  { id: 'in', name: 'India', flag: 'IN', taxRate: 0.25, laborCostFactor: 0.65, rawMaterialCostFactor: 0.75, unlocked: true, unlockCost: 0 },
  { id: 'us', name: 'United States', flag: '🇺🇸', taxRate: 0.21, laborCostFactor: 1.0, rawMaterialCostFactor: 1.0, unlocked: true, unlockCost: 0 },
  { id: 'cn', name: 'China', flag: '🇨🇳', taxRate: 0.15, laborCostFactor: 0.5, rawMaterialCostFactor: 0.7, unlocked: false, unlockCost: 100000 },
  { id: 'de', name: 'Germany', flag: '🇩🇪', taxRate: 0.3, laborCostFactor: 1.2, rawMaterialCostFactor: 1.1, unlocked: false, unlockCost: 250000 },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', taxRate: 0.23, laborCostFactor: 0.9, rawMaterialCostFactor: 1.2, unlocked: false, unlockCost: 200000 },
  { id: 'br', name: 'Brazil', flag: '🇧🇷', taxRate: 0.18, laborCostFactor: 0.6, rawMaterialCostFactor: 0.8, unlocked: false, unlockCost: 75000 },
];

const INITIAL_TECH_TREE = [
  { id: 'adv_mkt', title: 'Viral Marketing', description: 'Increases brand awareness marketing power by 25%.', cost: 10, unlocked: false, category: 'Marketing', dependencies: [], effect: { type: 'marketing_multiplier', value: 1.25 } },
  { id: 'factory_auto', title: 'Assembly Automation', description: 'Increases factory speed by 30% and reduces workforce cost by 15%.', cost: 20, unlocked: false, category: 'Automation', dependencies: [], effect: { type: 'production_speed', value: 1.3 } },
  { id: 'quality_circle', title: 'Six Sigma', description: 'Boosts overall product quality by 15 points.', cost: 15, unlocked: false, category: 'Quality', dependencies: [], effect: { type: 'product_quality', value: 15 } },
  { id: 'cheap_raw', title: 'Bulk Contracts', description: 'Reduces raw materials purchase cost by 20%.', cost: 25, unlocked: false, category: 'Production', dependencies: [], effect: { type: 'raw_material_cost', value: 0.8 } },
  { id: 'tax_loopholes', title: 'Offshore Accounting', description: 'Reduces all business tax rates by 5%.', cost: 30, unlocked: false, category: 'Finance', dependencies: [], effect: { type: 'tax_multiplier', value: 0.95 } },
];

const INITIAL_STOCKS = [
  { ticker: 'PEAR', name: 'Pear Inc. (Electronics)', currentPrice: 150, priceHistory: [148, 149, 150], marketCap: 1500000000, peRatio: 28, volume: 500000, high52: 180, low52: 120, dailyGain: 0.005, totalShares: 10000000, playerShares: 0, dividendYield: 0.015, revenue: 50000000, profit: 12000000, description: 'Premium smartphone and computer hardware manufacturer.' },
  { ticker: 'VOLT', name: 'Volt Motors (Automotive)', currentPrice: 85, priceHistory: [88, 86, 85], marketCap: 850000000, peRatio: 40, volume: 800000, high52: 120, low52: 60, dailyGain: -0.01, totalShares: 10000000, playerShares: 0, dividendYield: 0.0, revenue: 30000000, profit: 2000000, description: 'Innovative electric cars and solar roof tiles.' },
  { ticker: 'SOFT', name: 'Microhard Corp. (Software)', currentPrice: 310, priceHistory: [308, 309, 310], marketCap: 3100000000, peRatio: 32, volume: 400000, high52: 340, low52: 270, dailyGain: 0.003, totalShares: 10000000, playerShares: 0, dividendYield: 0.02, revenue: 80000000, profit: 25000000, description: 'Global operating systems, enterprise cloud, and database infrastructure provider.' },
  { ticker: 'CHIP', name: 'Alphachip (Biotech)', currentPrice: 45, priceHistory: [40, 42, 45], marketCap: 225000000, peRatio: 18, volume: 1200000, high52: 55, low52: 30, dailyGain: 0.07, totalShares: 5000000, playerShares: 0, dividendYield: 0.005, revenue: 15000000, profit: 3000000, description: 'Leading genetic engineering and bio-informatics processor manufacturer.' },
];

const INITIAL_MISSIONS = [
  { id: '1', title: 'Open First Branch', description: 'Create your first business branch in any sector.', rewardMoney: 5000, rewardReputation: 5, targetType: 'revenue', targetValue: 1, currentValue: 0, completed: false },
  { id: '2', title: 'Earning Stream', description: 'Reach a net worth of $50,000.', rewardMoney: 15000, rewardReputation: 10, targetType: 'networth', targetValue: 50000, currentValue: 10000, completed: false },
  { id: '3', title: 'Launch 5 Products', description: 'Launch 5 products in the selling status.', rewardMoney: 25000, rewardReputation: 15, targetType: 'products_launched', targetValue: 5, currentValue: 0, completed: false },
  { id: '4', title: 'IPO Listing Audit', description: 'Accumulate a corporate net worth of $100 Million to prepare for listing.', rewardMoney: 1000000, rewardReputation: 30, targetType: 'networth', targetValue: 100000000, currentValue: 10000, completed: false },
];

export const useGameStore = create((set, get) => ({
  // Navigation
  currentTab: 'Overview',
  setCurrentTab: (tab) => set({ currentTab: tab }),

  // Game Loop Speed
  speed: 1,
  setSpeed: (speed) => set((state) => ({ speed, player: { ...state.player, speed } })),
  daysSimulated: 0,
  lastTickTime: Date.now(),
  lastSaveTime: Date.now(),
  lastDividendPaidMonth: 0,

  // Notifications Feed
  notifications: [],
  addNotification: (title, message, type) => set((state) => ({
    notifications: [
      {
        id: Math.random().toString(),
        title,
        message,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...state.notifications.slice(0, 49),
    ],
  })),
  clearNotifications: () => set({ notifications: [] }),

  // Authentication State
  isAuthenticated: false,
  token: localStorage.getItem('biz_empire_token') || null,
  user: null,

  // States
  player: {
    funds: 100,
    reputation: 10,
    netWorth: 100,
    netWorthHistory: [100],
    techPoints: 0,
    ipoUnlocked: false,
    isIpoCompleted: false,
    sharesOutstanding: 0,
    dividendRate: 0,
    daysSimulated: 0,
    speed: 1,
  },
  businesses: [],
  products: [],
  factories: [],
  employees: [],
  stocks: INITIAL_STOCKS,
  bank: {
    savingsBalance: 0,
    savingsInterestRate: 0.03, // 3%
    creditScore: 650,
    loans: [],
  },
  techTree: INITIAL_TECH_TREE,
  missions: INITIAL_MISSIONS,
  activeEvents: [],
  economyPhase: 'Normal',
  countries: INITIAL_COUNTRIES,
  needsOnboarding: false,
  homeLocation: null,

  // Actions - Authentication
  login: async (email, password) => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }
      
      const { accessToken, user } = data.data;
      localStorage.setItem('biz_empire_token', accessToken);
      set({
        token: accessToken,
        isAuthenticated: true,
        user
      });
      
      await get().loadGame();
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  signup: async (username, email, password) => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      const success = await get().login(email, password);
      if (success) {
        set({
          currentTab: 'World Map',
          needsOnboarding: true,
          homeLocation: null,
        });
      }
      return success;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem('biz_empire_token');
    localStorage.removeItem('biz_empire_save');
    set({
      token: null,
      isAuthenticated: false,
      user: null
    });
    get().resetGame();
  },

  // Actions - Initialization
  initializeGame: () => {
    get().loadGame();
  },

  // Actions - Businesses
  createBusiness: (name, logo, brandColor, category, type, countryId) => {
    // 1. Enforce business limit below $500,000
    if (get().businesses.length >= 1 && get().player.netWorth < 500000) {
      get().addNotification(
        'Launch Blocked',
        'Launching multiple divisions requires a net worth of $500,000.',
        'error'
      );
      return;
    }

    const template = BUSINESS_TEMPLATES[category]?.[type];
    const costToStart = template ? template.startupCost : 100;
    
    if (get().player.funds < costToStart) {
      get().addNotification(
        'Insufficient Funds',
        `You need $${costToStart.toLocaleString()} to start a ${type} division.`,
        'error'
      );
      return;
    }

    const newBusiness = {
      id: Math.random().toString(),
      name,
      logo,
      brandColor,
      category,
      type,
      industry: category, // Keep category as industry for demand calculator compatibility
      description: `Premium quality ${type} provider.`,
      countryId,
      reputation: 20,
      businessValue: costToStart,
      marketShare: 1.0,
      profitMargin: parseFloat(template?.margin || '50%'),
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      netProfit: 0,
      customerSatisfaction: 80,
      popularity: 15,
      rating: 4.0,
      productionCapacity: 0,
      risk: template?.risk || 'Low',
      competition: template?.comp || 'Medium',
      growth: template?.growth || 'Medium'
    };

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - costToStart },
      businesses: [...state.businesses, newBusiness],
    }));

    get().addNotification('Business Launched', `Successfully created ${name} (${type})!`, 'success');
  },

  deleteBusiness: (id) => {
    set((state) => ({
      businesses: state.businesses.filter((b) => b.id !== id),
      products: state.products.filter((p) => p.businessId !== id),
    }));
    get().addNotification('Business Dissolved', 'The business and its associated products were closed.', 'warning');
  },

  unlockCountry: (id) => {
    const country = get().countries.find((c) => c.id === id);
    if (!country || country.unlocked) return;

    if (get().player.funds < country.unlockCost) {
      get().addNotification('Insufficient Funds', `Unlocking ${country.name} requires ${country.unlockCost.toLocaleString()}.`, 'error');
      return;
    }

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - country.unlockCost },
      countries: state.countries.map((c) => (c.id === id ? { ...c, unlocked: true } : c)),
    }));

    get().addNotification('Market Expanded', `Unlocked operations in ${country.name}!`, 'success');
  },

  completeOnboarding: (location) => {
    set((state) => ({
      needsOnboarding: false,
      homeLocation: location,
      currentTab: 'World Map',
      countries: state.countries.map((country) =>
        country.id === 'in' ? { ...country, unlocked: true } : country
      ),
    }));
    get().addNotification('Home Location Set', `${location.name}, ${location.state} is now your business home base.`, 'success');
    get().saveGame();
  },

  // Actions - Products
  createProduct: (name, category, brand, price, manufacturingCost, quality, packaging, targetCustomers, marketingBudget, initialQuantity, businessId) => {
    const totalSetupCost = (manufacturingCost * initialQuantity) + marketingBudget;
    if (get().player.funds < totalSetupCost) {
      get().addNotification('Insufficient Funds', 'Cannot afford the design specs and initial production run.', 'error');
      return;
    }

    const marketingScore = Math.min(100, Math.floor(marketingBudget / 10));

    const newProduct = {
      id: Math.random().toString(),
      name,
      category,
      brand,
      sku: `${brand.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      price,
      manufacturingCost,
      demand: 10,
      popularity: 5,
      quality: quality,
      packaging: packaging,
      targetCustomers: targetCustomers,
      innovationScore: 20,
      marketingScore: marketingScore,
      customerRating: 3.5 + (quality / 100) * 1.5,
      monthlySales: 0,
      totalSales: 0,
      revenue: 0,
      netProfit: 0,
      lifetimeEarnings: 0,
      inventory: initialQuantity,
      maxInventory: 100, // starting limit, expandable with warehouses
      autoRestock: false,
      status: 'Draft',
      launchDate: `Day ${Math.floor(get().daysSimulated) + 1}`,
      businessId,
    };

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - totalSetupCost },
      products: [...state.products, newProduct],
    }));
    get().addNotification('Product Launched', `Successfully launched custom product ${name}!`, 'success');
  },

  buyProductInventory: (productId, amount) => {
    const product = get().products.find(p => p.id === productId);
    if (!product) return;
    const cost = product.manufacturingCost * amount;
    if (get().player.funds < cost) {
      get().addNotification('Insufficient Funds', 'Cannot afford to purchase inventory.', 'error');
      return;
    }
    
    // Warehouse limit enforce (locked to 100 before $25k)
    const currentWarehouseLimit = get().player.netWorth >= 25000 ? product.maxInventory : 100;
    if (product.inventory + amount > currentWarehouseLimit) {
      get().addNotification(
        'Warehouse Limit Exceeded',
        `Your warehouse can only hold up to ${currentWarehouseLimit} units of this product. Reach $25k net worth to buy warehouse upgrades!`,
        'error'
      );
      return;
    }

    set(state => ({
      player: { ...state.player, funds: state.player.funds - cost },
      products: state.products.map(p => p.id === productId ? { ...p, inventory: p.inventory + amount } : p)
    }));
    get().addNotification('Inventory Purchased', `Ordered ${amount} units of ${product.name} for $${cost.toLocaleString()}.`, 'success');
  },

  upgradeWarehouse: (productId, nextLimit, cost) => {
    if (get().player.funds < cost) {
      get().addNotification('Insufficient Funds', 'Cannot afford warehouse upgrade.', 'error');
      return;
    }
    set(state => ({
      player: { ...state.player, funds: state.player.funds - cost },
      products: state.products.map(p => p.id === productId ? { ...p, maxInventory: nextLimit } : p)
    }));
    get().addNotification('Warehouse Upgraded', `Product warehouse capacity expanded to ${nextLimit} units.`, 'success');
  },

  updateProductStatus: (id, status) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
    get().addNotification('Product Status Updated', `Status changed to ${status}.`, 'info');
  },

  updateProductPrice: (id, price) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, price } : p)),
    }));
  },

  toggleAutoRestock: (id) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, autoRestock: !p.autoRestock } : p)),
    }));
  },

  // Actions - Factories
  purchaseFactory: (name, countryId) => {
    const cost = 250000;
    if (get().player.funds < cost) {
      get().addNotification('Failed Purchase', 'Purchasing a manufacturing plant requires $250K.', 'error');
      return;
    }

    const newFactory = {
      id: Math.random().toString(),
      name,
      countryId,
      purchaseCost: cost,
      workersHired: 0,
      machinesCount: 1,
      machineUpgradeLevel: 1,
      capacity: 100,
      productionSpeed: 1.0,
      qualityControlActive: false,
      maintenanceCost: 1500,
      electricityCost: 200,
      rawMaterials: 500,
      rawMaterialCost: 10,
      activeProductId: null,
    };

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - cost },
      factories: [...state.factories, newFactory],
    }));

    get().addNotification('Factory Completed', `Acquired production site: ${name}.`, 'success');
  },

  upgradeFactoryMachines: (id) => {
    const cost = 50000;
    if (get().player.funds < cost) {
      get().addNotification('Failed Upgrade', 'Standard machine tooling upgrades cost $50K.', 'error');
      return;
    }

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - cost },
      factories: state.factories.map((f) => {
        if (f.id === id) {
          const nextLevel = f.machineUpgradeLevel + 1;
          return {
            ...f,
            machineUpgradeLevel: nextLevel,
            capacity: f.capacity + 150,
            productionSpeed: f.productionSpeed + 0.25,
            maintenanceCost: f.maintenanceCost * 1.3,
          };
        }
        return f;
      }),
    }));
    get().addNotification('Factory Upgraded', 'Heavy machinery and tooling output rate boosted by 25%.', 'success');
  },

  toggleFactoryQC: (id) => {
    set((state) => ({
      factories: state.factories.map((f) => (f.id === id ? { ...f, qualityControlActive: !f.qualityControlActive } : f)),
    }));
  },

  setFactoryProduct: (id, productId) => {
    set((state) => ({
      factories: state.factories.map((f) => (f.id === id ? { ...f, activeProductId: productId } : f)),
    }));
  },

  buyRawMaterials: (id, amount) => {
    const factory = get().factories.find((f) => f.id === id);
    if (!factory) return;

    const totalCost = amount * factory.rawMaterialCost;
    if (get().player.funds < totalCost) {
      get().addNotification('Raw Materials', 'Inadequate balance to complete purchasing.', 'error');
      return;
    }

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - totalCost },
      factories: state.factories.map((f) => (f.id === id ? { ...f, rawMaterials: f.rawMaterials + amount } : f)),
    }));
  },

  // Actions - Employees (HR)
  hireEmployee: (name, role, department, salary) => {
    const newEmployee = {
      id: Math.random().toString(),
      name,
      role,
      department,
      salary,
      morale: 85,
      skill: Math.floor(Math.random() * 40 + 30), // 30 - 70 skill
      experience: Math.floor(Math.random() * 30 + 10),
      happiness: 85,
      businessId: null,
    };

    set((state) => ({
      employees: [...state.employees, newEmployee],
    }));
    get().addNotification('Staff Hired', `${name} is ready for onboarding in the ${department} department.`, 'success');
  },

  fireEmployee: (id) => {
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    }));
    get().addNotification('Staff Dismissed', 'Employee contract has been terminated.', 'warning');
  },

  assignEmployee: (id, businessId) => {
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, businessId } : e)),
    }));
  },

  trainEmployee: (id) => {
    const cost = 2000;
    if (get().player.funds < cost) {
      get().addNotification('Training Failed', 'Professional workforce courses cost $2K per staff member.', 'error');
      return;
    }

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - cost },
      employees: state.employees.map((e) =>
        e.id === id
          ? {
              ...e,
              skill: Math.min(100, e.skill + 10),
              morale: Math.min(100, e.morale + 5),
            }
          : e
      ),
    }));
  },

  promoteEmployee: (id) => {
    set((state) => ({
      employees: state.employees.map((e) => {
        if (e.id === id) {
          const nextSalary = Math.round(e.salary * 1.25);
          return {
            ...e,
            salary: nextSalary,
            morale: Math.min(100, e.morale + 15),
            skill: Math.min(100, e.skill + 5),
          };
        }
        return e;
      }),
    }));
    get().addNotification('Staff Promoted', 'Salary incremented by 25%. Staff morale is high.', 'success');
  },

  payBonus: (id, amount) => {
    if (get().player.funds < amount) {
      get().addNotification('Bonus Blocked', 'Inadequate liquidity to award cash bonuses.', 'error');
      return;
    }

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - amount },
      employees: state.employees.map((e) =>
        e.id === id ? { ...e, morale: Math.min(100, e.morale + Math.floor(amount / 100)) } : e
      ),
    }));
  },

  // Actions - Marketing
  runMarketingCampaign: (productId, budget) => {
    if (get().player.funds < budget) {
      get().addNotification('Marketing Blocked', 'Ad campaigns require upfront advertising fees.', 'error');
      return;
    }

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - budget },
      products: state.products.map((p) => {
        if (p.id === productId) {
          // Increase marketing score proportional to budget
          const boost = Math.min(100, p.marketingScore + Math.floor(budget / 100));
          return { ...p, marketingScore: boost };
        }
        return p;
      }),
    }));

    get().addNotification('Campaign Deployed', `Ad spend of $${budget.toLocaleString()} was deployed.`, 'success');
  },

  // Actions - Banking
  depositSavings: (amount) => {
    if (get().player.funds < amount) return;
    set((state) => ({
      player: { ...state.player, funds: state.player.funds - amount },
      bank: { ...state.bank, savingsBalance: state.bank.savingsBalance + amount },
    }));
  },

  withdrawSavings: (amount) => {
    if (get().player.savingsBalance < amount) return;
    set((state) => ({
      player: { ...state.player, funds: state.player.funds + amount },
      bank: { ...state.bank, savingsBalance: state.bank.savingsBalance - amount },
    }));
  },

  takeLoan: (amount) => {
    const loanRate = 0.08 + (800 - get().bank.creditScore) / 10000; // credit dependent
    const monthlyPayment = (amount * (1 + loanRate)) / 30; // 30 ticks repayment term
    const newLoan = {
      id: Math.random().toString(),
      principal: amount,
      interestRate: loanRate,
      monthlyPayment,
      remainingTerm: 30,
      totalPaid: 0,
    };

    set((state) => ({
      player: { ...state.player, funds: state.player.funds + amount },
      bank: {
        ...state.bank,
        loans: [...state.bank.loans, newLoan],
        creditScore: Math.max(350, state.bank.creditScore - 15), // temporary credit utilization penalty
      },
    }));

    get().addNotification('Financing Granted', `Loan of $${amount.toLocaleString()} disbursed. Monthly note is $${monthlyPayment.toLocaleString()}/day.`, 'info');
  },

  repayLoan: (loanId, amount) => {
    if (get().player.funds < amount) return;

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - amount },
      bank: {
        ...state.bank,
        loans: state.bank.loans.map((l) => {
          if (l.id === loanId) {
            const nextPaid = l.totalPaid + amount;
            return {
              ...l,
              principal: Math.max(0, l.principal - amount),
              totalPaid: nextPaid,
            };
          }
          return l;
        }).filter((l) => l.principal > 0),
        creditScore: Math.min(850, state.bank.creditScore + 5), // repayment loyalty boost
      },
    }));
  },

  // Actions - Stocks & IPO
  buyStock: (ticker, sharesCount) => {
    const stock = get().stocks.find((s) => s.ticker === ticker);
    if (!stock) return;

    const totalCost = stock.currentPrice * sharesCount;
    if (get().player.funds < totalCost) {
      get().addNotification('Trade Blocked', 'Inadequate balance to execute purchase order.', 'error');
      return;
    }

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - totalCost },
      stocks: state.stocks.map((s) => (s.ticker === ticker ? { ...s, playerShares: s.playerShares + sharesCount } : s)),
    }));
    get().addNotification('Order Filled', `Bought ${sharesCount} shares of ${ticker}.`, 'success');
  },

  sellStock: (ticker, sharesCount) => {
    const stock = get().stocks.find((s) => s.ticker === ticker);
    if (!stock || stock.playerShares < sharesCount) {
      get().addNotification('Trade Cancelled', 'Trade size exceeds current holdings portfolio.', 'error');
      return;
    }

    const cashCredit = stock.currentPrice * sharesCount;
    set((state) => ({
      player: { ...state.player, funds: state.player.funds + cashCredit },
      stocks: state.stocks.map((s) => (s.ticker === ticker ? { ...s, playerShares: s.playerShares - sharesCount } : s)),
    }));
    get().addNotification('Order Filled', `Sold ${sharesCount} shares of ${ticker}.`, 'info');
  },

  launchIpo: (ticker, sharePrice, totalShares) => {
    if (get().player.netWorth < 100000000) {
      get().addNotification('IPO Audits', 'Listing audit requires corporate valuation over $100M.', 'error');
      return;
    }

    // Capital infusion
    const capitalRaised = sharePrice * totalShares * 0.4; // 40% sold to retail investors
    const playerTicker = ticker.toUpperCase();

    const playerStock = {
      ticker: playerTicker,
      name: `${get().businesses[0]?.name || 'My Corporation'} Corp.`,
      currentPrice: sharePrice,
      priceHistory: [sharePrice],
      marketCap: sharePrice * totalShares,
      peRatio: 15,
      volume: 100000,
      high52: sharePrice,
      low52: sharePrice,
      dailyGain: 0,
      totalShares: totalShares,
      playerShares: totalShares - (totalShares * 0.4), // Player holds remaining 60%
      isPlayerCompany: true,
      dividendYield: 0,
      revenue: get().businesses.reduce((sum, b) => sum + b.monthlyRevenue, 0),
      profit: get().businesses.reduce((sum, b) => sum + b.netProfit, 0),
      description: 'Your diversified business empire.',
    };

    set((state) => ({
      player: {
        ...state.player,
        funds: state.player.funds + capitalRaised,
        isIpoCompleted: true,
        sharesOutstanding: totalShares,
      },
      stocks: [...state.stocks, playerStock],
    }));

    get().addNotification('IPO Complete', `Listed on the Stock Market under ${playerTicker}! Infused $${capitalRaised.toLocaleString()} capital.`, 'success');
  },

  adjustDividends: (rate) => {
    set((state) => ({
      player: { ...state.player, dividendRate: rate },
    }));
  },

  buyBackShares: (amount) => {
    const playerStock = get().stocks.find((s) => s.isPlayerCompany);
    if (!playerStock) return;

    const publicShares = playerStock.totalShares - playerStock.playerShares;
    if (amount > publicShares) {
      get().addNotification('Buyback Blocked', 'Target purchase exceeds public float volume.', 'error');
      return;
    }

    const totalCost = playerStock.currentPrice * amount;
    if (get().player.funds < totalCost) {
      get().addNotification('Trade Blocked', 'Inadequate funds to purchase stock back.', 'error');
      return;
    }

    set((state) => ({
      player: { ...state.player, funds: state.player.funds - totalCost },
      stocks: state.stocks.map((s) =>
        s.isPlayerCompany
          ? {
              ...s,
              playerShares: s.playerShares + amount,
            }
          : s
      ),
    }));
  },

  // Actions - Research
  researchTech: (techId) => {
    const tech = get().techTree.find((t) => t.id === techId);
    if (!tech || tech.unlocked) return;

    if (get().player.techPoints < tech.cost) {
      get().addNotification('Research Locked', 'Inadequate research tech points.', 'error');
      return;
    }

    set((state) => ({
      player: { ...state.player, techPoints: state.player.techPoints - tech.cost },
      techTree: state.techTree.map((t) => (t.id === techId ? { ...t, unlocked: true } : t)),
    }));

    get().addNotification('Research Completed', `Unlocked tech: ${tech.title}.`, 'success');
  },

  // Game Loop Ticker
  tick: (customElapsedMs) => {
    const state = get();
    const speed = state.player.speed;
    if (speed === 0 && customElapsedMs === undefined) return; // Paused and not forced offline tick

    const now = Date.now();
    const elapsedMs = customElapsedMs !== undefined ? customElapsedMs : (now - state.lastTickTime);
    
    // We only update lastTickTime to now if this is a real-time tick (not a custom one)
    if (customElapsedMs === undefined) {
      set({ lastTickTime: now });
    }

    const speedMultiplier = customElapsedMs !== undefined ? 1 : speed;
    const effectiveElapsedMs = elapsedMs * speedMultiplier;
    const elapsedDays = effectiveElapsedMs / 3000;
    
    if (elapsedDays <= 0) return;

    const daysSimulated = state.daysSimulated + elapsedDays;

    // Check if a monthly cycle has passed
    const previousMonth = Math.floor(state.daysSimulated / 30);
    const currentMonth = Math.floor(daysSimulated / 30);
    const monthsPassed = currentMonth - previousMonth;

    let fundsAccrual = 0;
    let totalSalaries = 0;
    let maintenanceCosts = 0;
    let totalRevenue = 0;
    let totalRawCost = 0;

    // 1. Factory Production tick
    const updatedFactories = state.factories.map((factory) => {
      if (!factory.activeProductId) return factory;

      const activeProduct = state.products.find((p) => p.id === factory.activeProductId);
      if (!activeProduct) return factory;

      const baseRawNeeded = activeProduct.manufacturingCost * 0.1; // raw units ratio
      const maxQuantityByRaw = factory.rawMaterials / Math.max(0.1, baseRawNeeded);
      const quantityProduced = Math.min(factory.capacity * elapsedDays, maxQuantityByRaw);

      if (quantityProduced <= 0) {
        if (Math.random() < 0.005 * elapsedDays * 86400) {
          get().addNotification('Production Suspended', `Raw materials supply critical at factory ${factory.name}.`, 'warning');
        }
        return factory;
      }

      const nextRawMaterials = Math.max(0, factory.rawMaterials - quantityProduced * baseRawNeeded);

      // Modify product inventory
      set((curr) => ({
        products: curr.products.map((p) =>
          p.id === activeProduct.id
            ? { ...p, inventory: Math.min(p.maxInventory, p.inventory + quantityProduced) }
            : p
        ),
      }));

      return {
        ...factory,
        rawMaterials: nextRawMaterials,
      };
    });

    // 2. Sales Tick
    const isInventoryLocked = state.player.netWorth < 500;
    const updatedProducts = state.products.map((product) => {
      const parentBusiness = state.businesses.find((b) => b.id === product.businessId);
      if (!parentBusiness) return product;

      const demand = calculateDemand(product, parentBusiness, state.economyPhase, state.activeEvents);
      const baseSalesVolume = Math.round((demand / 100) * 15 * (1 + product.popularity / 100));
      const unitsSold = isInventoryLocked 
        ? (baseSalesVolume * elapsedDays) 
        : Math.min(product.inventory, baseSalesVolume * elapsedDays);

      const dayRevenue = unitsSold * product.price;
      const dayRawCost = unitsSold * product.manufacturingCost;
      const dayNetProfit = dayRevenue - dayRawCost;

      totalRevenue += dayRevenue;
      totalRawCost += dayRawCost;

      if (isInventoryLocked) {
        // Direct cashflow deductions/additions when inventory is locked (auto-manufacture on demand)
        fundsAccrual += (dayRevenue - dayRawCost);
      } else {
        // Unlocked inventory: cash was paid upfront, so player gets full revenue cashflow
        fundsAccrual += dayRevenue;
      }

      let nextInventory = isInventoryLocked ? 0 : product.inventory - unitsSold;
      
      // Auto-Restock Automation
      if (!isInventoryLocked && product.autoRestock && nextInventory < product.maxInventory * 0.2) {
        const restockNeeded = product.maxInventory - nextInventory;
        const restockCost = restockNeeded * product.manufacturingCost;
        if (state.player.funds >= restockCost) {
          nextInventory = product.maxInventory;
          fundsAccrual -= restockCost;
        }
      }

      return {
        ...product,
        inventory: nextInventory,
        monthlySales: product.monthlySales + unitsSold,
        totalSales: product.totalSales + unitsSold,
        revenue: product.revenue + dayRevenue,
        netProfit: product.netProfit + dayNetProfit,
        lifetimeEarnings: product.lifetimeEarnings + dayNetProfit,
        demand: Math.round(demand),
      };
    });

    // 3. Employee Morale & R&D points calculation
    let gainedTechPoints = 0;
    const updatedEmployees = state.employees.map((employee) => {
      let moraleChange = (Math.random() - 0.5) * 2 * elapsedDays;
      if (employee.morale < 40) moraleChange -= 1 * elapsedDays;
      const morale = Math.min(100, Math.max(0, Math.round(employee.morale + moraleChange)));

      if (employee.department === 'R&D') {
        gainedTechPoints += ((employee.skill / 100) * 0.2) * elapsedDays;
      }

      totalSalaries += (employee.salary / 30) * elapsedDays;

      return {
        ...employee,
        morale,
      };
    });

    // 3.5 Businesses Stats Aggregation
    const updatedBusinesses = state.businesses.map((biz) => {
      const bizProducts = updatedProducts.filter((p) => p.businessId === biz.id);
      
      let tickRevenue = 0;
      let tickExpenses = 0;

      bizProducts.forEach((prod) => {
        const origProd = state.products.find((p) => p.id === prod.id);
        if (origProd) {
          const revDiff = Math.max(0, prod.revenue - origProd.revenue);
          const profitDiff = Math.max(0, prod.netProfit - origProd.netProfit);
          const rawCostDiff = revDiff - profitDiff;
          
          tickRevenue += revDiff;
          tickExpenses += rawCostDiff;
        }
      });

      updatedEmployees.forEach((emp) => {
        if (emp.businessId === biz.id) {
          tickExpenses += (emp.salary / 30) * elapsedDays;
        }
      });

      const monthlyRevenue = monthsPassed > 0 ? tickRevenue : biz.monthlyRevenue + tickRevenue;
      const monthlyExpenses = monthsPassed > 0 ? tickExpenses : biz.monthlyExpenses + tickExpenses;
      const netProfit = monthlyRevenue - monthlyExpenses;

      const businessValue = Math.max(biz.businessValue, biz.businessValue + netProfit * 0.05);

      return {
        ...biz,
        monthlyRevenue,
        monthlyExpenses,
        netProfit,
        businessValue
      };
    });

    // 4. Financial interest / loans repayments
    const updatedLoans = state.bank.loans.map((loan) => {
      const dailyInterest = (loan.principal * loan.interestRate) / 365;
      let nextPrincipal = loan.principal + dailyInterest * elapsedDays;
      fundsAccrual -= dailyInterest * elapsedDays;

      const payment = Math.min(nextPrincipal, (loan.monthlyPayment / 30) * elapsedDays);
      nextPrincipal -= payment;
      fundsAccrual -= payment;

      return {
        ...loan,
        principal: nextPrincipal,
        remainingTerm: Math.max(0, loan.remainingTerm - elapsedDays),
        totalPaid: loan.totalPaid + payment,
      };
    }).filter((l) => l.principal > 0.01);

    // Savings interest accrual
    const dailySavingsEarn = ((state.bank.savingsBalance * state.bank.savingsInterestRate) / 365) * elapsedDays;

    // Monthly dividends trigger
    if (monthsPassed > 0 && state.player.isIpoCompleted && state.player.dividendRate > 0) {
      const playerStock = state.stocks.find((s) => s.isPlayerCompany);
      if (playerStock) {
        const publicFloat = playerStock.totalShares - playerStock.playerShares;
        const totalDividendsPaid = publicFloat * state.player.dividendRate * monthsPassed;
        fundsAccrual -= totalDividendsPaid;
        get().addNotification('Dividends Distributed', `Paid out $${totalDividendsPaid.toLocaleString()} dividends to public shareholders (${monthsPassed} month(s)).`, 'info');
      }
    }

    // 5. Stock ticks
    const stockTickCount = customElapsedMs !== undefined ? Math.floor(elapsedDays) : 1;
    let updatedStocks = [...state.stocks];
    for (let i = 0; i < Math.max(1, stockTickCount); i++) {
      updatedStocks = updatedStocks.map((stock) => {
        if (stock.isPlayerCompany) {
          return {
            ...stock,
            revenue: totalRevenue,
            profit: totalRevenue - totalRawCost - totalSalaries - maintenanceCosts,
          };
        }
        return tickStockPrice(stock, state.economyPhase, state.activeEvents);
      });
    }

    // 6. Maintenance fees
    state.factories.forEach((factory) => {
      maintenanceCosts += (factory.maintenanceCost / 30) * elapsedDays;
      fundsAccrual -= ((factory.maintenanceCost + factory.electricityCost) / 30) * elapsedDays;
    });

    // Calculate player balance adjustment
    const salaryCost = totalSalaries;
    const finalBalanceShift = fundsAccrual - salaryCost;
    const nextFunds = Math.max(0, state.player.funds + finalBalanceShift + dailySavingsEarn);

    // Net worth calculator
    let netWorth = nextFunds + state.bank.savingsBalance;
    updatedBusinesses.forEach((b) => {
      netWorth += b.businessValue;
    });
    state.factories.forEach((f) => {
      netWorth += f.purchaseCost * 0.8;
    });
    updatedStocks.forEach((s) => {
      netWorth += s.playerShares * s.currentPrice;
    });
    updatedLoans.forEach((l) => {
      netWorth -= l.principal;
    });

    const netWorthHistory = [...state.player.netWorthHistory, netWorth].slice(-30);

    // Economy phase fluctuations (roughly every 90 days block crossed)
    let nextPhase = state.economyPhase;
    const previous90DayBlock = Math.floor(state.daysSimulated / 90);
    const current90DayBlock = Math.floor(daysSimulated / 90);
    if (current90DayBlock > previous90DayBlock && Math.random() < 0.3) {
      const phases = ['Normal', 'Boom', 'Recession', 'Crisis'];
      const currentIdx = phases.indexOf(state.economyPhase);
      const shift = Math.random() > 0.5 ? 1 : -1;
      const nextIdx = Math.max(0, Math.min(phases.length - 1, currentIdx + shift));
      nextPhase = phases[nextIdx] || 'Normal';
      get().addNotification('Economic Shift', `Economic outlook turned ${nextPhase}. Market demand adjusts globally.`, 'warning');
    }

    // Spawn Random News Event
    let activeEvents = [...state.activeEvents];
    const eventSpawnChance = 1 - Math.pow(1 - 0.015, elapsedDays);
    if (Math.random() < eventSpawnChance && activeEvents.length === 0) {
      const selectEvent = POTENTIAL_EVENTS[Math.floor(Math.random() * POTENTIAL_EVENTS.length)];
      if (selectEvent) {
        const newEvent = {
          ...selectEvent,
          id: Math.random().toString(),
          duration: Math.floor(Math.random() * 20 + 10),
        };
        activeEvents.push(newEvent);
        get().addNotification(`BREAKING NEWS: ${newEvent.title}`, newEvent.description, newEvent.type === 'positive' ? 'success' : 'error');
      }
    }

    // Tick down event timers
    activeEvents = activeEvents.map((evt) => ({
      ...evt,
      duration: evt.duration - elapsedDays,
    })).filter((evt) => {
      if (evt.duration <= 0) {
        get().addNotification('Event Settled', `Market stabilization: ${evt.title} has concluded.`, 'info');
        return false;
      }
      return true;
    });

    // Check Missions Progress
    const updatedMissions = state.missions.map((mission) => {
      if (mission.completed) return mission;
      let val = 0;
      if (mission.targetType === 'revenue') {
        val = totalRevenue;
      } else if (mission.targetType === 'networth') {
        val = netWorth;
      } else if (mission.targetType === 'products_launched') {
        val = updatedProducts.filter((p) => p.status === 'Selling').length;
      } else if (mission.targetType === 'employees_hired') {
        val = updatedEmployees.length;
      } else if (mission.targetType === 'stocks_owned') {
        val = updatedStocks.reduce((sum, s) => sum + s.playerShares, 0);
      }

      const completed = val >= mission.targetValue;
      if (completed) {
        get().addNotification('Mission Completed!', `Completed "${mission.title}"! Earned +$${mission.rewardMoney.toLocaleString()}`, 'success');
        set((curr) => ({
          player: {
            ...curr.player,
            funds: curr.player.funds + mission.rewardMoney,
            reputation: Math.min(100, curr.player.reputation + mission.rewardReputation),
          },
        }));
      }

      return {
        ...mission,
        currentValue: val,
        completed,
      };
    });

    // Save game auto-saver: every 30 seconds
    const timeSinceSave = now - state.lastSaveTime;
    if (customElapsedMs === undefined && timeSinceSave >= 30000) {
      get().saveGame();
    }

    // 7. Update all components
    set((curr) => ({
      daysSimulated,
      lastDividendPaidMonth: currentMonth,
      businesses: updatedBusinesses,
      factories: updatedFactories,
      products: updatedProducts,
      employees: updatedEmployees,
      bank: {
        ...curr.bank,
        loans: updatedLoans,
        savingsBalance: curr.bank.savingsBalance + dailySavingsEarn,
      },
      stocks: updatedStocks,
      activeEvents,
      economyPhase: nextPhase,
      missions: updatedMissions,
      player: {
        ...curr.player,
        funds: nextFunds,
        techPoints: curr.player.techPoints + gainedTechPoints,
        netWorth,
        netWorthHistory,
        daysSimulated,
        ipoUnlocked: netWorth >= 100000000,
      },
    }));
  },

  // Save / Load / Reset System
  saveGame: async () => {
    try {
      const now = Date.now();
      const saveData = {
        player: get().player,
        businesses: get().businesses,
        products: get().products,
        factories: get().factories,
        employees: get().employees,
        stocks: get().stocks,
        bank: get().bank,
        techTree: get().techTree,
        missions: get().missions,
        daysSimulated: get().daysSimulated,
        economyPhase: get().economyPhase,
        activeEvents: get().activeEvents,
        countries: get().countries,
        needsOnboarding: get().needsOnboarding,
        homeLocation: get().homeLocation,
        lastTickTime: now,
        lastDividendPaidMonth: get().lastDividendPaidMonth,
      };
      
      localStorage.setItem('biz_empire_save', JSON.stringify(saveData));
      set({ lastSaveTime: now });

      // Sync state to backend
      const token = get().token;
      if (get().isAuthenticated && token) {
        await fetch('http://localhost:4000/api/v1/users/state', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ gameState: JSON.stringify(saveData) })
        });
      }
    } catch (e) {
      console.error('Failed auto-save', e);
    }
  },

  loadGame: async () => {
    try {
      const token = get().token;
      let loadFromBackend = false;
      let parsed = null;

      if (token) {
        // Verify session / fetch profile
        try {
          const profileRes = await fetch('http://localhost:4000/api/v1/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.success) {
              set({ user: profileData.data, isAuthenticated: true });
              
              // Load state from DB
              const stateRes = await fetch('http://localhost:4000/api/v1/users/state', {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (stateRes.ok) {
                const stateData = await stateRes.json();
                if (stateData.success && stateData.data && stateData.data.gameState) {
                  parsed = JSON.parse(stateData.data.gameState);
                  loadFromBackend = true;
                }
              }
            }
          } else {
            localStorage.removeItem('biz_empire_token');
            set({ token: null, isAuthenticated: false, user: null });
          }
        } catch (err) {
          console.error('Failed backend authentication sync, falling back to local save', err);
        }
      }

      if (!loadFromBackend) {
        // Multi-user safety: only load local storage if not logged in
        if (!token) {
          const saved = localStorage.getItem('biz_empire_save');
          if (saved) {
            parsed = JSON.parse(saved);
          }
        }
      }

      if (parsed) {
        const now = Date.now();
        const savedSpeed = parsed.player?.speed !== undefined ? parsed.player.speed : 1;
        
        let offlineElapsed = 0;
        if (savedSpeed > 0 && parsed.lastTickTime) {
          offlineElapsed = now - parsed.lastTickTime;
        }

        set({
          player: parsed.player || get().player,
          businesses: parsed.businesses || get().businesses,
          products: parsed.products || get().products,
          factories: parsed.factories || get().factories,
          employees: parsed.employees || get().employees,
          stocks: parsed.stocks || get().stocks,
          bank: parsed.bank || get().bank,
          techTree: parsed.techTree || get().techTree,
          missions: parsed.missions || get().missions,
          daysSimulated: parsed.daysSimulated || 0,
          economyPhase: parsed.economyPhase || 'Normal',
          activeEvents: parsed.activeEvents || [],
          countries: parsed.countries || get().countries,
          needsOnboarding: parsed.needsOnboarding || false,
          homeLocation: parsed.homeLocation || null,
          lastTickTime: now,
          lastSaveTime: now,
          lastDividendPaidMonth: parsed.lastDividendPaidMonth || 0,
        });

        if (offlineElapsed > 1000) {
          // Cap offline progress to 30 game days maximum (30 days * 3000ms/day = 90,000ms)
          const cappedOfflineElapsed = Math.min(offlineElapsed, 90000);
          get().tick(cappedOfflineElapsed);
        }
      } else {
        set({
          lastTickTime: Date.now(),
          lastSaveTime: Date.now(),
          lastDividendPaidMonth: 0,
        });
      }
    } catch (e) {
      console.error('Failed to load save data', e);
    }
  },

  resetGame: () => {
    localStorage.removeItem('biz_empire_save');
    set({
      currentTab: 'Overview',
      speed: 1,
      daysSimulated: 0,
      lastTickTime: Date.now(),
      lastSaveTime: Date.now(),
      lastDividendPaidMonth: 0,
      player: {
        funds: 100,
        reputation: 10,
        netWorth: 100,
        netWorthHistory: [100],
        techPoints: 0,
        ipoUnlocked: false,
        isIpoCompleted: false,
        sharesOutstanding: 0,
        dividendRate: 0,
        daysSimulated: 0,
        speed: 1,
      },
      businesses: [],
      products: [],
      factories: [],
      employees: [],
      stocks: INITIAL_STOCKS,
      bank: {
        savingsBalance: 0,
        savingsInterestRate: 0.03,
        creditScore: 650,
        loans: [],
      },
      techTree: INITIAL_TECH_TREE,
      missions: INITIAL_MISSIONS,
      activeEvents: [],
      economyPhase: 'Normal',
      notifications: [],
      countries: INITIAL_COUNTRIES,
      needsOnboarding: false,
      homeLocation: null,
    });
    get().addNotification('Game Reset', 'All progress deleted. Starting fresh business venture!', 'warning');
  },
}));
