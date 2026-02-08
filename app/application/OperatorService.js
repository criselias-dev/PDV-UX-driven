// ======================================================
//  OperatorService.js — Serviço de operador do PDV
//  Local: PDV UPDATE/app/application/OperatorService.js
// ======================================================

import {
  operatorLogin,
  getOperatorStatus
} from "../backend/api.js";

export default class OperatorService {

  constructor() {
    this.currentOperator = null;
  }

  // -------------------------------
  // LOGIN DO OPERADOR
  // -------------------------------
  async login(username, password) {
    if (!username || !password) {
      throw new Error("Usuário e senha são obrigatórios.");
    }

    const operator = await operatorLogin(username, password);

    this.currentOperator = {
      id: operator.id,
      name: operator.name,
      role: operator.role || "Operador",
      loggedAt: new Date()
    };

    return this.currentOperator;
  }

  // -------------------------------
  // BUSCAR STATUS DO OPERADOR ATUAL
  // -------------------------------
  async fetchStatus() {
    const operator = await getOperatorStatus();

    if (!operator) {
      this.currentOperator = null;
      return null;
    }

    this.currentOperator = {
      id: operator.id,
      name: operator.name,
      role: operator.role || "Operador",
      loggedAt: operator.loggedAt ? new Date(operator.loggedAt) : null
    };

    return this.currentOperator;
  }

  // -------------------------------
  // OBTER OPERADOR ATUAL (LOCAL)
  // -------------------------------
  getCurrentOperator() {
    return this.currentOperator;
  }

  // -------------------------------
  // DESLOGAR OPERADOR
  // -------------------------------
  logout() {
    this.currentOperator = null;
  }
}
