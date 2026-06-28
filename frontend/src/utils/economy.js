// Base industry parameters: baseline price, raw material needs, volatility
export const INDUSTRY_PARAMS = {
  Retail: { basePrice: 20, rawCost: 5, vol: 0.1, reputationImpact: 0.4 },
  Restaurant: { basePrice: 15, rawCost: 4, vol: 0.15, reputationImpact: 0.6 },
  Clothing: { basePrice: 45, rawCost: 10, vol: 0.2, reputationImpact: 0.5 },
  Electronics: { basePrice: 300, rawCost: 120, vol: 0.3, reputationImpact: 0.3 },
  Software: { basePrice: 99, rawCost: 0, vol: 0.25, reputationImpact: 0.4 },
  Automotive: { basePrice: 35000, rawCost: 15000, vol: 0.4, reputationImpact: 0.4 },
  Aerospace: { basePrice: 1200000, rawCost: 500000, vol: 0.5, reputationImpact: 0.6 },
  Pharmaceutical: { basePrice: 120, rawCost: 15, vol: 0.3, reputationImpact: 0.7 },
  Biotech: { basePrice: 500, rawCost: 80, vol: 0.45, reputationImpact: 0.8 },
  RenewableEnergy: { basePrice: 5000, rawCost: 2000, vol: 0.2, reputationImpact: 0.5 },
  Agriculture: { basePrice: 10, rawCost: 2, vol: 0.1, reputationImpact: 0.3 },
  Logistics: { basePrice: 150, rawCost: 40, vol: 0.15, reputationImpact: 0.4 },
};

// Calculate product daily demand
export function calculateDemand(
  product,
  business,
  economyPhase,
  activeEvents
) {
  if (product.status !== 'Selling') return 0;

  const industry = business.industry;
  const params = INDUSTRY_PARAMS[industry] || { basePrice: 50, rawCost: 15, vol: 0.2, reputationImpact: 0.5 };

  // 1. Price factor: higher price compared to cost reduce demand exponentially
  const markupMultiplier = product.price / Math.max(0.01, product.manufacturingCost);
  let priceScore;
  if (markupMultiplier > 3.0) {
    priceScore = Math.max(5, 100 * Math.pow(3.0 / markupMultiplier, 1.8));
  } else if (markupMultiplier < 1.1) {
    // Super cheap products get demand boost
    priceScore = 150;
  } else {
    // Normal pricing range
    priceScore = 100 - (markupMultiplier - 1) * 30;
  }

  // 2. Quality & Innovation factor
  const qualityScore = product.quality * 0.6 + product.innovationScore * 0.4;

  // 3. Marketing & Reputation impact
  const marketingMultiplier = 1 + (product.marketingScore / 50);
  const reputationMultiplier = 1 + (business.reputation / 100) * params.reputationImpact;

  // 4. Base calculation
  let demand = (priceScore * 0.4 + qualityScore * 0.6) * marketingMultiplier * reputationMultiplier;

  // 5. Economy factor
  let economyMultiplier;
  switch (economyPhase) {
    case 'Boom':
      economyMultiplier = 1.35;
      break;
    case 'Recession':
      economyMultiplier = 0.75;
      break;
    case 'Crisis':
      economyMultiplier = 0.5;
      break;
    case 'Normal':
    default:
      economyMultiplier = 1.0;
      break;
  }

  // Certain luxury or non-essential industries are hit harder by recession
  if (economyPhase === 'Recession' || economyPhase === 'Crisis') {
    if (industry === 'Automotive' || industry === 'Aerospace' || industry === 'Electronics') {
      economyMultiplier *= 0.8;
    }
  }

  demand *= economyMultiplier;

  // 6. Active event effects
  activeEvents.forEach((event) => {
    if (event.effect.type === 'market_demand') {
      demand *= event.effect.value;
    }
  });

  return Math.min(100, Math.max(1, demand));
}

// Calculate product actual daily sales volume
export function calculateDailySales(product, demand) {
  if (product.status !== 'Selling') return 0;

  // Demand maps to base percentage of current stock sold or raw volume
  const baseSalesVolume = Math.round((demand / 100) * 15 * (1 + product.popularity / 100));

  // Cannot sell more than available inventory
  return Math.min(product.inventory, baseSalesVolume);
}

