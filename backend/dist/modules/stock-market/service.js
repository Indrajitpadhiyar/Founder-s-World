import { StockCompany, StockPrice, StockOrder, Portfolio } from './model.js';
import { User } from '../users/model.js';
import { Business } from '../business/model.js';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError.js';
import mongoose from 'mongoose';
import { redisClient } from '../../config/redis.js';
export class StockMarketService {
    async getStockList() {
        return StockCompany.find().sort({ ticker: 1 });
    }
    async getStockHistory(stockCompanyId, limit = 50) {
        return StockPrice.find({ stockCompanyId })
            .sort({ timestamp: -1 })
            .limit(limit);
    }
    async getPortfolio(userId) {
        return Portfolio.find({ userId }).populate('stockCompanyId');
    }
    async buyStockMarket(userId, stockCompanyId, sharesCount) {
        if (sharesCount <= 0) {
            throw new BadRequestError('Shares count must be greater than zero');
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const stock = await StockCompany.findById(stockCompanyId).session(session);
            if (!stock) {
                throw new NotFoundError('Stock ticker not found');
            }
            const totalCost = Math.round(sharesCount * stock.currentPrice);
            const user = await User.findById(userId).session(session);
            if (!user) {
                throw new NotFoundError('User not found');
            }
            if (user.cash < totalCost) {
                throw new BadRequestError(`Insufficient cash. You need $${totalCost} but only have $${user.cash}.`);
            }
            // Deduct cash
            user.cash -= totalCost;
            await user.save({ session });
            // Update Portfolio
            let portfolio = await Portfolio.findOne({ userId, stockCompanyId }).session(session);
            if (portfolio) {
                const totalShares = portfolio.sharesOwned + sharesCount;
                const totalSpent = (portfolio.averageCost * portfolio.sharesOwned) + totalCost;
                portfolio.averageCost = Math.round(totalSpent / totalShares);
                portfolio.sharesOwned = totalShares;
                await portfolio.save({ session });
            }
            else {
                portfolio = new Portfolio({
                    userId,
                    stockCompanyId,
                    sharesOwned: sharesCount,
                    averageCost: stock.currentPrice,
                });
                await portfolio.save({ session });
            }
            // Create executed order history
            const order = new StockOrder({
                userId,
                stockCompanyId,
                orderType: 'buy',
                priceType: 'market',
                price: stock.currentPrice,
                totalShares: sharesCount,
                filledShares: sharesCount,
                status: 'completed',
            });
            await order.save({ session });
            // Increment price slightly based on demand (market dynamics)
            stock.currentPrice = parseFloat((stock.currentPrice * (1 + 0.0005 * sharesCount)).toFixed(2));
            stock.marketCap = Math.round(stock.currentPrice * stock.sharesIssued);
            await stock.save({ session });
            // Save price history
            await StockPrice.create([{ stockCompanyId, price: stock.currentPrice, timestamp: new Date() }], { session });
            await session.commitTransaction();
            session.endSession();
            return { portfolio, cash: user.cash };
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    async sellStockMarket(userId, stockCompanyId, sharesCount) {
        if (sharesCount <= 0) {
            throw new BadRequestError('Shares count must be greater than zero');
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const stock = await StockCompany.findById(stockCompanyId).session(session);
            if (!stock) {
                throw new NotFoundError('Stock ticker not found');
            }
            const portfolio = await Portfolio.findOne({ userId, stockCompanyId }).session(session);
            if (!portfolio || portfolio.sharesOwned < sharesCount) {
                throw new BadRequestError(`You do not own enough shares to sell. Owned: ${portfolio?.sharesOwned || 0}`);
            }
            const totalEarnings = Math.round(sharesCount * stock.currentPrice);
            const user = await User.findById(userId).session(session);
            if (!user) {
                throw new NotFoundError('User not found');
            }
            // Add cash
            user.cash += totalEarnings;
            await user.save({ session });
            // Decrement portfolio
            portfolio.sharesOwned -= sharesCount;
            if (portfolio.sharesOwned === 0) {
                await portfolio.deleteOne({ session });
            }
            else {
                await portfolio.save({ session });
            }
            // Order record
            const order = new StockOrder({
                userId,
                stockCompanyId,
                orderType: 'sell',
                priceType: 'market',
                price: stock.currentPrice,
                totalShares: sharesCount,
                filledShares: sharesCount,
                status: 'completed',
            });
            await order.save({ session });
            // Decrement price slightly due to selling pressure
            stock.currentPrice = parseFloat(Math.max(0.01, stock.currentPrice * (1 - 0.0005 * sharesCount)).toFixed(2));
            stock.marketCap = Math.round(stock.currentPrice * stock.sharesIssued);
            await stock.save({ session });
            // Save price history
            await StockPrice.create([{ stockCompanyId, price: stock.currentPrice, timestamp: new Date() }], { session });
            await session.commitTransaction();
            session.endSession();
            return { portfolio: portfolio.sharesOwned > 0 ? portfolio : null, cash: user.cash };
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    async ipoBusiness(userId, businessId, ticker) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const business = await Business.findById(businessId).session(session);
            if (!business || business.userId.toString() !== userId) {
                throw new NotFoundError('Business not found');
            }
            // Check if already IPO-ed
            const existingStock = await StockCompany.findOne({ companyId: businessId }).session(session);
            if (existingStock) {
                throw new BadRequestError('This business is already publicly traded');
            }
            // Check ticker uniqueness
            const existingTicker = await StockCompany.findOne({ ticker: ticker.toUpperCase() }).session(session);
            if (existingTicker) {
                throw new BadRequestError(`Ticker '${ticker}' is already taken`);
            }
            // Valuation formula: profit rate per minute * 1000. Require min $100M valuation
            const netProfitPerMin = business.revenueRate - business.expenseRate;
            const valuation = netProfitPerMin * 2000; // e.g. $90k profit/min -> $180M valuation
            if (valuation < 100000000) {
                throw new BadRequestError(`Business valuation is too low: $${valuation.toLocaleString()}. Min required is $100,000,000. Upgrade business to increase value.`);
            }
            const totalShares = 10000000; // 10M shares issued
            const initialPrice = parseFloat((valuation / totalShares).toFixed(2)); // e.g. $18 per share
            const user = await User.findById(userId).session(session);
            if (!user) {
                throw new NotFoundError('User not found');
            }
            // IPO event: Sell 40% of shares to public, keep 60% in portfolio.
            // Receive 40% of valuation in cash immediately.
            const cashGain = Math.round(valuation * 0.4);
            user.cash += cashGain;
            user.netWorth += cashGain; // Increases user wealth
            await user.save({ session });
            // Create Stock Company listing
            const stockCompany = new StockCompany({
                ticker: ticker.toUpperCase(),
                name: business.name,
                category: business.category,
                currentPrice: initialPrice,
                initialPrice,
                sharesIssued: totalShares,
                marketCap: valuation,
                isPlayerCompany: true,
                companyId: business._id,
                valuation,
            });
            await stockCompany.save({ session });
            // Create owner portfolio holding (60% remaining)
            const portfolio = new Portfolio({
                userId,
                stockCompanyId: stockCompany._id,
                sharesOwned: Math.round(totalShares * 0.6),
                averageCost: initialPrice,
            });
            await portfolio.save({ session });
            // Initial price history record
            await StockPrice.create([{ stockCompanyId: stockCompany._id, price: initialPrice, timestamp: new Date() }], { session });
            await session.commitTransaction();
            session.endSession();
            return { stockCompany, portfolio, cashGain, userCash: user.cash };
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    async tickStockSimulation() {
        // Simulates standard random walk fluctuation for all tickers
        const stocks = await StockCompany.find();
        const updatedStocks = [];
        for (const stock of stocks) {
            const volatility = stock.volatility;
            // Random walk: Brownian motion approximation
            // mean 0, variance based on volatility
            const changePercent = (Math.random() - 0.5) * 2 * volatility; // e.g. -15% to +15%
            const multiplier = 1 + (changePercent * 0.1); // Scaled down to prevent extreme steps in 5s ticks (e.g. max 1.5% tick variance)
            const oldPrice = stock.currentPrice;
            stock.currentPrice = parseFloat(Math.max(0.01, oldPrice * multiplier).toFixed(2));
            stock.marketCap = Math.round(stock.currentPrice * stock.sharesIssued);
            await stock.save();
            // Write to Redis cache for instant access
            if (redisClient) {
                await redisClient.set(`stock:ticker:${stock.ticker}`, stock.currentPrice).catch(() => { });
            }
            // Add to db price history periodically (e.g., we record history every tick, limit it to recent)
            await StockPrice.create({
                stockCompanyId: stock._id,
                price: stock.currentPrice,
                timestamp: new Date(),
            });
            updatedStocks.push({
                id: stock._id,
                ticker: stock.ticker,
                price: stock.currentPrice,
                change: parseFloat((stock.currentPrice - oldPrice).toFixed(2)),
            });
        }
        return updatedStocks;
    }
}
//# sourceMappingURL=service.js.map