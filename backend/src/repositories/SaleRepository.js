import { db } from '../database/connection.js';

class SaleRepository {
  async create(sale) {
    await db.run(
      'INSERT INTO sales (id, status) VALUES (?, ?)',
      [sale.id, sale.status || 'OPEN']
    );

    return {
      ...sale,
      status: sale.status || 'OPEN'
    };
  }

  async findById(id) {
    const sale = await db.get(
      'SELECT id, created_at, status FROM sales WHERE id = ?',
      [id]
    );

    if (!sale) return null;

    const items = await this.findItemsBySaleId(id);

    return {
      ...sale,
      items
    };
  }

  async findAll() {
    const sales = await db.all(
      'SELECT id, created_at, status FROM sales ORDER BY created_at DESC'
    );

    return sales;
  }

  async updateStatus(id, status) {
    const result = await db.run(
      'UPDATE sales SET status = ? WHERE id = ?',
      [status, id]
    );

    return result.changes > 0;
  }

  async addItem({ saleId, productId, productName, price, quantity }) {
    const result = await db.run(
      `INSERT INTO sale_items (sale_id, product_id, product_name, price, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [saleId, productId, productName, price, quantity]
    );

    return {
      id: result.lastID,
      saleId,
      productId,
      productName,
      price,
      quantity
    };
  }

  async findItemsBySaleId(saleId) {
    const items = await db.all(
      `SELECT id, sale_id, product_id, product_name, price, quantity
       FROM sale_items
       WHERE sale_id = ?
       ORDER BY id ASC`,
      [saleId]
    );

    return items;
  }

  async removeOneUnit(saleId, productId) {
    const item = await db.get(
      `SELECT id, quantity
       FROM sale_items
       WHERE sale_id = ? AND product_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [saleId, productId]
    );

    if (!item) return false;

    if (item.quantity > 1) {
      await db.run(
        'UPDATE sale_items SET quantity = quantity - 1 WHERE id = ?',
        [item.id]
      );
    } else {
      await db.run(
        'DELETE FROM sale_items WHERE id = ?',
        [item.id]
      );
    }

    return true;
  }
}

export default new SaleRepository();