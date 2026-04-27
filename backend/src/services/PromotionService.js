import PromotionRepository from "../repositories/PromotionRepository.js";

class PromotionService {
  async getAll() {
    const promotions = await PromotionRepository.findAll();
    return promotions.map(promo => this.formatPromotion(promo));
  }

  async getActive() {
    const promotions = await PromotionRepository.findActive();
    return promotions.map(promo => this.formatPromotion(promo));
  }

  async getById(id) {
    const promotion = await PromotionRepository.findById(id);
    if (!promotion) {
      throw new Error("Promoção não encontrada");
    }
    return this.formatPromotion(promotion);
  }

  async getByProductId(productId) {
    const promotions = await PromotionRepository.findByProductId(productId);
    return promotions.map(promo => this.formatPromotion(promo));
  }

  async getLoyaltyPromotion() {
    const promotion = await PromotionRepository.findLoyaltyPromotion();
    if (!promotion) {
      return null;
    }
    return this.formatPromotion(promotion);
  }

  async calculateLoyaltyDiscount(subtotal, isFidelizado) {
    if (!isFidelizado) {
      return 0;
    }

    const loyaltyPromo = await this.getLoyaltyPromotion();
    if (!loyaltyPromo) {
      return 0;
    }

    // For percentage discounts
    if (loyaltyPromo.discount_type === 'percentage') {
      return (subtotal * loyaltyPromo.discount) / 100;
    }

    return loyaltyPromo.discount;
  }

  async calculateItemDiscount(productId, productPrice) {
    const promotions = await this.getByProductId(productId);
    if (promotions.length === 0) {
      return 0;
    }

    const promo = promotions[0]; // Use first applicable promotion
    if (promo.discount_type === 'percentage') {
      return (productPrice * promo.discount) / 100;
    }

    return promo.discount;
  }

  async create(promotionData) {
    const promotion = await PromotionRepository.create(promotionData);
    return this.formatPromotion(promotion);
  }

  async update(id, promotionData) {
    const promotion = await PromotionRepository.update(id, promotionData);
    return this.formatPromotion(promotion);
  }

  async delete(id) {
    return await PromotionRepository.delete(id);
  }

  async toggleActive(id) {
    const promotion = await PromotionRepository.toggleActive(id);
    if (!promotion) {
      throw new Error("Promoção não encontrada");
    }
    return this.formatPromotion(promotion);
  }

  validatePromotionData(data) {
    if (!data.description || data.description.trim() === '') {
      throw new Error("Descrição é obrigatória");
    }

    if (data.discount === undefined || data.discount === null) {
      throw new Error("Valor do desconto é obrigatório");
    }

    if (data.discount < 0) {
      throw new Error("Valor do desconto não pode ser negativo");
    }

    if (data.discount_type && !['fixed', 'percentage'].includes(data.discount_type)) {
      throw new Error("Tipo de desconto inválido (deve ser 'fixed' ou 'percentage')");
    }

    return true;
  }

  formatPromotion(promo) {
    return {
      id: promo.id,
      product_id: promo.product_id,
      description: promo.description,
      discount: promo.discount,
      discount_type: promo.discount_type || 'fixed',
      active: promo.active === 1 || promo.active === true,
      fidelity_only: promo.fidelity_only === 1 || promo.fidelity_only === true
    };
  }
}

export default new PromotionService();