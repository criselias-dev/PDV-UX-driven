// backend/src/domain/Promotion.js
export default class Promotion {
  constructor({ id, product_id, description, discount = 0, discount_type = 'fixed', active = true, fidelity_only = false }) {
    this.id = id;
    this.product_id = product_id; // null means applies to all products
    this.description = description;
    this.discount = discount;
    this.discount_type = discount_type; // 'fixed' or 'percentage'
    this.active = active;
    this.fidelity_only = fidelity_only; // true if only for fidelity customers
  }

  calculateDiscountAmount(productPrice) {
    if (this.discount_type === 'percentage') {
      return (productPrice * this.discount) / 100;
    }
    return this.discount;
  }
}