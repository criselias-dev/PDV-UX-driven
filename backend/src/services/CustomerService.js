import CustomerRepository from "../repositories/CustomerRepository.js";
import FidelityService from "./FidelityService.js";

class CustomerService {
  async getByCPF(cpf) {
    const customer = await CustomerRepository.findByCPF(cpf);

    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    // Obter informações completas de fidelização
    const fidelityInfo = await FidelityService.getFidelityInfo(cpf);

    // Retorno padronizado para frontend
    const isFidelizado = fidelityInfo.tier !== 'basic';

    return {
      id: customer.cpf,
      name: customer.name,
      cpf: customer.cpf,
      points: customer.points || 0,
      fidelity_status: customer.fidelity_status || 'basic',
      isFidelizado: isFidelizado,
      tier: customer.fidelity_status || 'basic',
      discount: fidelityInfo.discount,
      nextTier: fidelityInfo.nextTier,
      created_at: customer.created_at,
      updated_at: customer.updated_at
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