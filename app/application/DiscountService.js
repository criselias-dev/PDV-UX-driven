// ======================================================
//  DiscountService.js — Serviço de descontos e promoções
//  Local: PDV UPDATE/app/application/DiscountService.js
// ======================================================

import { getActivePromotions } from "../backend/api.js";

export default class DiscountService {

  constructor() {
    this.promotions = [];
  }

  // -------------------------------
  // CARREGAR PROMOÇÕES ATIVAS
  // -------------------------------
  async loadPromotions() {
    this.promotions = await getActivePromotions();
    return this.promotions;
  }

  // -------------------------------
  // VERIFICAR SE UM PRODUTO TEM PROMOÇÃO
  // -------------------------------
  getPromotionForProduct(productId) {
    if (!this.promotions || this.promotions.length === 0) return null;

    return this.promotions.find(promo => promo.productId === productId) || null;
  }

  // -------------------------------
  // CALCULAR DESCONTO DE UM ITEM
  // -------------------------------
  calculateItemDiscount(product, quantity) {
    const promo = this.getPromotionForProduct(product.id);
    if (!promo) return 0;

    // Tipos comuns de promoção
    switch (promo.type) {

      case "PERCENT":
        return (product.price * quantity) * (promo.value / 100);

      case "FIXED":
        return promo.value * quantity;

      case "BUY_X_GET_Y":
        const freeUnits = Math.floor(quantity / promo.buy) * promo.get;
        return freeUnits * product.price;

      default:
        return 0;
    }
  }

  // -------------------------------
  // CALCULAR DESCONTO TOTAL DA VENDA
  // -------------------------------
  calculateSaleDiscount(saleItems) {
    let totalDiscount = 0;

    for (const item of saleItems) {
      if (item.status !== "ACTIVE") continue;

      const product = {
        id: item.product_id,
        price: item.price
      };

      totalDiscount += this.calculateItemDiscount(product, item.quantity);
    }

    return totalDiscount;
  }
}
