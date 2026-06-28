import { Router } from 'express';
import { FactoryController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';
const router = Router();
const controller = new FactoryController();
router.get('/', authenticate, controller.list);
router.post('/', authenticate, controller.create);
router.post('/:id/upgrade', authenticate, controller.upgrade);
router.post('/:id/toggle', authenticate, controller.toggle);
export default router;
//# sourceMappingURL=routes.js.map