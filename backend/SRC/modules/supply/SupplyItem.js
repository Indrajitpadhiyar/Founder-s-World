import { Schema, model } from "mongoose";

const SupplyItemSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ["raw_material", "component", "finished_good", "consumable", "equipment"],
    },
    subCategory: { type: String, default: "" }, // e.g. "vegetables", "grains", "electronics"
    basePrice: { type: Number, required: true },
    unit: { type: String, required: true }, // kg, piece, liter, box, bundle
    spoilRate: { type: Number, default: 0 }, // 0 = durable, >0 = days until expiry
    weight: { type: Number, default: 1 }, // kg per unit, for logistics cost
    description: { type: String, default: "" },
    icon: { type: String, default: "📦" },
    // Which business categories need this item
    usedBy: [{ type: String }], // ["food", "restaurant", "bakery", etc.]
  },
  { timestamps: true }
);

SupplyItemSchema.index({ category: 1 });
SupplyItemSchema.index({ subCategory: 1 });

export const SupplyItem = model("SupplyItem", SupplyItemSchema);
export default SupplyItem;
