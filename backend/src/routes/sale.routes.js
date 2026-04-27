import { Router } from "express";
import SaleController from "../controllers/SaleController.js";

const router = Router();

// POST /api/sales - Start a new sale
router.post("/", (req, res) => SaleController.startSale(req, res));

// POST /api/sales/customer - Set customer for sale
router.post("/customer", (req, res) => SaleController.setCustomer(req, res));

// POST /api/sales/items - Add item to sale
router.post("/items", (req, res) => SaleController.addItem(req, res));

// POST /api/sales/items/cancel - Cancel item from sale
router.post("/items/cancel", (req, res) => SaleController.cancelItem(req, res));

// GET /api/sales/:saleId - Get sale details
router.get("/:saleId", (req, res) => SaleController.getSale(req, res));

// POST /api/sales/:saleId/close - Close sale
router.post("/:saleId/close", (req, res) => SaleController.closeSale(req, res));

export default router;