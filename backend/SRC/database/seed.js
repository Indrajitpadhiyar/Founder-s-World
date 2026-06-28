import { City } from "../modules/world/City.js";
import { Property } from "../modules/world/Property.js";
import { SupplyItem } from "../modules/supply/SupplyItem.js";
import { logger } from "../config/logger.js";

// ──────────────────────────────────────────
// 20 Indian Cities with Districts
// ──────────────────────────────────────────

const CITIES = [
  {
    name: "Mumbai", state: "Maharashtra", slug: "mumbai",
    coordinates: { lat: 19.076, lng: 72.8777 }, population: 20400000,
    averageIncome: 45000, crimeRate: 35, economicGrowth: 7, tourism: 75, employmentRate: 78,
    districts: [
      { name: "Colaba", type: "commercial", footTraffic: 90, populationDensity: 85, safetyRating: 75, growthPotential: 40, avgRentPerSqFt: 120 },
      { name: "Andheri", type: "mixed", footTraffic: 80, populationDensity: 90, safetyRating: 60, growthPotential: 65, avgRentPerSqFt: 60 },
      { name: "Bandra", type: "commercial", footTraffic: 85, populationDensity: 75, safetyRating: 70, growthPotential: 50, avgRentPerSqFt: 95 },
      { name: "Dadar", type: "market", footTraffic: 95, populationDensity: 95, safetyRating: 55, growthPotential: 35, avgRentPerSqFt: 70 },
      { name: "BKC", type: "office", footTraffic: 70, populationDensity: 40, safetyRating: 85, growthPotential: 80, avgRentPerSqFt: 150 },
      { name: "Dharavi", type: "industrial", footTraffic: 60, populationDensity: 99, safetyRating: 35, growthPotential: 45, avgRentPerSqFt: 15 },
    ],
  },
  {
    name: "Delhi", state: "Delhi NCR", slug: "delhi",
    coordinates: { lat: 28.7041, lng: 77.1025 }, population: 19000000,
    averageIncome: 42000, crimeRate: 40, economicGrowth: 6, tourism: 80, employmentRate: 75,
    districts: [
      { name: "Connaught Place", type: "commercial", footTraffic: 92, populationDensity: 70, safetyRating: 70, growthPotential: 35, avgRentPerSqFt: 130 },
      { name: "Karol Bagh", type: "market", footTraffic: 88, populationDensity: 85, safetyRating: 55, growthPotential: 40, avgRentPerSqFt: 65 },
      { name: "Saket", type: "mixed", footTraffic: 75, populationDensity: 60, safetyRating: 72, growthPotential: 60, avgRentPerSqFt: 80 },
      { name: "Chandni Chowk", type: "market", footTraffic: 97, populationDensity: 95, safetyRating: 45, growthPotential: 25, avgRentPerSqFt: 55 },
      { name: "Nehru Place", type: "commercial", footTraffic: 80, populationDensity: 65, safetyRating: 60, growthPotential: 50, avgRentPerSqFt: 70 },
    ],
  },
  {
    name: "Bengaluru", state: "Karnataka", slug: "bengaluru",
    coordinates: { lat: 12.9716, lng: 77.5946 }, population: 12300000,
    averageIncome: 50000, crimeRate: 25, economicGrowth: 9, tourism: 55, employmentRate: 82,
    districts: [
      { name: "Koramangala", type: "mixed", footTraffic: 82, populationDensity: 75, safetyRating: 72, growthPotential: 75, avgRentPerSqFt: 70 },
      { name: "MG Road", type: "commercial", footTraffic: 88, populationDensity: 65, safetyRating: 78, growthPotential: 45, avgRentPerSqFt: 110 },
      { name: "Whitefield", type: "office", footTraffic: 65, populationDensity: 55, safetyRating: 75, growthPotential: 85, avgRentPerSqFt: 55 },
      { name: "Electronic City", type: "industrial", footTraffic: 50, populationDensity: 40, safetyRating: 80, growthPotential: 80, avgRentPerSqFt: 40 },
      { name: "Indiranagar", type: "commercial", footTraffic: 85, populationDensity: 70, safetyRating: 75, growthPotential: 55, avgRentPerSqFt: 90 },
    ],
  },
  {
    name: "Ahmedabad", state: "Gujarat", slug: "ahmedabad",
    coordinates: { lat: 23.0225, lng: 72.5714 }, population: 8000000,
    averageIncome: 35000, crimeRate: 22, economicGrowth: 8, tourism: 50, employmentRate: 80,
    districts: [
      { name: "CG Road", type: "commercial", footTraffic: 80, populationDensity: 70, safetyRating: 72, growthPotential: 55, avgRentPerSqFt: 55 },
      { name: "Maninagar", type: "market", footTraffic: 75, populationDensity: 80, safetyRating: 60, growthPotential: 45, avgRentPerSqFt: 35 },
      { name: "SG Highway", type: "mixed", footTraffic: 70, populationDensity: 50, safetyRating: 78, growthPotential: 80, avgRentPerSqFt: 50 },
      { name: "Navrangpura", type: "residential", footTraffic: 60, populationDensity: 65, safetyRating: 75, growthPotential: 50, avgRentPerSqFt: 40 },
    ],
  },
  {
    name: "Surat", state: "Gujarat", slug: "surat",
    coordinates: { lat: 21.1702, lng: 72.8311 }, population: 7500000,
    averageIncome: 38000, crimeRate: 18, economicGrowth: 10, tourism: 35, employmentRate: 85,
    districts: [
      { name: "Ring Road", type: "commercial", footTraffic: 75, populationDensity: 65, safetyRating: 75, growthPotential: 70, avgRentPerSqFt: 40 },
      { name: "Varachha", type: "market", footTraffic: 80, populationDensity: 85, safetyRating: 60, growthPotential: 50, avgRentPerSqFt: 30 },
      { name: "Adajan", type: "residential", footTraffic: 55, populationDensity: 60, safetyRating: 80, growthPotential: 65, avgRentPerSqFt: 35 },
      { name: "Textile Market", type: "industrial", footTraffic: 85, populationDensity: 50, safetyRating: 65, growthPotential: 45, avgRentPerSqFt: 25 },
    ],
  },
  {
    name: "Pune", state: "Maharashtra", slug: "pune",
    coordinates: { lat: 18.5204, lng: 73.8567 }, population: 7400000,
    averageIncome: 40000, crimeRate: 20, economicGrowth: 8, tourism: 55, employmentRate: 80,
    districts: [
      { name: "Koregaon Park", type: "commercial", footTraffic: 78, populationDensity: 60, safetyRating: 78, growthPotential: 60, avgRentPerSqFt: 75 },
      { name: "Hinjewadi", type: "office", footTraffic: 60, populationDensity: 45, safetyRating: 82, growthPotential: 85, avgRentPerSqFt: 45 },
      { name: "FC Road", type: "market", footTraffic: 88, populationDensity: 80, safetyRating: 65, growthPotential: 40, avgRentPerSqFt: 60 },
      { name: "Kothrud", type: "residential", footTraffic: 55, populationDensity: 70, safetyRating: 75, growthPotential: 50, avgRentPerSqFt: 40 },
    ],
  },
  {
    name: "Hyderabad", state: "Telangana", slug: "hyderabad",
    coordinates: { lat: 17.385, lng: 78.4867 }, population: 10000000,
    averageIncome: 43000, crimeRate: 28, economicGrowth: 8, tourism: 65, employmentRate: 79,
    districts: [
      { name: "Banjara Hills", type: "commercial", footTraffic: 80, populationDensity: 55, safetyRating: 80, growthPotential: 50, avgRentPerSqFt: 85 },
      { name: "HITEC City", type: "office", footTraffic: 65, populationDensity: 45, safetyRating: 85, growthPotential: 85, avgRentPerSqFt: 60 },
      { name: "Charminar", type: "market", footTraffic: 92, populationDensity: 90, safetyRating: 50, growthPotential: 30, avgRentPerSqFt: 35 },
      { name: "Gachibowli", type: "mixed", footTraffic: 60, populationDensity: 40, safetyRating: 82, growthPotential: 80, avgRentPerSqFt: 50 },
    ],
  },
  {
    name: "Chennai", state: "Tamil Nadu", slug: "chennai",
    coordinates: { lat: 13.0827, lng: 80.2707 }, population: 10900000,
    averageIncome: 38000, crimeRate: 25, economicGrowth: 7, tourism: 60, employmentRate: 77,
    districts: [
      { name: "T. Nagar", type: "market", footTraffic: 95, populationDensity: 90, safetyRating: 60, growthPotential: 35, avgRentPerSqFt: 70 },
      { name: "Anna Nagar", type: "residential", footTraffic: 65, populationDensity: 70, safetyRating: 75, growthPotential: 55, avgRentPerSqFt: 50 },
      { name: "OMR", type: "office", footTraffic: 55, populationDensity: 40, safetyRating: 80, growthPotential: 80, avgRentPerSqFt: 45 },
      { name: "Mylapore", type: "commercial", footTraffic: 78, populationDensity: 75, safetyRating: 70, growthPotential: 40, avgRentPerSqFt: 60 },
    ],
  },
  {
    name: "Jaipur", state: "Rajasthan", slug: "jaipur",
    coordinates: { lat: 26.9124, lng: 75.7873 }, population: 4000000,
    averageIncome: 28000, crimeRate: 22, economicGrowth: 6, tourism: 85, employmentRate: 72,
    districts: [
      { name: "Johari Bazaar", type: "market", footTraffic: 90, populationDensity: 85, safetyRating: 58, growthPotential: 35, avgRentPerSqFt: 45 },
      { name: "Vaishali Nagar", type: "residential", footTraffic: 55, populationDensity: 65, safetyRating: 75, growthPotential: 60, avgRentPerSqFt: 30 },
      { name: "Malviya Nagar", type: "mixed", footTraffic: 70, populationDensity: 60, safetyRating: 72, growthPotential: 65, avgRentPerSqFt: 35 },
    ],
  },
  {
    name: "Kolkata", state: "West Bengal", slug: "kolkata",
    coordinates: { lat: 22.5726, lng: 88.3639 }, population: 14900000,
    averageIncome: 30000, crimeRate: 30, economicGrowth: 5, tourism: 65, employmentRate: 72,
    districts: [
      { name: "Park Street", type: "commercial", footTraffic: 85, populationDensity: 70, safetyRating: 65, growthPotential: 40, avgRentPerSqFt: 65 },
      { name: "Salt Lake", type: "office", footTraffic: 60, populationDensity: 50, safetyRating: 80, growthPotential: 70, avgRentPerSqFt: 45 },
      { name: "New Market", type: "market", footTraffic: 92, populationDensity: 90, safetyRating: 50, growthPotential: 25, avgRentPerSqFt: 40 },
    ],
  },
  {
    name: "Lucknow", state: "Uttar Pradesh", slug: "lucknow",
    coordinates: { lat: 26.8467, lng: 80.9462 }, population: 3600000,
    averageIncome: 25000, crimeRate: 28, economicGrowth: 5, tourism: 55, employmentRate: 68,
    districts: [
      { name: "Hazratganj", type: "commercial", footTraffic: 82, populationDensity: 75, safetyRating: 62, growthPotential: 45, avgRentPerSqFt: 40 },
      { name: "Aminabad", type: "market", footTraffic: 88, populationDensity: 90, safetyRating: 50, growthPotential: 30, avgRentPerSqFt: 25 },
      { name: "Gomti Nagar", type: "mixed", footTraffic: 65, populationDensity: 55, safetyRating: 75, growthPotential: 70, avgRentPerSqFt: 35 },
    ],
  },
  {
    name: "Chandigarh", state: "Chandigarh", slug: "chandigarh",
    coordinates: { lat: 30.7333, lng: 76.7794 }, population: 1200000,
    averageIncome: 40000, crimeRate: 15, economicGrowth: 6, tourism: 50, employmentRate: 82,
    districts: [
      { name: "Sector 17", type: "commercial", footTraffic: 80, populationDensity: 60, safetyRating: 85, growthPotential: 40, avgRentPerSqFt: 55 },
      { name: "Sector 22", type: "market", footTraffic: 78, populationDensity: 65, safetyRating: 80, growthPotential: 35, avgRentPerSqFt: 45 },
      { name: "IT Park", type: "office", footTraffic: 55, populationDensity: 35, safetyRating: 90, growthPotential: 75, avgRentPerSqFt: 50 },
    ],
  },
  {
    name: "Kochi", state: "Kerala", slug: "kochi",
    coordinates: { lat: 9.9312, lng: 76.2673 }, population: 2100000,
    averageIncome: 32000, crimeRate: 18, economicGrowth: 6, tourism: 80, employmentRate: 76,
    districts: [
      { name: "MG Road", type: "commercial", footTraffic: 78, populationDensity: 65, safetyRating: 75, growthPotential: 50, avgRentPerSqFt: 50 },
      { name: "Fort Kochi", type: "mixed", footTraffic: 85, populationDensity: 50, safetyRating: 78, growthPotential: 45, avgRentPerSqFt: 55 },
      { name: "Infopark", type: "office", footTraffic: 50, populationDensity: 35, safetyRating: 85, growthPotential: 80, avgRentPerSqFt: 40 },
    ],
  },
  {
    name: "Indore", state: "Madhya Pradesh", slug: "indore",
    coordinates: { lat: 22.7196, lng: 75.8577 }, population: 3200000,
    averageIncome: 28000, crimeRate: 15, economicGrowth: 7, tourism: 40, employmentRate: 78,
    districts: [
      { name: "Rajwada", type: "market", footTraffic: 85, populationDensity: 80, safetyRating: 60, growthPotential: 35, avgRentPerSqFt: 30 },
      { name: "Vijay Nagar", type: "mixed", footTraffic: 72, populationDensity: 65, safetyRating: 75, growthPotential: 65, avgRentPerSqFt: 35 },
      { name: "Super Corridor", type: "office", footTraffic: 50, populationDensity: 30, safetyRating: 85, growthPotential: 85, avgRentPerSqFt: 30 },
    ],
  },
  {
    name: "Nagpur", state: "Maharashtra", slug: "nagpur",
    coordinates: { lat: 21.1458, lng: 79.0882 }, population: 2800000,
    averageIncome: 26000, crimeRate: 20, economicGrowth: 5, tourism: 35, employmentRate: 74,
    districts: [
      { name: "Sitabuldi", type: "market", footTraffic: 82, populationDensity: 80, safetyRating: 58, growthPotential: 40, avgRentPerSqFt: 30 },
      { name: "Dharampeth", type: "commercial", footTraffic: 70, populationDensity: 60, safetyRating: 72, growthPotential: 50, avgRentPerSqFt: 35 },
      { name: "MIHAN", type: "industrial", footTraffic: 40, populationDensity: 20, safetyRating: 85, growthPotential: 90, avgRentPerSqFt: 20 },
    ],
  },
  {
    name: "Vadodara", state: "Gujarat", slug: "vadodara",
    coordinates: { lat: 22.3072, lng: 73.1812 }, population: 2100000,
    averageIncome: 30000, crimeRate: 16, economicGrowth: 6, tourism: 45, employmentRate: 79,
    districts: [
      { name: "Alkapuri", type: "commercial", footTraffic: 75, populationDensity: 60, safetyRating: 78, growthPotential: 50, avgRentPerSqFt: 40 },
      { name: "Manjalpur", type: "industrial", footTraffic: 50, populationDensity: 55, safetyRating: 70, growthPotential: 60, avgRentPerSqFt: 22 },
    ],
  },
  {
    name: "Rajkot", state: "Gujarat", slug: "rajkot",
    coordinates: { lat: 22.3039, lng: 70.8022 }, population: 1800000,
    averageIncome: 28000, crimeRate: 14, economicGrowth: 7, tourism: 30, employmentRate: 82,
    districts: [
      { name: "Yagnik Road", type: "commercial", footTraffic: 72, populationDensity: 65, safetyRating: 78, growthPotential: 55, avgRentPerSqFt: 30 },
      { name: "Amin Marg", type: "market", footTraffic: 78, populationDensity: 75, safetyRating: 70, growthPotential: 40, avgRentPerSqFt: 25 },
    ],
  },
  {
    name: "Nashik", state: "Maharashtra", slug: "nashik",
    coordinates: { lat: 19.9975, lng: 73.7898 }, population: 1800000,
    averageIncome: 26000, crimeRate: 18, economicGrowth: 6, tourism: 55, employmentRate: 75,
    districts: [
      { name: "College Road", type: "commercial", footTraffic: 72, populationDensity: 65, safetyRating: 72, growthPotential: 55, avgRentPerSqFt: 30 },
      { name: "Panchavati", type: "market", footTraffic: 80, populationDensity: 80, safetyRating: 60, growthPotential: 35, avgRentPerSqFt: 25 },
    ],
  },
  {
    name: "Bhopal", state: "Madhya Pradesh", slug: "bhopal",
    coordinates: { lat: 23.2599, lng: 77.4126 }, population: 2300000,
    averageIncome: 25000, crimeRate: 22, economicGrowth: 5, tourism: 50, employmentRate: 72,
    districts: [
      { name: "New Market", type: "commercial", footTraffic: 78, populationDensity: 70, safetyRating: 65, growthPotential: 50, avgRentPerSqFt: 30 },
      { name: "MP Nagar", type: "mixed", footTraffic: 72, populationDensity: 55, safetyRating: 75, growthPotential: 65, avgRentPerSqFt: 35 },
    ],
  },
  {
    name: "Patna", state: "Bihar", slug: "patna",
    coordinates: { lat: 25.6093, lng: 85.1376 }, population: 2500000,
    averageIncome: 20000, crimeRate: 35, economicGrowth: 4, tourism: 40, employmentRate: 65,
    districts: [
      { name: "Fraser Road", type: "commercial", footTraffic: 80, populationDensity: 85, safetyRating: 50, growthPotential: 45, avgRentPerSqFt: 25 },
      { name: "Boring Road", type: "mixed", footTraffic: 70, populationDensity: 70, safetyRating: 55, growthPotential: 55, avgRentPerSqFt: 20 },
    ],
  },
];

