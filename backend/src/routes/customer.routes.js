import { Router } from "express";
import CustomerController from "../controllers/CustomerController.js";

const router = Router();

// GET /api/customers/:cpf
router.get("/:cpf", (req, res) => CustomerController.getByCPF(req, res));

// GET /api/customers/:cpf/fidelity - Informações completas de fidelização
router.get("/:cpf/fidelity", (req, res) => CustomerController.getFidelityInfo(req, res));

// POST /api/customers
router.post("/", (req, res) => CustomerController.create(req, res));

export default router;