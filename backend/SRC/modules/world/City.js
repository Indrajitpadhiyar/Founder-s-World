import { Schema, model } from "mongoose";

const DistrictSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["commercial", "residential", "industrial", "mixed", "market", "office"],
    default: "mixed",
  },
  footTraffic: { type: Number, default: 50, min: 0, max: 100 },
  populationDensity: { type: Number, default: 50, min: 0, max: 100 },
  safetyRating: { type: Number, default: 60, min: 0, max: 100 },
  growthPotential: { type: Number, default: 50, min: 0, max: 100 },
  avgRentPerSqFt: { type: Number, default: 30 },
}, { _id: false });

const CitySchema = new Schema(
  {
    name: { type: String, required: true },
    state: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    population: { type: Number, required: true },
    averageIncome: { type: Number, default: 30000 }, // yearly INR equivalent in $
    crimeRate: { type: Number, default: 30, min: 0, max: 100 },
    economicGrowth: { type: Number, default: 5 }, // percentage
    tourism: { type: Number, default: 40, min: 0, max: 100 },
    employmentRate: { type: Number, default: 70, min: 0, max: 100 },
    districts: [DistrictSchema],
  },
  { timestamps: true }
);

export const City = model("City", CitySchema);
export default City;
