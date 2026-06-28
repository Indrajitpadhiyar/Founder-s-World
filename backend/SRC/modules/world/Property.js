import { Schema, model } from "mongoose";

const LeaseTermsSchema = new Schema({
  startDate: { type: Date },
  endDate: { type: Date },
  monthlyRent: { type: Number },
  deposit: { type: Number },
  maintenanceFee: { type: Number, default: 0 },
}, { _id: false });

const CustomerDemographicsSchema = new Schema({
  averageAge: { type: Number, default: 30 },
  incomeLevel: { type: String, enum: ["low", "middle", "upper_middle", "high"], default: "middle" },
  spendingHabit: { type: String, enum: ["frugal", "moderate", "generous"], default: "moderate" },
}, { _id: false });

const PropertySchema = new Schema(
  {
    cityId: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    districtName: { type: String, required: true },
    address: { type: String, required: true },
    type: {
      type: String,
      enum: ["shop", "office", "warehouse", "factory", "apartment", "villa", "land"],
      required: true,
    },
    size: { type: Number, required: true }, // sq ft
    monthlyRent: { type: Number, required: true },
    salePrice: { type: Number, default: 0 }, // 0 = not for sale
    deposit: { type: Number, required: true },
    footTraffic: { type: Number, default: 50, min: 0, max: 100 },
    nearbyCompetitors: { type: Number, default: 0 },
    nearbySuppliers: { type: Number, default: 0 },
    parking: { type: Boolean, default: false },
    publicTransport: { type: Boolean, default: true },
    safetyRating: { type: Number, default: 60, min: 0, max: 100 },
    growthPotential: { type: Number, default: 50, min: 0, max: 100 },
    customerDemographics: { type: CustomerDemographicsSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["available", "rented", "sold"],
      default: "available",
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    leaseTerms: { type: LeaseTermsSchema, default: null },
  },
  { timestamps: true }
);

// Compound index for fast city+status queries
PropertySchema.index({ cityId: 1, status: 1 });
PropertySchema.index({ cityId: 1, districtName: 1 });

export const Property = model("Property", PropertySchema);
export default Property;
