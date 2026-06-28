import { Product } from '../modules/products/model.js';
import { StockCompany } from '../modules/stock-market/model.js';
import { logger } from '../config/logger.js';
export const seedDatabase = async () => {
    try {
        // 1. Seed Products if empty
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            logger.info('Seeding default products into database...');
            await Product.create([
                { name: 'Organic Grain', category: 'agriculture', sku: 'AGR-GRAIN-001', baseCost: 10, basePrice: 15, demandFactor: 1.2, popularity: 60 },
                { name: 'Smartphone Pro', category: 'tech', sku: 'TEC-PHONE-002', baseCost: 400, basePrice: 700, demandFactor: 1.8, popularity: 90 },
                { name: 'Industrial Steel', category: 'manufacturing', sku: 'MAN-STEEL-003', baseCost: 50, basePrice: 80, demandFactor: 1.0, popularity: 50 },
                { name: 'Lithium Battery Pack', category: 'energy', sku: 'ENG-BATTERY-004', baseCost: 200, basePrice: 350, demandFactor: 1.5, popularity: 75 },
            ]);
            logger.info('Seeding default products completed.');
        }
        // 2. Seed Stock Companies if empty
        const stockCount = await StockCompany.countDocuments();
        if (stockCount === 0) {
            logger.info('Seeding default AI stock market companies...');
            await StockCompany.create([
                { ticker: 'APPL', name: 'Apex Electronics', category: 'tech', currentPrice: 150.0, initialPrice: 150.0, sharesIssued: 50000000, marketCap: 7500000000, volatility: 0.12, isPlayerCompany: false, valuation: 7500000000 },
                { ticker: 'GOGL', name: 'GigaSearch Corp', category: 'tech', currentPrice: 2400.0, initialPrice: 2400.0, sharesIssued: 10000000, marketCap: 24000000000, volatility: 0.10, isPlayerCompany: false, valuation: 24000000000 },
                { ticker: 'TSL', name: 'Thorium Electric', category: 'energy', currentPrice: 80.0, initialPrice: 80.0, sharesIssued: 100000000, marketCap: 8000000000, volatility: 0.25, isPlayerCompany: false, valuation: 8000000000 },
                { ticker: 'AMZ', name: 'Atlantic Commerce', category: 'retail', currentPrice: 110.0, initialPrice: 110.0, sharesIssued: 90000000, marketCap: 9900000000, volatility: 0.15, isPlayerCompany: false, valuation: 9900000000 },
            ]);
            logger.info('Seeding default AI stock companies completed.');
        }
    }
    catch (err) {
        logger.error(`Database seeding failed: ${err.message}`);
    }
};
//# sourceMappingURL=seed.js.map