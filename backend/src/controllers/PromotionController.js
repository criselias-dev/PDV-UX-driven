// backend/src/controllers/PromotionController.js
import promotionService from '../services/PromotionService.js';

class PromotionController {
  async getActive(req, res) {
    try {
      const promotions = await promotionService.getActive();
      res.json(promotions);
    } catch (err) {
      console.error("Erro PromotionController:", err.message || err);
      res.status(500).json({ message: err.message || "Erro ao carregar promoções" });
    }
  }
}

export default new PromotionController();