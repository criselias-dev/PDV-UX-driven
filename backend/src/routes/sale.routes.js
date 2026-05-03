import { Router } from "express";
import SaleController from "../controllers/SaleController.js";

const router = Router();

// Wrapper to handle async errors
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

// POST /api/sales - Start a new sale
router.post("/", asyncHandler((req, res) => SaleController.startSale(req, res)));

// POST /api/sales/customer - Set customer for sale
router.post("/customer", asyncHandler((req, res) => SaleController.setCustomer(req, res)));

// POST /api/sales/items - Add item to sale
router.post("/items", asyncHandler((req, res) => SaleController.addItem(req, res)));

// POST /api/sales/items/cancel - Cancel item from sale
router.post("/items/cancel", asyncHandler((req, res) => SaleController.cancelItem(req, res)));

// GET /api/sales/:saleId - Get sale details
router.get("/:saleId", asyncHandler((req, res) => SaleController.getSale(req, res)));

// POST /api/sales/:saleId/close - Close sale
router.post("/:saleId/close", asyncHandler((req, res) => SaleController.closeSale(req, res)));

export default router;