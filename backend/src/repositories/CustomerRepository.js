import { db } from '../database/connection.js';

class CustomerRepository {
  async findByCPF(cpf) {
    const customer = await db.get(
      'SELECT cpf, name, points, fidelity_status, created_at, updated_at FROM customers WHERE cpf = ?',
      [cpf]
    );

    return customer || null;
  }

  async findAll() {
    const customers = await db.all(
      'SELECT cpf, name, points, fidelity_status, created_at, updated_at FROM customers ORDER BY name ASC'
    );

    return customers;
  }

  async create(customer) {
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO customers (cpf, name, points, fidelity_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [customer.cpf, customer.name, customer.points || 0, customer.fidelity_status || 'basic', now, now]
    );

    return await this.findByCPF(customer.cpf);
  }

  async update(cpf, customer) {
    const now = new Date().toISOString();

    await db.run(
      'UPDATE customers SET name = ?, points = ?, fidelity_status = ?, updated_at = ? WHERE cpf = ?',
      [customer.name, customer.points, customer.fidelity_status, now, cpf]
    );

    return await this.findByCPF(cpf);
  }

  async updatePoints(cpf, points) {
    const now = new Date().toISOString();

    await db.run(
      'UPDATE customers SET points = ?, updated_at = ? WHERE cpf = ?',
      [points, now, cpf]
    );
  }

  async updateFidelityStatus(cpf, status) {
    const now = new Date().toISOString();

    await db.run(
      'UPDATE customers SET fidelity_status = ?, updated_at = ? WHERE cpf = ?',
      [status, now, cpf]
    );
  }

  // Buscar clientes por tier de fidelidade
  async findByTier(tier) {
    const customers = await db.all(
      'SELECT cpf, name, points, fidelity_status FROM customers WHERE fidelity_status = ? ORDER BY points DESC',
      [tier]
    );

    return customers;
  }

  // Buscar top clientes por pontos
  async findTopCustomers(limit = 10) {
    const customers = await db.all(
      'SELECT cpf, name, points, fidelity_status FROM customers ORDER BY points DESC LIMIT ?',
      [limit]
    );

    return customers;
  }
}

export default new CustomerRepository();