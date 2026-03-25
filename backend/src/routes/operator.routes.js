import { Router } from "express";
import OperatorController from "../controllers/OperatorController.js";

const router = Router();

// POST /api/operator/login
router.post("/login", (req, res) => OperatorController.login(req, res));

// GET /api/operator/status
router.get("/status", (req, res) => OperatorController.status(req, res));

export default router;