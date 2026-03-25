import CustomerRepository from "../repositories/CustomerRepository.js";

class CustomerService {
  async getByCPF(cpf) {
    const customer = await CustomerRepository.findByCPF(cpf);

    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    // Retorno padronizado para frontend
    return {
      id: customer.cpf,
      name: customer.name,
      cpf: customer.cpf,
      points: customer.points || 0,
      isFidelizado: customer.points > 0,
      tier: customer.points >= 300 ? "Premium" : "Básico"
    };
  }
}

export default new CustomerService();