import { Router } from "express";
import { WorldController } from "./controller.js";
import { authenticate } from "../../middlewares/auth.js";

const router = Router();
const worldController = new WorldController();

// Public — browse cities & properties
router.get("/cities", worldController.getCities);
router.get("/cities/:slug", worldController.getCityBySlug);
router.get("/cities/:slug/properties", worldController.getProperties);

// Authenticated — interact with properties
router.get("/properties/:id", authenticate, worldController.getPropertyById);
router.post("/properties/:id/negotiate", authenticate, worldController.negotiate);
router.post("/properties/:id/sign-lease", authenticate, worldController.signLease);

export default router;
