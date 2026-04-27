import { db } from '../database/connection.js';

class PromotionRepository {
  async findById(id) {
    const promotion = await db.get(
      `SELECT id, product_id, description, discount, discount_type, active, fidelity_only
       FROM promotions
       WHERE id = ?`,
      [id]
    );

    return promotion || null;
  }

  async findActive() {
    const promotions = await db.all(
      `SELECT id, product_id, description, discount, discount_type, active, fidelity_only
       FROM promotions
       WHERE active = 1
       ORDER BY id ASC`
    );

    return promotions;
  }

  async findAll() {
    const promotions = await db.all(
      `SELECT id, product_id, description, discount, discount_type, active, fidelity_only
       FROM promotions
       ORDER BY id ASC`
    );

    return promotions;
  }

  async findByProductId(productId) {
    const promotions = await db.all(
      `SELECT id, product_id, description, discount, discount_type, active, fidelity_only
       FROM promotions
       WHERE product_id = ? AND active = 1
       ORDER BY id ASC`,
      [productId]
    );

    return promotions;
  }

  async findLoyaltyPromotion() {
    const promotion = await db.get(
      `SELECT id, product_id, description, discount, discount_type, active, fidelity_only
       FROM promotions
       WHERE fidelity_only = 1 AND product_id IS NULL AND active = 1
       LIMIT 1`
    );

    return promotion || null;
  }

  async create(promotion) {
    const id = promotion.id || Date.now().toString();
    await db.run(
      `INSERT INTO promotions (id, product_id, description, discount, discount_type, active, fidelity_only)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, promotion.product_id || null, promotion.description, promotion.discount, 
       promotion.discount_type || 'fixed', promotion.active ? 1 : 0, promotion.fidelity_only ? 1 : 0]
    );

    return await this.findById(id);
  }

  async update(id, promotion) {
    await db.run(
      `UPDATE promotions 
       SET product_id = ?, description = ?, discount = ?, discount_type = ?, active = ?, fidelity_only = ?
       WHERE id = ?`,
      [promotion.product_id || null, promotion.description, promotion.discount,
       promotion.discount_type || 'fixed', promotion.active ? 1 : 0, promotion.fidelity_only ? 1 : 0, id]
    );

    return await this.findById(id);
  }

  async delete(id) {
    await db.run('DELETE FROM promotions WHERE id = ?', [id]);
    return true;
  }

  async toggleActive(id) {
    const promotion = await this.findById(id);
    if (!promotion) return false;

    await db.run(
      'UPDATE promotions SET active = ? WHERE id = ?',
      [promotion.active ? 0 : 1, id]
    );

    return await this.findById(id);
  }
}

export default new PromotionRepository();