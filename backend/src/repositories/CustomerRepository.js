import { db } from '../database/connection.js';

class CustomerRepository {
  async findByCPF(cpf) {
    const customer = await db.get(
      'SELECT cpf, name, points FROM customers WHERE cpf = ?',
      [cpf]
    );

    return customer || null;
  }
}

export default new CustomerRepository();