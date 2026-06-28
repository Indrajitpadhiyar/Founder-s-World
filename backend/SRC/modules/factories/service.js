import { Factory } from "./model.js";
import { User } from "../users/model.js";
import { Warehouse, Inventory } from "../inventory/model.js";
import { Product } from "../products/model.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../common/errors/AppError.js";
import mongoose from "mongoose";

export class FactoryService {
  async createFactory(userId, name, productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const startupCost = 150000; // Standard factory build cost: $150k

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      if (user.cash < startupCost) {
        throw new BadRequestError(
          `Insufficient cash. Constructing a factory costs $${startupCost}.`,
        );
      }

      user.cash -= startupCost;
      await user.save({ session });

      const factory = new Factory({
        userId,
        name,
        productId,
        machinesCount: 1,
        workersCount: 2,
        upgradeLevel: 1,
        isProducing: false,
        productionProgress: 0,
      });

      await factory.save({ session });

      await session.commitTransaction();
      session.endSession();

      return factory;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getUserFactories(userId) {
    return Factory.find({ userId }).populate("productId");
  }

  async upgradeFactory(userId, factoryId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const factory = await Factory.findById(factoryId).session(session);
      if (!factory || factory.userId.toString() !== userId) {
        throw new NotFoundError("Factory not found");
      }

      const upgradeCost = Math.round(
        50000 * Math.pow(1.8, factory.upgradeLevel),
      );

      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      if (user.cash < upgradeCost) {
        throw new BadRequestError(
          `Insufficient cash. Upgrading costs $${upgradeCost}.`,
        );
      }

      user.cash -= upgradeCost;
      await user.save({ session });

      factory.upgradeLevel += 1;
      factory.machinesCount += 1;
      factory.workersCount += 2;
      factory.efficiency = Math.max(70, factory.efficiency - 2); // Slightly lower efficiency unless workers trained

      await factory.save({ session });

      await session.commitTransaction();
      session.endSession();

      return factory;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async toggleProduction(userId, factoryId) {
    const factory = await Factory.findById(factoryId);
    if (!factory || factory.userId.toString() !== userId) {
      throw new NotFoundError("Factory not found");
    }

    factory.isProducing = !factory.isProducing;
    if (factory.isProducing) {
      factory.lastTickAt = new Date();
    }
    await factory.save();

    return factory;
  }

  async tickFactories() {
    // 1. Fetch active producing factories
    const activeFactories = await Factory.find({ isProducing: true });
    const completedProductions = [];

    for (const factory of activeFactories) {
      // Production rate depends on upgradeLevel, machines, and workers
      const progressIncrement = factory.upgradeLevel * 5; // e.g. level 1 factory adds 5% per tick
      factory.productionProgress += progressIncrement;
      factory.lastTickAt = new Date();

      if (factory.productionProgress >= 100) {
        // Complete 1 batch of production!
        factory.productionProgress = 0;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Find user's warehouse in same or default location
          const warehouse = await Warehouse.findOne({
            userId: factory.userId,
          }).session(session);
          if (warehouse) {
            const product = await Product.findById(factory.productId).session(
              session,
            );
            if (product && warehouse.usedCapacity < warehouse.capacity) {
              // Add to inventory
              let invItem = await Inventory.findOne({
                warehouseId: warehouse._id,
                productId: factory.productId,
              }).session(session);

              const costOfProduction = Math.round(product.baseCost * 0.8); // 20% savings when self-manufactured

              if (invItem) {
                const totalCost =
                  invItem.averageCost * invItem.quantity + costOfProduction;
                invItem.quantity += 1;
                invItem.averageCost = Math.round(totalCost / invItem.quantity);
                await invItem.save({ session });
              } else {
                invItem = new Inventory({
                  warehouseId: warehouse._id,
                  productId: factory.productId,
                  quantity: 1,
                  averageCost: costOfProduction,
                });
                await invItem.save({ session });
              }

              // Update warehouse capacity
              warehouse.usedCapacity += 1;
              await warehouse.save({ session });

              completedProductions.push({
                userId: factory.userId,
                productId: factory.productId,
                productName: product.name,
                warehouseId: warehouse._id,
              });
            } else {
              // Warehouse full! Pause production
              factory.isProducing = false;
            }
          } else {
            // No warehouse! Pause production
            factory.isProducing = false;
          }

          await factory.save({ session });
          await session.commitTransaction();
          session.endSession();
        } catch (err) {
          await session.abortTransaction();
          session.endSession();
        }
      } else {
        await factory.save();
      }
    }

    return completedProductions;
  }
}
export default FactoryService;
