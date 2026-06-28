import { Schema, model } from "mongoose";

const TransactionSchema = new Schema(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        "purchase",       // customer buys from shop
        "supply_purchase", // business buys supplies
        "rent",           // monthly rent payment
        "deposit",        // security deposit
        "salary",         // employee salary
        "refund",         // customer refund
        "sale",           // sell property
        "tax",            // government tax
        "transfer",       // player-to-player transfer
        "system_reward",  // tutorial/quest rewards
      ],
    },
    amount: { type: Number, required: true },
    description: { type: String, default: "" },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", default: null },
    itemId: { type: Schema.Types.ObjectId, ref: "SupplyItem", default: null },
    quantity: { type: Number, default: null },
    cityId: { type: Schema.Types.ObjectId, ref: "City", default: null },
  },
  { timestamps: true }
);

// Fast lookups for transaction history
TransactionSchema.index({ fromUserId: 1, createdAt: -1 });
TransactionSchema.index({ toUserId: 1, createdAt: -1 });
TransactionSchema.index({ businessId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, createdAt: -1 });

export const Transaction = model("Transaction", TransactionSchema);
export default Transaction;