// ──────────────────────────────────────────
// Property templates per district type
// ──────────────────────────────────────────

function generateProperties(cityDoc) {
  const properties = [];
  const shopNames = ["Corner Unit", "Main Street Shop", "Market Stall", "Gallery Space", "Outlet Store", "Kiosk", "Showroom", "Street Level Unit", "Basement Shop", "Upper Floor Unit"];
  const warehouseNames = ["Storage Bay", "Depot Unit", "Godown", "Logistics Hub"];
  const officeNames = ["Suite", "Co-Working Desk", "Private Office", "Executive Floor"];

  for (const district of cityDoc.districts) {
    const propertyCount = district.type === "commercial" || district.type === "market" ? 12 : district.type === "office" ? 8 : district.type === "industrial" ? 6 : 5;

    for (let i = 0; i < propertyCount; i++) {
      let type, size, namePool;
      const rand = Math.random();

      if (district.type === "industrial") {
        type = rand < 0.5 ? "warehouse" : "factory";
        size = 800 + Math.floor(Math.random() * 2000);
        namePool = warehouseNames;
      } else if (district.type === "office") {
        type = "office";
        size = 200 + Math.floor(Math.random() * 800);
        namePool = officeNames;
      } else {
        type = "shop";
        size = 100 + Math.floor(Math.random() * 500);
        namePool = shopNames;
      }

      const rentPerSqFt = district.avgRentPerSqFt * (0.7 + Math.random() * 0.6);
      const monthlyRent = Math.round(size * rentPerSqFt / 12);
      const deposit = monthlyRent * (2 + Math.floor(Math.random() * 2));
      const salePrice = monthlyRent * (80 + Math.floor(Math.random() * 120));

      properties.push({
        cityId: cityDoc._id,
        districtName: district.name,
        address: `${i + 1}, ${namePool[i % namePool.length]}, ${district.name}`,
        type,
        size,
        monthlyRent,
        salePrice,
        deposit,
        footTraffic: Math.max(10, district.footTraffic + Math.floor((Math.random() - 0.5) * 20)),
        nearbyCompetitors: Math.floor(Math.random() * 8),
        nearbySuppliers: Math.floor(Math.random() * 5),
        parking: Math.random() > 0.5,
        publicTransport: Math.random() > 0.3,
        safetyRating: Math.max(20, district.safetyRating + Math.floor((Math.random() - 0.5) * 15)),
        growthPotential: Math.max(10, district.growthPotential + Math.floor((Math.random() - 0.5) * 15)),
        customerDemographics: {
          averageAge: 22 + Math.floor(Math.random() * 20),
          incomeLevel: ["low", "middle", "upper_middle", "high"][Math.floor(Math.random() * 4)],
          spendingHabit: ["frugal", "moderate", "generous"][Math.floor(Math.random() * 3)],
        },
        status: "available",
      });
    }
  }
  return properties;
}

