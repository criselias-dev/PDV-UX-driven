// ======================================================
//  CustomerService.js — Serviço de fidelidade do cliente
//  Local: PDV UPDATE/app/application/CustomerService.js
// ======================================================

import { getCustomerByCPF } from "../backend/api.js";

export default class CustomerService {

  constructor() {}

  // -------------------------------
  // VALIDAR CPF (formato básico)
  // -------------------------------
  validateCPF(cpf) {
    if (!cpf) return false;

    const clean = cpf.replace(/\D/g, "");
    return clean.length === 11;
  }

  // -------------------------------
  // BUSCAR CLIENTE POR CPF
  // -------------------------------
  async fetchCustomer(cpf) {
    if (!this.validateCPF(cpf)) {
      throw new Error("CPF inválido.");
    }

    const customer = await getCustomerByCPF(cpf);

    return {
      id: customer.id,
      name: customer.name,
      cpf: customer.cpf,
      isFidelizado: customer.isFidelizado || false,
      points: customer.points || 0,
      tier: customer.tier || "Básico"
    };
  }
}
