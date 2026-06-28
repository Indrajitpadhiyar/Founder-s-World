import { Router } from 'express';
import { StockMarketController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';
const router = Router();
const controller = new StockMarketController();
router.get('/', authenticate, controller.getStocks);
router.get('/portfolio', authenticate, controller.getPortfolio);
router.get('/history/:id', authenticate, controller.getHistory);
router.post('/buy', authenticate, controller.buyStock);
router.post('/sell', authenticate, controller.sellStock);
router.post('/ipo', authenticate, controller.launchIpo);
export default router;
//# sourceMappingURL=routes.js.map