import { Router } from 'express';
import { InventoryController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';
const router = Router();
const controller = new InventoryController();
router.post('/warehouses', authenticate, controller.createWarehouse);
router.get('/warehouses', authenticate, controller.getWarehouses);
router.get('/warehouses/:warehouseId/items', authenticate, controller.getInventory);
export default router;
//# sourceMappingURL=routes.js.map