import { Router } from "express";
import SaleController from "../controllers/SaleController.js";

const router = Router();

// POST /api/sales
router.post("/", (req, res) => SaleController.startSale(req, res));

// POST /api/sales/items
router.post("/items", (req, res) => SaleController.addItem(req, res));

// POST /api/sales/items/cancel
router.post("/items/cancel", (req, res) => SaleController.cancelItem(req, res));

// GET /api/sales/:saleId
router.get("/:saleId", (req, res) => SaleController.getSale(req, res));

// POST /api/sales/:saleId/close
router.post("/:saleId/close", (req, res) => SaleController.closeSale(req, res));

export default router;