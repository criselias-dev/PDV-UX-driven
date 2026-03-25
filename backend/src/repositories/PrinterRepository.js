import { db } from '../database/connection.js';

class PrinterRepository {
  async get() {
    const printer = await db.get(
      'SELECT name FROM printer WHERE id = 1'
    );

    return printer || null;
  }
}

export default new PrinterRepository();