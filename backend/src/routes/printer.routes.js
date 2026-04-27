import { Router } from "express";
import PrinterController from "../controllers/PrinterController.js";

const router = Router();

// GET all printers
router.get("/", (req, res) => PrinterController.getAll(req, res));

// GET default printer
router.get("/default", (req, res) => PrinterController.get(req, res));

// GET printer by ID
router.get("/:id", (req, res) => PrinterController.getById(req, res));

// POST create new printer
router.post("/", (req, res) => PrinterController.create(req, res));

// PUT update printer
router.put("/:id", (req, res) => PrinterController.update(req, res));

// DELETE printer
router.delete("/:id", (req, res) => PrinterController.delete(req, res));

// PATCH update printer status
router.patch("/:id/status", (req, res) => PrinterController.updateStatus(req, res));

// POST print receipt
router.post("/receipt/print", (req, res) => PrinterController.printReceipt(req, res));

// POST print (legacy)
router.post("/print", (req, res) => PrinterController.print(req, res));

export default router;