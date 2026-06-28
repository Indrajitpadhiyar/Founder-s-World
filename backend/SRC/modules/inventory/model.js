import { Schema, model } from "mongoose";

const WarehouseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 1000,
    },
    usedCapacity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const InventorySchema = new Schema(
  {
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    averageCost: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Create compound index for easy lookups
InventorySchema.index({ warehouseId: 1, productId: 1 }, { unique: true });

export const Warehouse = model("Warehouse", WarehouseSchema);
export const Inventory = model("Inventory", InventorySchema);
