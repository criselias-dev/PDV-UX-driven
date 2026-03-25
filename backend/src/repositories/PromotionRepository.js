import { db } from '../database/connection.js';

class PromotionRepository {
  async findActive() {
    const promotions = await db.all(
      `SELECT id, product_id as productId, description, discount
       FROM promotions
       WHERE active = 1
       ORDER BY id ASC`
    );

    return promotions;
  }
}

export default new PromotionRepository();