// ──────────────────────────────────────────
// Supply Items (raw materials, components, finished goods)
// ──────────────────────────────────────────

const SUPPLY_ITEMS = [
  // Food raw materials
  { name: "Rice", category: "raw_material", subCategory: "grains", basePrice: 2, unit: "kg", spoilRate: 90, weight: 1, icon: "🍚", usedBy: ["food", "restaurant", "supermarket"] },
  { name: "Wheat Flour", category: "raw_material", subCategory: "grains", basePrice: 1.5, unit: "kg", spoilRate: 120, weight: 1, icon: "🌾", usedBy: ["food", "bakery", "restaurant"] },
  { name: "Cooking Oil", category: "raw_material", subCategory: "oils", basePrice: 3, unit: "liter", spoilRate: 180, weight: 0.9, icon: "🛢️", usedBy: ["food", "restaurant", "bakery"] },
  { name: "Milk", category: "raw_material", subCategory: "dairy", basePrice: 1.5, unit: "liter", spoilRate: 5, weight: 1, icon: "🥛", usedBy: ["food", "bakery", "coffee", "restaurant"] },
  { name: "Vegetables (Mixed)", category: "raw_material", subCategory: "vegetables", basePrice: 2, unit: "kg", spoilRate: 7, weight: 1, icon: "🥬", usedBy: ["food", "restaurant", "supermarket"] },
  { name: "Meat (Chicken)", category: "raw_material", subCategory: "meat", basePrice: 5, unit: "kg", spoilRate: 3, weight: 1, icon: "🍗", usedBy: ["food", "restaurant"] },
  { name: "Spices Assortment", category: "raw_material", subCategory: "spices", basePrice: 8, unit: "kg", spoilRate: 365, weight: 0.5, icon: "🌶️", usedBy: ["food", "restaurant"] },
  { name: "Sugar", category: "raw_material", subCategory: "sweeteners", basePrice: 1, unit: "kg", spoilRate: 365, weight: 1, icon: "🍬", usedBy: ["food", "bakery", "coffee"] },
  { name: "Coffee Beans", category: "raw_material", subCategory: "beverages", basePrice: 12, unit: "kg", spoilRate: 180, weight: 1, icon: "☕", usedBy: ["coffee", "restaurant"] },
  { name: "Tea Leaves", category: "raw_material", subCategory: "beverages", basePrice: 8, unit: "kg", spoilRate: 365, weight: 0.5, icon: "🍵", usedBy: ["coffee", "restaurant", "food"] },
  { name: "Water (Bottled)", category: "consumable", subCategory: "beverages", basePrice: 0.5, unit: "liter", spoilRate: 365, weight: 1, icon: "💧", usedBy: ["food", "restaurant", "coffee", "supermarket"] },
  { name: "Packaging (Food)", category: "component", subCategory: "packaging", basePrice: 0.3, unit: "piece", spoilRate: 0, weight: 0.05, icon: "📦", usedBy: ["food", "restaurant", "bakery", "coffee"] },

  // Electronics
  { name: "Smartphone (Budget)", category: "finished_good", subCategory: "phones", basePrice: 80, unit: "piece", spoilRate: 0, weight: 0.2, icon: "📱", usedBy: ["electronics", "retail"] },
  { name: "Smartphone (Mid-range)", category: "finished_good", subCategory: "phones", basePrice: 200, unit: "piece", spoilRate: 0, weight: 0.2, icon: "📱", usedBy: ["electronics", "retail"] },
  { name: "Smartphone (Flagship)", category: "finished_good", subCategory: "phones", basePrice: 500, unit: "piece", spoilRate: 0, weight: 0.2, icon: "📱", usedBy: ["electronics", "retail"] },
  { name: "Phone Charger", category: "component", subCategory: "accessories", basePrice: 5, unit: "piece", spoilRate: 0, weight: 0.1, icon: "🔌", usedBy: ["electronics", "retail"] },
  { name: "Phone Cover", category: "finished_good", subCategory: "accessories", basePrice: 3, unit: "piece", spoilRate: 0, weight: 0.05, icon: "🛡️", usedBy: ["electronics", "retail"] },
  { name: "Headphones", category: "finished_good", subCategory: "accessories", basePrice: 15, unit: "piece", spoilRate: 0, weight: 0.15, icon: "🎧", usedBy: ["electronics", "retail"] },
  { name: "Power Bank", category: "finished_good", subCategory: "accessories", basePrice: 12, unit: "piece", spoilRate: 0, weight: 0.3, icon: "🔋", usedBy: ["electronics", "retail"] },
  { name: "Laptop (Basic)", category: "finished_good", subCategory: "computers", basePrice: 350, unit: "piece", spoilRate: 0, weight: 2, icon: "💻", usedBy: ["electronics", "retail"] },

  // Clothing
  { name: "Cotton Fabric", category: "raw_material", subCategory: "textiles", basePrice: 4, unit: "meter", spoilRate: 0, weight: 0.3, icon: "🧵", usedBy: ["clothing", "manufacturing"] },
  { name: "T-Shirt (Basic)", category: "finished_good", subCategory: "clothing", basePrice: 5, unit: "piece", spoilRate: 0, weight: 0.2, icon: "👕", usedBy: ["clothing", "retail", "supermarket"] },
  { name: "Jeans", category: "finished_good", subCategory: "clothing", basePrice: 15, unit: "piece", spoilRate: 0, weight: 0.5, icon: "👖", usedBy: ["clothing", "retail"] },
  { name: "Shoes (Casual)", category: "finished_good", subCategory: "footwear", basePrice: 20, unit: "pair", spoilRate: 0, weight: 0.8, icon: "👟", usedBy: ["clothing", "retail"] },
  { name: "Accessories Set", category: "finished_good", subCategory: "accessories", basePrice: 8, unit: "set", spoilRate: 0, weight: 0.3, icon: "💍", usedBy: ["clothing", "jewelry", "retail"] },

  // Medical
  { name: "Paracetamol (Strip)", category: "finished_good", subCategory: "medicine", basePrice: 0.5, unit: "strip", spoilRate: 730, weight: 0.02, icon: "💊", usedBy: ["medical", "supermarket"] },
  { name: "First Aid Kit", category: "finished_good", subCategory: "medical_supplies", basePrice: 10, unit: "kit", spoilRate: 365, weight: 0.5, icon: "🩹", usedBy: ["medical"] },
  { name: "Sanitizer", category: "consumable", subCategory: "hygiene", basePrice: 2, unit: "bottle", spoilRate: 365, weight: 0.3, icon: "🧴", usedBy: ["medical", "supermarket", "salon"] },

  // Salon / Barber
  { name: "Shampoo (Professional)", category: "consumable", subCategory: "haircare", basePrice: 8, unit: "bottle", spoilRate: 365, weight: 0.5, icon: "🧴", usedBy: ["salon", "barber"] },
  { name: "Hair Dye Kit", category: "consumable", subCategory: "haircare", basePrice: 12, unit: "kit", spoilRate: 180, weight: 0.3, icon: "🎨", usedBy: ["salon"] },
  { name: "Razor Blades (Pack)", category: "consumable", subCategory: "grooming", basePrice: 3, unit: "pack", spoilRate: 0, weight: 0.05, icon: "🪒", usedBy: ["barber", "salon"] },

  // Furniture
  { name: "Wooden Planks", category: "raw_material", subCategory: "wood", basePrice: 10, unit: "piece", spoilRate: 0, weight: 5, icon: "🪵", usedBy: ["furniture", "construction", "manufacturing"] },
  { name: "Office Chair", category: "finished_good", subCategory: "furniture", basePrice: 60, unit: "piece", spoilRate: 0, weight: 8, icon: "🪑", usedBy: ["furniture", "retail"] },
  { name: "Desk", category: "finished_good", subCategory: "furniture", basePrice: 80, unit: "piece", spoilRate: 0, weight: 15, icon: "🗄️", usedBy: ["furniture", "retail"] },

  // Gym
  { name: "Protein Powder", category: "consumable", subCategory: "supplements", basePrice: 25, unit: "kg", spoilRate: 365, weight: 1, icon: "💪", usedBy: ["gym", "supermarket"] },
  { name: "Yoga Mat", category: "finished_good", subCategory: "fitness", basePrice: 10, unit: "piece", spoilRate: 0, weight: 1, icon: "🧘", usedBy: ["gym", "retail"] },

  // Construction / Industrial
  { name: "Cement (Bag)", category: "raw_material", subCategory: "construction", basePrice: 6, unit: "bag", spoilRate: 180, weight: 50, icon: "🧱", usedBy: ["construction", "manufacturing"] },
  { name: "Steel Rods", category: "raw_material", subCategory: "metals", basePrice: 15, unit: "bundle", spoilRate: 0, weight: 20, icon: "🔩", usedBy: ["construction", "manufacturing"] },
  { name: "Paint (Bucket)", category: "consumable", subCategory: "finishing", basePrice: 12, unit: "bucket", spoilRate: 365, weight: 10, icon: "🎨", usedBy: ["construction", "manufacturing"] },

  // General retail / Supermarket
  { name: "Soap (Pack)", category: "consumable", subCategory: "hygiene", basePrice: 1, unit: "pack", spoilRate: 730, weight: 0.3, icon: "🧼", usedBy: ["supermarket", "retail"] },
  { name: "Toothpaste", category: "consumable", subCategory: "hygiene", basePrice: 1.5, unit: "tube", spoilRate: 730, weight: 0.15, icon: "🪥", usedBy: ["supermarket", "retail"] },
  { name: "Cleaning Supplies", category: "consumable", subCategory: "household", basePrice: 3, unit: "bottle", spoilRate: 365, weight: 1, icon: "🧹", usedBy: ["supermarket", "retail"] },
  { name: "Stationery Kit", category: "finished_good", subCategory: "stationery", basePrice: 5, unit: "kit", spoilRate: 0, weight: 0.3, icon: "✏️", usedBy: ["retail", "education", "supermarket"] },

  // Bakery
  { name: "Eggs (Tray)", category: "raw_material", subCategory: "dairy", basePrice: 3, unit: "tray", spoilRate: 21, weight: 1.5, icon: "🥚", usedBy: ["bakery", "restaurant", "food"] },
  { name: "Butter", category: "raw_material", subCategory: "dairy", basePrice: 4, unit: "kg", spoilRate: 30, weight: 1, icon: "🧈", usedBy: ["bakery", "restaurant", "food"] },
  { name: "Vanilla Extract", category: "raw_material", subCategory: "flavoring", basePrice: 15, unit: "bottle", spoilRate: 365, weight: 0.2, icon: "🍶", usedBy: ["bakery", "coffee"] },

  // Automobile
  { name: "Engine Oil", category: "consumable", subCategory: "automotive", basePrice: 8, unit: "liter", spoilRate: 730, weight: 1, icon: "🛢️", usedBy: ["mechanic", "automobile"] },
  { name: "Brake Pads", category: "component", subCategory: "automotive", basePrice: 15, unit: "set", spoilRate: 0, weight: 1, icon: "🔧", usedBy: ["mechanic", "automobile"] },
  { name: "Car Battery", category: "component", subCategory: "automotive", basePrice: 50, unit: "piece", spoilRate: 0, weight: 12, icon: "🔋", usedBy: ["mechanic", "automobile"] },

  // Jewelry
  { name: "Gold (10g)", category: "raw_material", subCategory: "precious_metals", basePrice: 600, unit: "piece", spoilRate: 0, weight: 0.01, icon: "✨", usedBy: ["jewelry", "manufacturing"] },
  { name: "Silver (100g)", category: "raw_material", subCategory: "precious_metals", basePrice: 80, unit: "piece", spoilRate: 0, weight: 0.1, icon: "🪙", usedBy: ["jewelry", "manufacturing"] },
  { name: "Gemstones (Assorted)", category: "raw_material", subCategory: "precious_stones", basePrice: 200, unit: "piece", spoilRate: 0, weight: 0.01, icon: "💎", usedBy: ["jewelry"] },
];

