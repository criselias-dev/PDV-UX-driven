// backend/src/domain/Promotion.js
export default class Promotion {
  constructor({ id, productId, description, discount = 0 }) {
    this.id = id;
    this.productId = productId;
    this.description = description;
    this.discount = discount;
  }
}