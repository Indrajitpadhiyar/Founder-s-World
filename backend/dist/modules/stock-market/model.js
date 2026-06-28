import { Schema, model } from 'mongoose';
const StockCompanySchema = new Schema({
    ticker: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
    },
    currentPrice: {
        type: Number,
        required: true,
        default: 10,
    },
    initialPrice: {
        type: Number,
        required: true,
        default: 10,
    },
    sharesIssued: {
        type: Number,
        required: true,
        default: 1000000,
    },
    marketCap: {
        type: Number,
        required: true,
        default: 10000000,
    },
    volatility: {
        type: Number,
        default: 0.15, // 15% random variation limit
    },
    isPlayerCompany: {
        type: Boolean,
        default: false,
        index: true,
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        index: true,
    },
    valuation: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const StockPriceSchema = new Schema({
    stockCompanyId: {
        type: Schema.Types.ObjectId,
        ref: 'StockCompany',
        required: true,
        index: true,
    },
    price: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
});
const StockOrderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    stockCompanyId: {
        type: Schema.Types.ObjectId,
        ref: 'StockCompany',
        required: true,
        index: true,
    },
    orderType: {
        type: String,
        enum: ['buy', 'sell'],
        required: true,
    },
    priceType: {
        type: String,
        enum: ['market', 'limit'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    totalShares: {
        type: Number,
        required: true,
        min: 1,
    },
    filledShares: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
        index: true,
    },
}, {
    timestamps: true,
});
const PortfolioSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    stockCompanyId: {
        type: Schema.Types.ObjectId,
        ref: 'StockCompany',
        required: true,
        index: true,
    },
    sharesOwned: {
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
}, {
    timestamps: true,
});
PortfolioSchema.index({ userId: 1, stockCompanyId: 1 }, { unique: true });
export const StockCompany = model('StockCompany', StockCompanySchema);
export const StockPrice = model('StockPrice', StockPriceSchema);
export const StockOrder = model('StockOrder', StockOrderSchema);
export const Portfolio = model('Portfolio', PortfolioSchema);
//# sourceMappingURL=model.js.map