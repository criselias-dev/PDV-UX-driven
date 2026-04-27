import { db } from '../database/connection.js';

class SaleRepository {
  async create(sale) {
    await db.run(
      'INSERT INTO sales (id, customer_cpf, status) VALUES (?, ?, ?)',
      [sale.id, sale.customer_cpf || null, sale.status || 'OPEN']
    );

    return {
      ...sale,
      status: sale.status || 'OPEN'
    };
  }

  async findById(id) {
    const sale = await db.get(
      'SELECT id, customer_cpf, created_at, status FROM sales WHERE id = ?',
      [id]
    );

    if (!sale) return null;

    const items = await this.findItemsBySaleId(id);

    return {
      ...sale,
      items,
      customer_cpf: sale.customer_cpf
    };
  }

  async findAll() {
    const sales = await db.all(
      'SELECT id, customer_cpf, created_at, status FROM sales ORDER BY created_at DESC'
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

  async updateCustomer(id, customerCPF) {
    const result = await db.run(
      'UPDATE sales SET customer_cpf = ? WHERE id = ?',
      [customerCPF || null, id]
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