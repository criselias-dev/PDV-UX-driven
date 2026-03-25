import PromotionRepository from "../repositories/PromotionRepository.js";

class PromotionService {
  async getActive() {
    const promotions = await PromotionRepository.findActive();

    return promotions.map((promo) => ({
      id: promo.id,
      productId: promo.productId,
      description: promo.description,
      discount: promo.discount
    }));
  }
}

export default new PromotionService();