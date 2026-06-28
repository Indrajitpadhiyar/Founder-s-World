import { Router } from 'express';
import { AuthController } from './controller.js';
import { validateRequest } from '../../middlewares/validation.js';
import { registerSchema, loginSchema } from './validator.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.js';
const router = Router();
const authController = new AuthController();
router.post('/signup', authRateLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', authRateLimiter, authController.refresh);
router.post('/logout', authController.logout);
export default router;
//# sourceMappingURL=routes.js.map