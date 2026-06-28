import { Business } from './model.js';
import { User } from '../users/model.js';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError.js';
import mongoose from 'mongoose';
import { redisClient } from '../../config/redis.js';
const CATEGORY_CONFIGS = {
    retail: { startupCost: 10000, baseRevenue: 600, baseExpense: 100 },
    agriculture: { startupCost: 25000, baseRevenue: 1800, baseExpense: 300 },
    manufacturing: { startupCost: 100000, baseRevenue: 9000, baseExpense: 1500 },
    tech: { startupCost: 250000, baseRevenue: 25000, baseExpense: 5000 },
    energy: { startupCost: 1000000, baseRevenue: 120000, baseExpense: 30000 },
};
export class BusinessService {
    async createBusiness(userId, name, category) {
        const config = CATEGORY_CONFIGS[category];
        if (!config) {
            throw new BadRequestError('Invalid business category');
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findById(userId).session(session);
            if (!user) {
                throw new NotFoundError('User not found');
            }
            if (user.cash < config.startupCost) {
                throw new BadRequestError(`Insufficient funds. You need $${config.startupCost} to start a ${category} business.`);
            }
            // Deduct cash
            user.cash -= config.startupCost;
            await user.save({ session });
            const newBusiness = new Business({
                userId,
                name,
                category,
                revenueRate: config.baseRevenue,
                expenseRate: config.baseExpense,
                lastCollectedAt: new Date(),
            });
            await newBusiness.save({ session });
            // Update wealth leaderboard in Redis
            if (redisClient) {
                await redisClient.zadd('leaderboard:wealth', user.netWorth, user.username).catch(() => { });
            }
            await session.commitTransaction();
            session.endSession();
            return newBusiness;
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    async getUserBusinesses(userId) {
        return Business.find({ userId });
    }
    async upgradeBusiness(userId, businessId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const business = await Business.findById(businessId).session(session);
            if (!business || business.userId.toString() !== userId) {
                throw new NotFoundError('Business not found');
            }
            const config = CATEGORY_CONFIGS[business.category];
            const upgradeCost = Math.round(config.startupCost * Math.pow(1.5, business.level));
            const user = await User.findById(userId).session(session);
            if (!user) {
                throw new NotFoundError('User not found');
            }
            if (user.cash < upgradeCost) {
                throw new BadRequestError(`Insufficient funds. Upgrading to level ${business.level + 1} costs $${upgradeCost}.`);
            }
            // Deduct cost and save user
            user.cash -= upgradeCost;
            await user.save({ session });
            // Upgrade business attributes
            business.level += 1;
            business.revenueRate = Math.round(config.baseRevenue * Math.pow(1.3, business.level - 1));
            business.expenseRate = Math.round(config.baseExpense * Math.pow(1.2, business.level - 1));
            business.marketShare = Math.min(30, business.marketShare + 0.15 * business.level); // Max 30% share
            await business.save({ session });
            await session.commitTransaction();
            session.endSession();
            return business;
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    async collectRevenue(userId, businessId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const business = await Business.findById(businessId).session(session);
            if (!business || business.userId.toString() !== userId) {
                throw new NotFoundError('Business not found');
            }
            const now = new Date();
            const diffMs = now.getTime() - new Date(business.lastCollectedAt).getTime();
            const diffMinutes = diffMs / (1000 * 60);
            if (diffMinutes < 0.05) {
                throw new BadRequestError('Must wait at least 3 seconds between cash collections');
            }
            const netIncomeRate = business.revenueRate - business.expenseRate;
            const collectedAmount = Math.round(diffMinutes * netIncomeRate);
            if (collectedAmount <= 0) {
                throw new BadRequestError('No earnings accumulated yet');
            }
            const user = await User.findById(userId).session(session);
            if (!user) {
                throw new NotFoundError('User not found');
            }
            user.cash += collectedAmount;
            user.netWorth += collectedAmount;
            await user.save({ session });
            business.lastCollectedAt = now;
            await business.save({ session });
            if (redisClient) {
                await redisClient.zadd('leaderboard:wealth', user.netWorth, user.username).catch(() => { });
            }
            await session.commitTransaction();
            session.endSession();
            return { collectedAmount, cash: user.cash };
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}
//# sourceMappingURL=service.js.map