// backend/src/domain/Sale.js
export default class Sale {
  constructor({ id, operator_id = null, customer = null, items = [], status = "OPEN" }) {
    this.id = id;
    this.operator_id = operator_id;
    this.customer = customer;
    this.items = items;

    this.subtotal = 0;
    this.discount = 0;
    this.total = 0;
    this.status = status;

    this.createdAt = new Date().toISOString();
  }

  recalc() {
    this.subtotal = this.items
      .filter(i => i.status === "ACTIVE")
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

    this.total = this.subtotal - this.discount;
  }
}