import { Schema, model } from "mongoose";

const InventoryItemSchema = new Schema({
  supplyItemId: { type: Schema.Types.ObjectId, ref: "SupplyItem", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, default: 0, min: 0 },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
}, { _id: true });

const EmployeeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null }, // null = NPC employee
  name: { type: String, required: true },
  role: { type: String, default: "staff" },
  salary: { type: Number, required: true },
  skill: { type: Number, default: 30, min: 0, max: 100 },
  morale: { type: Number, default: 70, min: 0, max: 100 },
  hiredDate: { type: Date, default: Date.now },
}, { _id: true });

const BusinessSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true }, // Restaurant, Phone Shop, Clothing Store, etc.
    category: {
      type: String,
      required: true,
      enum: [
        "food", "retail", "clothing", "electronics", "furniture", "jewelry",
        "supermarket", "medical", "gym", "salon", "barber", "coffee", "bakery",
        "hotel", "travel", "logistics", "courier", "mechanic", "repair",
        "construction", "digital_marketing", "web_development", "ai_services",
        "graphic_design", "photography", "video_production", "software",
        "agriculture", "factory", "warehouse", "export", "import",
        "financial", "education", "healthcare", "entertainment", "sports",
        "automobile", "real_estate", "insurance", "transportation",
        "manufacturing", "custom"
      ],
    },
    logo: { type: String, default: "🏪" },
    brandColor: { type: String, default: "from-indigo-500 to-cyan-500" },
    cityId: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    districtName: { type: String, required: true },
    description: { type: String, default: "" },
    reputation: { type: Number, default: 10, min: 0, max: 100 },
    customerRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    operatingHours: {
      open: { type: Number, default: 9 },  // 24h format
      close: { type: Number, default: 21 },
    },
    inventory: [InventoryItemSchema],
    employees: [EmployeeSchema],
    monthlyRevenue: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCustomersServed: { type: Number, default: 0 },
    dailySalesLog: [{ // Rolling 30-day log
      date: { type: Date },
      revenue: { type: Number },
      customerCount: { type: Number },
      itemsSold: { type: Number },
    }],
  },
  { timestamps: true }
);

BusinessSchema.index({ cityId: 1, category: 1 });
BusinessSchema.index({ reputation: -1 });
BusinessSchema.index({ customerRating: -1 });

export const Business = model("Business", BusinessSchema);
export default Business;
