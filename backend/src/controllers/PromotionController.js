// backend/src/controllers/PromotionController.js
import promotionService from '../services/PromotionService.js';

class PromotionController {
  async getAll(req, res) {
    try {
      const promotions = await promotionService.getAll();
      res.json(promotions);
    } catch (err) {
      console.error("Erro PromotionController getAll:", err.message || err);
      res.status(500).json({ message: err.message || "Erro ao carregar promoções" });
    }
  }

  async getActive(req, res) {
    try {
      const promotions = await promotionService.getActive();
      res.json(promotions);
    } catch (err) {
      console.error("Erro PromotionController getActive:", err.message || err);
      res.status(500).json({ message: err.message || "Erro ao carregar promoções ativas" });
    }
  }

  async getById(req, res) {
    const { id } = req.params;

    try {
      const promotion = await promotionService.getById(id);
      res.json(promotion);
    } catch (err) {
      console.error("Erro PromotionController getById:", err.message || err);
      res.status(404).json({ message: err.message || "Promoção não encontrada" });
    }
  }

  async getByProductId(req, res) {
    const { productId } = req.params;

    try {
      const promotions = await promotionService.getByProductId(productId);
      res.json(promotions);
    } catch (err) {
      console.error("Erro PromotionController getByProductId:", err.message || err);
      res.status(500).json({ message: err.message || "Erro ao carregar promoções do produto" });
    }
  }

  async create(req, res) {
    const { description, product_id, discount, discount_type, fidelity_only } = req.body;

    try {
      promotionService.validatePromotionData({ description, discount, discount_type });

      const promotion = await promotionService.create({
        description,
        product_id: product_id || null,
        discount,
        discount_type: discount_type || 'fixed',
        active: true,
        fidelity_only: fidelity_only || false
      });

      res.status(201).json(promotion);
    } catch (err) {
      console.error("Erro PromotionController create:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao criar promoção" });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { description, product_id, discount, discount_type, active, fidelity_only } = req.body;

    try {
      promotionService.validatePromotionData({ description, discount, discount_type });

      const promotion = await promotionService.update(id, {
        description,
        product_id: product_id || null,
        discount,
        discount_type: discount_type || 'fixed',
        active: active !== undefined ? active : true,
        fidelity_only: fidelity_only || false
      });

      res.json(promotion);
    } catch (err) {
      console.error("Erro PromotionController update:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao atualizar promoção" });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      await promotionService.delete(id);
      res.json({ message: "Promoção deletada com sucesso" });
    } catch (err) {
      console.error("Erro PromotionController delete:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao deletar promoção" });
    }
  }

  async toggleActive(req, res) {
    const { id } = req.params;

    try {
      const promotion = await promotionService.toggleActive(id);
      res.json(promotion);
    } catch (err) {
      console.error("Erro PromotionController toggleActive:", err.message || err);
      res.status(404).json({ message: err.message || "Promoção não encontrada" });
    }
  }
}

export default new PromotionController();