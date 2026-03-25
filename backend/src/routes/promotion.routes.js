import { Router } from "express";
import PromotionController from "../controllers/PromotionController.js";

const router = Router();

// GET /api/promotions/active
router.get("/active", (req, res) => PromotionController.getActive(req, res));

export default router;