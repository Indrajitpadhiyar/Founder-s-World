import { StockMarketService } from './service.js';
import { successResponse } from '../../common/responses/response.js';
export class StockMarketController {
    stockService = new StockMarketService();
    getStocks = async (req, res, next) => {
        try {
            const stocks = await this.stockService.getStockList();
            res.status(200).json(successResponse('Stock list fetched successfully', stocks));
        }
        catch (error) {
            next(error);
        }
    };
    getHistory = async (req, res, next) => {
        try {
            const { id } = req.params;
            const history = await this.stockService.getStockHistory(id);
            res.status(200).json(successResponse('Stock history fetched successfully', history));
        }
        catch (error) {
            next(error);
        }
    };
    getPortfolio = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const portfolio = await this.stockService.getPortfolio(userId);
            res.status(200).json(successResponse('User portfolio fetched successfully', portfolio));
        }
        catch (error) {
            next(error);
        }
    };
    buyStock = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { stockCompanyId, sharesCount } = req.body;
            const result = await this.stockService.buyStockMarket(userId, stockCompanyId, sharesCount);
            res.status(200).json(successResponse('Stock purchased successfully', result));
        }
        catch (error) {
            next(error);
        }
    };
    sellStock = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { stockCompanyId, sharesCount } = req.body;
            const result = await this.stockService.sellStockMarket(userId, stockCompanyId, sharesCount);
            res.status(200).json(successResponse('Stock sold successfully', result));
        }
        catch (error) {
            next(error);
        }
    };
    launchIpo = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { businessId, ticker } = req.body;
            const result = await this.stockService.ipoBusiness(userId, businessId, ticker);
            res.status(200).json(successResponse('IPO completed successfully! Stock is listed.', result));
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=controller.js.map