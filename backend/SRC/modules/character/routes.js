import { Router } from "express";
import { CharacterController } from "./controller.js";
import { authenticate } from "../../middlewares/auth.js";

const router = Router();
const characterController = new CharacterController();

// All character routes require authentication
router.use(authenticate);

router.post("/", characterController.create);
router.get("/", characterController.get);
router.post("/action", characterController.action);
router.post("/travel", characterController.travel);

export default router;
