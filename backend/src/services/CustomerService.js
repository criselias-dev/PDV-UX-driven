import CustomerRepository from "../repositories/CustomerRepository.js";

class CustomerService {
  async getByCPF(cpf) {
    const customer = await CustomerRepository.findByCPF(cpf);

    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    // Retorno padronizado para frontend
    const isFidelizado = customer.fidelity_status === 'premium' || customer.fidelity_status === 'gold';
    
    return {
      id: customer.cpf,
      name: customer.name,
      cpf: customer.cpf,
      points: customer.points || 0,
      fidelity_status: customer.fidelity_status || 'basic',
      isFidelizado: isFidelizado,
      tier: customer.fidelity_status || 'Básico'
    };
  }

  async getAll() {
    return await CustomerRepository.findAll();
  }

  async create(customer) {
    return await CustomerRepository.create(customer);
  }

  async update(cpf, customer) {
    return await CustomerRepository.update(cpf, customer);
  }
}

export default new CustomerService();