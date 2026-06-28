import { SupplyItem } from "./SupplyItem.js";
import { Character } from "../character/Character.js";
import { Business } from "../business/model.js";
import { Transaction } from "../economy/Transaction.js";
import { NotFoundError, BadRequestError } from "../../common/errors/AppError.js";

export class SupplyService {
  async getAllItems(filters = {}) {
    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.subCategory) query.subCategory = filters.subCategory;
    if (filters.usedBy) query.usedBy = filters.usedBy;

    return SupplyItem.find(query).sort({ name: 1 }).lean();
  }

  async getItemsForBusiness(businessCategory) {
    // Return items that this business type typically uses
    return SupplyItem.find({ usedBy: businessCategory }).sort({ basePrice: 1 }).lean();
  }

  async purchaseSupply(userId, data) {
    const { businessId, supplyItemId, quantity } = data;

    if (!quantity || quantity < 1) throw new BadRequestError("Quantity must be at least 1");

    const [character, business, item] = await Promise.all([
      Character.findOne({ userId }),
      Business.findById(businessId),
      SupplyItem.findById(supplyItemId),
    ]);

    if (!character) throw new NotFoundError("Character not found");
    if (!business) throw new NotFoundError("Business not found");
    if (!item) throw new NotFoundError("Supply item not found");
    if (!business.ownerId.equals(userId)) throw new BadRequestError("You don't own this business");

    // Price fluctuation: ±10% from base price
    const priceMod = 0.9 + Math.random() * 0.2;
    const unitPrice = Math.round(item.basePrice * priceMod * 100) / 100;
    const totalCost = Math.round(unitPrice * quantity * 100) / 100;

    if (character.cash < totalCost) {
      throw new BadRequestError(
        `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${character.cash.toFixed(2)}.`
      );
    }

    // Deduct cash
    character.cash -= totalCost;
    await character.save();

    // Add to business inventory
    const existingSlot = business.inventory.find(
      inv => inv.supplyItemId.equals(item._id)
    );
    if (existingSlot) {
      // Average the purchase price
      const oldTotal = existingSlot.purchasePrice * existingSlot.quantity;
      existingSlot.quantity += quantity;
      existingSlot.purchasePrice = Math.round(((oldTotal + totalCost) / existingSlot.quantity) * 100) / 100;
      // Set default selling price if not already set
      if (!existingSlot.sellingPrice) {
        existingSlot.sellingPrice = Math.round(unitPrice * 1.5 * 100) / 100; // 50% markup default
      }
      if (item.spoilRate > 0) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + item.spoilRate);
        existingSlot.expiresAt = expDate;
      }
    } else {
      const expDate = item.spoilRate > 0 ? new Date(Date.now() + item.spoilRate * 86400000) : null;
      business.inventory.push({
        supplyItemId: item._id,
        name: item.name,
        quantity,
        purchasePrice: unitPrice,
        sellingPrice: Math.round(unitPrice * 1.5 * 100) / 100,
        expiresAt: expDate,
      });
    }

    await business.save();

    // Record transaction
    await Transaction.create({
      fromUserId: userId,
      toUserId: null,
      type: "supply_purchase",
      amount: totalCost,
      description: `Purchased ${quantity} ${item.unit}(s) of ${item.name}`,
      businessId: business._id,
      itemId: item._id,
      quantity,
      cityId: business.cityId,
    });

    return {
      item: item.name,
      quantity,
      unitPrice,
      totalCost,
      remainingCash: character.cash,
      message: `Purchased ${quantity} ${item.unit}(s) of ${item.name} for $${totalCost.toFixed(2)}`,
    };
  }
}
