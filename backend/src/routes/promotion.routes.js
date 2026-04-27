import { Router } from "express";
import PromotionController from "../controllers/PromotionController.js";

const router = Router();

// GET all promotions
router.get("/", (req, res) => PromotionController.getAll(req, res));

// GET active promotions
router.get("/active", (req, res) => PromotionController.getActive(req, res));

// GET promotion by ID
router.get("/:id", (req, res) => PromotionController.getById(req, res));

// GET promotions by product ID
router.get("/product/:productId", (req, res) => PromotionController.getByProductId(req, res));

// POST create new promotion
router.post("/", (req, res) => PromotionController.create(req, res));

// PUT update promotion
router.put("/:id", (req, res) => PromotionController.update(req, res));

// DELETE promotion
router.delete("/:id", (req, res) => PromotionController.delete(req, res));

// PATCH toggle active status
router.patch("/:id/toggle", (req, res) => PromotionController.toggleActive(req, res));

export default router;