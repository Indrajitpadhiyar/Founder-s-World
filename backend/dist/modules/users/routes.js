import { Router } from 'express';
import { UserController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';
const router = Router();
const userController = new UserController();
router.get('/profile', authenticate, userController.getProfile);
router.get('/leaderboard', userController.getLeaderboard);
export default router;
//# sourceMappingURL=routes.js.map