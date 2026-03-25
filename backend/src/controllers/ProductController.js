// backend/src/controllers/ProductController.js
import productService from '../services/ProductService.js';

class ProductController {
  async getById(req, res) {
    const { id } = req.params;

    try {
      const product = await productService.getById(id);
      res.json(product);
    } catch (err) {
      console.error("Erro ProductController:", err.message || err);
      res.status(404).json({ message: err.message || "Produto não encontrado" });
    }
  }

  async getAll(req, res) {
    try {
      const products = await productService.getAll();
      res.json(products);
    } catch (err) {
      console.error("Erro ProductController getAll:", err.message || err);
      res.status(500).json({ message: err.message || "Erro ao buscar produtos" });
    }
  }
}

export default new ProductController();