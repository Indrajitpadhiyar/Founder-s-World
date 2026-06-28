import { Router } from 'express';
import { BusinessController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validation.js';
import { createBusinessSchema } from './validator.js';
const router = Router();
const businessController = new BusinessController();
router.get('/', authenticate, businessController.list);
router.post('/', authenticate, validateRequest(createBusinessSchema), businessController.create);
router.post('/:id/upgrade', authenticate, businessController.upgrade);
router.post('/:id/collect', authenticate, businessController.collect);
export default router;
//# sourceMappingURL=routes.js.map