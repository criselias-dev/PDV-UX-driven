import { db } from '../database/connection.js';

class ProductRepository {
  async findById(id) {
    const product = await db.get(
      'SELECT id, name, price, stock FROM products WHERE id = ?',
      [id]
    );

    return product || null;
  }

  async decrementStock(id, quantity = 1) {
    const product = await this.findById(id);
    if (!product) return false;

    if (product.stock < quantity) {
      return false;
    }

    await db.run(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [quantity, id]
    );

    return true;
  }

  async incrementStock(id, quantity = 1) {
    const product = await this.findById(id);
    if (!product) return false;

    await db.run(
      'UPDATE products SET stock = stock + ? WHERE id = ?',
      [quantity, id]
    );

    return true;
  }

  async findAll() {
    const products = await db.all(
      'SELECT id, name, price, stock FROM products ORDER BY name ASC'
    );

    return products;
  }
}

export default new ProductRepository();