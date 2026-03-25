import { Router } from "express";
import ProductController from "../controllers/ProductController.js";

const router = Router();

router.get("/", (req, res) => ProductController.getAll(req, res));
router.get("/:id", (req, res) => ProductController.getById(req, res));

export default router;