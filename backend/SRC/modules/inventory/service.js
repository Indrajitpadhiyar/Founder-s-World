import { Warehouse, Inventory } from "./model.js";
import { User } from "../users/model.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../common/errors/AppError.js";
import mongoose from "mongoose";

export class InventoryService {
  async createWarehouse(userId, name, location) {
    const cost = 50000; // Build warehouse cost: $50k

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      if (user.cash < cost) {
        throw new BadRequestError(
          `Insufficient funds. Constructing a warehouse costs $${cost}.`,
        );
      }

      user.cash -= cost;
      await user.save({ session });

      const warehouse = new Warehouse({
        userId,
        name,
        location,
        capacity: 1000,
        usedCapacity: 0,
      });

      await warehouse.save({ session });

      await session.commitTransaction();
      session.endSession();

      return warehouse;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getWarehouses(userId) {
    return Warehouse.find({ userId });
  }

  async getInventory(warehouseId) {
    return Inventory.find({ warehouseId }).populate("productId");
  }
}
