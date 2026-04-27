import { db } from '../database/connection.js';

class CustomerRepository {
  async findByCPF(cpf) {
    const customer = await db.get(
      'SELECT cpf, name, points, fidelity_status FROM customers WHERE cpf = ?',
      [cpf]
    );

    return customer || null;
  }

  async findAll() {
    const customers = await db.all(
      'SELECT cpf, name, points, fidelity_status FROM customers ORDER BY name ASC'
    );

    return customers;
  }

  async create(customer) {
    await db.run(
      'INSERT INTO customers (cpf, name, points, fidelity_status) VALUES (?, ?, ?, ?)',
      [customer.cpf, customer.name, customer.points || 0, customer.fidelity_status || 'basic']
    );

    return await this.findByCPF(customer.cpf);
  }

  async update(cpf, customer) {
    await db.run(
      'UPDATE customers SET name = ?, points = ?, fidelity_status = ? WHERE cpf = ?',
      [customer.name, customer.points, customer.fidelity_status, cpf]
    );

    return await this.findByCPF(cpf);
  }
}

export default new CustomerRepository();