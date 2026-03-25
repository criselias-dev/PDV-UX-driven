import { Router } from "express";
import PrinterController from "../controllers/PrinterController.js";

const router = Router();

// POST /api/printer/print
router.post("/print", (req, res) => PrinterController.print(req, res));

export default router;