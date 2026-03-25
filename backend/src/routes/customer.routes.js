import { Router } from "express";
import CustomerController from "../controllers/CustomerController.js";

const router = Router();

// GET /api/customers/:cpf
router.get("/:cpf", (req, res) => CustomerController.getByCPF(req, res));

export default router;