// Tick stock prices based on earnings, general economy, and news
export function tickStockPrice(
  stock,
  economyPhase,
  activeEvents
) {
  let economyTrend = 0;
  switch (economyPhase) {
    case 'Boom':
      economyTrend = 0.015;
      break;
    case 'Recession':
      economyTrend = -0.01;
      break;
    case 'Crisis':
      economyTrend = -0.025;
      break;
    case 'Normal':
    default:
      economyTrend = 0.002;
      break;
  }

  // Add event effects (e.g. inflation, material cost impacts)
  activeEvents.forEach((event) => {
    if (event.effect.type === 'inflation' && event.effect.value > 1) {
      economyTrend -= 0.005; // Inflation hurts stocks
    }
  });

  // Calculate corporate performance factor (growth in profits)
  const margin = stock.revenue > 0 ? stock.profit / stock.revenue : 0;
  const profitGrowthFactor = margin > 0.15 ? 0.008 : margin > 0 ? 0.002 : -0.01;

  // Volatility and random walk
  const randomFactor = (Math.random() - 0.5) * 0.04; // -2% to +2% random walk

  // Combine factors to get price change percentage
  const totalChangePercent = economyTrend + profitGrowthFactor + randomFactor;
  const newPrice = Math.max(0.5, stock.currentPrice * (1 + totalChangePercent));

  // Track history (cap at last 30 entries)
  const priceHistory = [...stock.priceHistory, newPrice].slice(-30);
  const high52 = Math.max(...priceHistory, stock.high52);
  const low52 = Math.min(...priceHistory, stock.low52);

  const marketCap = newPrice * stock.totalShares;
  const dailyGain = (newPrice - (stock.priceHistory[stock.priceHistory.length - 1] || newPrice)) / (stock.priceHistory[stock.priceHistory.length - 1] || 1);

  return {
    ...stock,
    currentPrice: parseFloat(newPrice.toFixed(2)),
    priceHistory,
    marketCap,
    high52: parseFloat(high52.toFixed(2)),
    low52: parseFloat(low52.toFixed(2)),
    dailyGain,
  };
}

// Generate random events
export const POTENTIAL_EVENTS = [
  {
    title: 'Global Chip Shortage',
    description: 'Silicon shortage raises electronic assembly costs and drops production speeds.',
    type: 'negative',
    effect: {
      type: 'raw_material_cost',
      value: 1.5, // 50% increase
    },
  },
  {
    title: 'Economic Stimulus Package',
    description: 'Government distributes stimulus cheques. Consumer spending surges!',
    type: 'positive',
    effect: {
      type: 'market_demand',
      value: 1.4, // 40% increase
    },
  },
  {
    title: 'Central Bank Rate Hike',
    description: 'Central bank raises interest rates to combat inflation. Borrowing cost increases.',
    type: 'negative',
    effect: {
      type: 'loan_interest',
      value: 1.3, // 30% increase
    },
  },
  {
    title: 'Corporate Tax Holiday',
    description: 'Government passes a temporary corporate tax relief bill.',
    type: 'positive',
    effect: {
      type: 'tax_rate',
      value: 0.7, // 30% tax cut
    },
  },
  {
    title: 'Labor Strike',
    description: 'Logistical protests double shipping fees and raw material prices.',
    type: 'negative',
    effect: {
      type: 'raw_material_cost',
      value: 1.3,
    },
  },
];