// ──────────────────────────────────────────
// Main seeder function
// ──────────────────────────────────────────

export const seedDatabase = async () => {
  try {
    // 1. Seed Cities
    const cityCount = await City.countDocuments();
    if (cityCount === 0) {
      logger.info("🌍 Seeding 20 Indian cities...");
      const createdCities = await City.create(CITIES);
      logger.info(`✅ Seeded ${createdCities.length} cities.`);

      // 2. Seed Properties for each city
      logger.info("🏪 Generating properties for all cities...");
      let totalProps = 0;
      for (const city of createdCities) {
        const props = generateProperties(city);
        await Property.insertMany(props);
        totalProps += props.length;
      }
      logger.info(`✅ Seeded ${totalProps} properties across ${createdCities.length} cities.`);
    } else {
      logger.info(`Cities already seeded (${cityCount} found). Skipping.`);
    }

    // 3. Seed Supply Items
    const supplyCount = await SupplyItem.countDocuments();
    if (supplyCount === 0) {
      logger.info("📦 Seeding supply items...");
      await SupplyItem.create(SUPPLY_ITEMS);
      logger.info(`✅ Seeded ${SUPPLY_ITEMS.length} supply items.`);
    } else {
      logger.info(`Supply items already seeded (${supplyCount} found). Skipping.`);
    }
  } catch (err) {
    logger.error(`Database seeding failed: ${err.message}`);
  }
};
