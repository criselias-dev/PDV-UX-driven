// backend/src/repositories/FidelityHistoryRepository.js
import { db } from '../database/connection.js';

class FidelityHistoryRepository {
  async create(historyData) {
    const { customer_cpf, sale_id, points, reason } = historyData;

    const result = await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason)
       VALUES (?, ?, ?, ?)`,
      [customer_cpf, sale_id, points, reason]
    );

    return result.lastID;
  }

  async findByCustomer(customerCpf, limit = 20) {
    const history = await db.all(
      `SELECT id, sale_id, points, reason, created_at
       FROM fidelity_history
       WHERE customer_cpf = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [customerCpf, limit]
    );

    return history;
  }

  async findBySale(saleId) {
    const history = await db.all(
      `SELECT id, customer_cpf, points, reason, created_at
       FROM fidelity_history
       WHERE sale_id = ?
       ORDER BY created_at DESC`,
      [saleId]
    );

    return history;
  }

  async getTotalPointsEarned(customerCpf) {
    const result = await db.get(
      `SELECT SUM(points) as total FROM fidelity_history WHERE customer_cpf = ? AND points > 0`,
      [customerCpf]
    );

    return result.total || 0;
  }

  async getTotalPointsSpent(customerCpf) {
    const result = await db.get(
      `SELECT SUM(ABS(points)) as total FROM fidelity_history WHERE customer_cpf = ? AND points < 0`,
      [customerCpf]
    );

    return result.total || 0;
  }
}

export default new FidelityHistoryRepository();