export const BUSINESS_TEMPLATES = {
  "Food Business": {
    "Tea Stall": { startupCost: 20, basePrice: 2.5, rawCost: 0.8, margin: "68%", risk: "Low", comp: "High", growth: "Low" },
    "Juice Bar": { startupCost: 50, basePrice: 5.0, rawCost: 1.8, margin: "64%", risk: "Low", comp: "Medium", growth: "Low" },
    "Ice Cream Shop": { startupCost: 150, basePrice: 6.0, rawCost: 2.2, margin: "63%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Coffee Shop": { startupCost: 250, basePrice: 4.5, rawCost: 1.2, margin: "73%", risk: "Low", comp: "High", growth: "Medium" },
    "Bakery": { startupCost: 350, basePrice: 8.0, rawCost: 2.8, margin: "65%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Food Truck": { startupCost: 500, basePrice: 12.0, rawCost: 4.5, margin: "62%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Sweet Shop": { startupCost: 750, basePrice: 15.0, rawCost: 6.0, margin: "60%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Cloud Kitchen": { startupCost: 1000, basePrice: 16.0, rawCost: 6.5, margin: "59%", risk: "Medium", comp: "High", growth: "High" },
    "Pizza Shop": { startupCost: 1200, basePrice: 18.0, rawCost: 6.0, margin: "66%", risk: "Low", comp: "High", growth: "Medium" },
    "Fast Food": { startupCost: 2000, basePrice: 10.0, rawCost: 3.5, margin: "65%", risk: "Low", comp: "High", growth: "Medium" },
    "Restaurant": { startupCost: 5000, basePrice: 25.0, rawCost: 9.0, margin: "64%", risk: "Medium", comp: "High", growth: "Medium" },
    "Meal Delivery": { startupCost: 6000, basePrice: 14.0, rawCost: 5.5, margin: "60%", risk: "Low", comp: "Medium", growth: "High" },
    "Coffee Roastery": { startupCost: 8000, basePrice: 22.0, rawCost: 7.0, margin: "68%", risk: "Medium", comp: "Medium", growth: "High" },
    "Catering": { startupCost: 10000, basePrice: 45.0, rawCost: 15.0, margin: "66%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Organic Food Store": { startupCost: 12000, basePrice: 30.0, rawCost: 12.0, margin: "60%", risk: "Low", comp: "Medium", growth: "High" },
    "Farm Products": { startupCost: 15000, basePrice: 12.0, rawCost: 4.0, margin: "66%", risk: "Medium", comp: "Low", growth: "Medium" },
    "Seafood Store": { startupCost: 18000, basePrice: 28.0, rawCost: 11.0, margin: "60%", risk: "High", comp: "Medium", growth: "Medium" },
    "Frozen Food": { startupCost: 25000, basePrice: 15.0, rawCost: 6.0, margin: "60%", risk: "Low", comp: "Low", growth: "Medium" },
    "Beverage Company": { startupCost: 50000, basePrice: 8.0, rawCost: 2.5, margin: "68%", risk: "High", comp: "High", growth: "High" },
    "Chocolate Factory": { startupCost: 100000, basePrice: 12.0, rawCost: 3.5, margin: "70%", risk: "Medium", comp: "Low", growth: "High" }
  },
  "Clothing Business": {
    "Caps": { startupCost: 80, basePrice: 15.0, rawCost: 5.5, margin: "63%", risk: "Low", comp: "High", growth: "Low" },
    "Bags": { startupCost: 150, basePrice: 35.0, rawCost: 12.0, margin: "65%", risk: "Low", comp: "Medium", growth: "Medium" },
    "T-Shirts": { startupCost: 200, basePrice: 20.0, rawCost: 6.0, margin: "70%", risk: "Low", comp: "High", growth: "Medium" },
    "Caps & Accessories": { startupCost: 300, basePrice: 18.0, rawCost: 6.5, margin: "63%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Hoodies": { startupCost: 500, basePrice: 45.0, rawCost: 15.0, margin: "66%", risk: "Low", comp: "High", growth: "Medium" },
    "Shirts": { startupCost: 750, basePrice: 35.0, rawCost: 11.5, margin: "67%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Kids Wear": { startupCost: 1200, basePrice: 25.0, rawCost: 8.0, margin: "68%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Jeans": { startupCost: 2000, basePrice: 60.0, rawCost: 20.0, margin: "66%", risk: "Low", comp: "High", growth: "Medium" },
    "Jackets": { startupCost: 3000, basePrice: 90.0, rawCost: 32.0, margin: "64%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Sportswear": { startupCost: 5000, basePrice: 50.0, rawCost: 16.5, margin: "67%", risk: "Medium", comp: "High", growth: "High" },
    "Shoes": { startupCost: 8000, basePrice: 85.0, rawCost: 28.0, margin: "67%", risk: "High", comp: "High", growth: "High" },
    "Uniforms": { startupCost: 10000, basePrice: 40.0, rawCost: 14.0, margin: "65%", risk: "Low", comp: "Low", growth: "Medium" },
    "Men's Fashion": { startupCost: 15000, basePrice: 75.0, rawCost: 24.5, margin: "67%", risk: "Medium", comp: "Medium", growth: "High" },
    "Women's Fashion": { startupCost: 20000, basePrice: 85.0, rawCost: 26.0, margin: "69%", risk: "Medium", comp: "High", growth: "High" },
    "Luxury Fashion": { startupCost: 75000, basePrice: 350.0, rawCost: 80.0, margin: "77%", risk: "High", comp: "Low", growth: "High" }
  },
  "Online Selling Business": {
    "Dropshipping": { startupCost: 60, basePrice: 25.0, rawCost: 18.0, margin: "28%", risk: "Medium", comp: "High", growth: "Medium" },
    "Digital Store": { startupCost: 120, basePrice: 15.0, rawCost: 2.0, margin: "86%", risk: "Low", comp: "High", growth: "High" },
    "Pet Store": { startupCost: 250, basePrice: 30.0, rawCost: 19.5, margin: "35%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Beauty Store": { startupCost: 400, basePrice: 45.0, rawCost: 27.0, margin: "40%", risk: "Medium", comp: "Medium", growth: "High" },
    "Fashion Store": { startupCost: 600, basePrice: 50.0, rawCost: 32.5, margin: "35%", risk: "Medium", comp: "High", growth: "High" },
    "Electronics Store": { startupCost: 1000, basePrice: 120.0, rawCost: 90.0, margin: "25%", risk: "High", comp: "High", growth: "High" },
    "Furniture Store": { startupCost: 1500, basePrice: 250.0, rawCost: 162.5, margin: "35%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Subscription Store": { startupCost: 2500, basePrice: 19.0, rawCost: 8.5, margin: "55%", risk: "Low", comp: "Medium", growth: "High" },
    "Grocery Delivery": { startupCost: 5000, basePrice: 35.0, rawCost: 26.2, margin: "25%", risk: "Medium", comp: "High", growth: "High" },
    "Amazon-style Store": { startupCost: 15000, basePrice: 40.0, rawCost: 28.0, margin: "30%", risk: "High", comp: "High", growth: "High" },
    "Marketplace": { startupCost: 50000, basePrice: 100.0, rawCost: 15.0, margin: "85%", risk: "High", comp: "Low", growth: "High" }
  },
  "Reselling Business": {
    "Sell locally": { startupCost: 35, basePrice: 15.0, rawCost: 7.5, margin: "50%", risk: "Low", comp: "High", growth: "Low" },
    "Used products": { startupCost: 75, basePrice: 30.0, rawCost: 13.5, margin: "55%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Refurbished products": { startupCost: 150, basePrice: 75.0, rawCost: 41.25, margin: "45%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Auction products": { startupCost: 300, basePrice: 120.0, rawCost: 66.0, margin: "45%", risk: "High", comp: "Medium", growth: "Medium" },
    "Buy wholesale": { startupCost: 1000, basePrice: 8.0, rawCost: 5.2, margin: "35%", risk: "Low", comp: "High", growth: "Medium" },
    "Import products": { startupCost: 5000, basePrice: 55.0, rawCost: 30.25, margin: "45%", risk: "High", comp: "Medium", growth: "High" },
    "Sell internationally": { startupCost: 12000, basePrice: 95.0, rawCost: 52.25, margin: "45%", risk: "High", comp: "High", growth: "High" }
  },
  "Service Business": {
    "Cleaning Services": { startupCost: 25, basePrice: 40.0, rawCost: 8.0, margin: "80%", risk: "Low", comp: "High", growth: "Low" },
    "Photography": { startupCost: 100, basePrice: 120.0, rawCost: 24.0, margin: "80%", risk: "Low", comp: "High", growth: "Medium" },
    "Repair Shop": { startupCost: 150, basePrice: 65.0, rawCost: 19.5, margin: "70%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Graphic Design": { startupCost: 200, basePrice: 75.0, rawCost: 15.0, margin: "80%", risk: "Low", comp: "High", growth: "Medium" },
    "Event Management": { startupCost: 500, basePrice: 350.0, rawCost: 105.0, margin: "70%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Web Development": { startupCost: 1000, basePrice: 150.0, rawCost: 30.0, margin: "80%", risk: "Low", comp: "High", growth: "High" },
    "Education": { startupCost: 1500, basePrice: 50.0, rawCost: 12.5, margin: "75%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Video Editing": { startupCost: 2000, basePrice: 95.0, rawCost: 19.0, margin: "80%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Accounting": { startupCost: 3000, basePrice: 110.0, rawCost: 22.0, margin: "80%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Fitness Center": { startupCost: 5000, basePrice: 65.0, rawCost: 16.25, margin: "75%", risk: "Medium", comp: "High", growth: "Medium" },
    "Marketing Agency": { startupCost: 7500, basePrice: 200.0, rawCost: 50.0, margin: "75%", risk: "Medium", comp: "Medium", growth: "High" },
    "Software Agency": { startupCost: 10000, basePrice: 250.0, rawCost: 50.0, margin: "80%", risk: "Medium", comp: "Medium", growth: "High" },
    "Animation Studio": { startupCost: 12000, basePrice: 180.0, rawCost: 45.0, margin: "75%", risk: "High", comp: "Medium", growth: "High" },
    "Consulting": { startupCost: 15000, basePrice: 175.0, rawCost: 35.0, margin: "80%", risk: "Low", comp: "Medium", growth: "High" },
    "Logistics": { startupCost: 20000, basePrice: 120.0, rawCost: 48.0, margin: "60%", risk: "High", comp: "Medium", growth: "High" },
    "Law Firm": { startupCost: 25000, basePrice: 350.0, rawCost: 70.0, margin: "80%", risk: "Low", comp: "Low", growth: "Medium" },
    "Cybersecurity": { startupCost: 30000, basePrice: 280.0, rawCost: 56.0, margin: "80%", risk: "Medium", comp: "Low", growth: "High" },
    "Cloud Services": { startupCost: 40000, basePrice: 160.0, rawCost: 32.0, margin: "80%", risk: "Medium", comp: "Low", growth: "High" },
    "AI Agency": { startupCost: 50000, basePrice: 400.0, rawCost: 80.0, margin: "80%", risk: "High", comp: "Low", growth: "High" },
    "Medical Clinic": { startupCost: 100000, basePrice: 150.0, rawCost: 45.0, margin: "70%", risk: "High", comp: "Low", growth: "Medium" }
  },
  "Product Manufacturing": {
    "Books": { startupCost: 250, basePrice: 15.0, rawCost: 4.5, margin: "70%", risk: "Low", comp: "Medium", growth: "Low" },
    "Stationery": { startupCost: 400, basePrice: 5.0, rawCost: 1.5, margin: "70%", risk: "Low", comp: "High", growth: "Low" },
    "Toys": { startupCost: 750, basePrice: 18.0, rawCost: 6.0, margin: "66%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Tools": { startupCost: 1200, basePrice: 35.0, rawCost: 12.0, margin: "65%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Accessories": { startupCost: 2000, basePrice: 25.0, rawCost: 8.0, margin: "68%", risk: "Low", comp: "High", growth: "Medium" },
    "Kitchen Products": { startupCost: 3500, basePrice: 45.0, rawCost: 15.0, margin: "66%", risk: "Low", comp: "Medium", growth: "Medium" },
    "Sports Equipment": { startupCost: 5000, basePrice: 60.0, rawCost: 21.0, margin: "65%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Furniture": { startupCost: 8000, basePrice: 180.0, rawCost: 63.0, margin: "65%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Cosmetics": { startupCost: 12000, basePrice: 30.0, rawCost: 9.0, margin: "70%", risk: "Medium", comp: "High", growth: "High" },
    "Beauty Products": { startupCost: 15000, basePrice: 40.0, rawCost: 12.0, margin: "70%", risk: "Medium", comp: "High", growth: "High" },
    "Home Appliances": { startupCost: 20000, basePrice: 220.0, rawCost: 88.0, margin: "60%", risk: "Medium", comp: "High", growth: "Medium" },
    "Automobile Parts": { startupCost: 25000, basePrice: 450.0, rawCost: 180.0, margin: "60%", risk: "Medium", comp: "Low", growth: "Medium" },
    "Construction Materials": { startupCost: 30000, basePrice: 85.0, rawCost: 38.0, margin: "55%", risk: "Medium", comp: "Medium", growth: "Medium" },
    "Laptops": { startupCost: 50000, basePrice: 900.0, rawCost: 360.0, margin: "60%", risk: "High", comp: "High", growth: "High" },
    "Electronics": { startupCost: 75000, basePrice: 120.0, rawCost: 48.0, margin: "60%", risk: "High", comp: "High", growth: "High" },
    "Phones": { startupCost: 100000, basePrice: 800.0, rawCost: 280.0, margin: "65%", risk: "High", comp: "High", growth: "High" },
    "Gaming PCs": { startupCost: 120000, basePrice: 1500.0, rawCost: 600.0, margin: "60%", risk: "High", comp: "Medium", growth: "High" },
    "Jewelry": { startupCost: 150000, basePrice: 500.0, rawCost: 175.0, margin: "65%", risk: "High", comp: "Medium", growth: "High" },
    "Medical Equipment": { startupCost: 250000, basePrice: 3500.0, rawCost: 1050.0, margin: "70%", risk: "High", comp: "Low", growth: "High" },
    "Luxury Goods": { startupCost: 500000, basePrice: 1200.0, rawCost: 360.0, margin: "70%", risk: "High", comp: "Low", growth: "High" }
  },
  "Build Your Own Product Company": {
    "Custom Product": { startupCost: 500, basePrice: 100.0, rawCost: 35.0, margin: "65%", risk: "High", comp: "Medium", growth: "High" }
  }
};
