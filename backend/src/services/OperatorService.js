import OperatorRepository from "../repositories/OperatorRepository.js";

class OperatorService {
  async login(username, password) {
    const op = await OperatorRepository.find(username);

    if (!op || op.password !== password) {
      throw new Error("Falha no login");
    }

    const operatorData = {
      id: op.username,
      username: op.username,
      name: op.name,
      role: "Operador",
      loggedAt: new Date().toISOString()
    };

    await OperatorRepository.setCurrent(op);

    return operatorData;
  }

  async getStatus() {
    const op = await OperatorRepository.getCurrent();

    if (!op) {
      throw new Error("Nenhum operador logado");
    }

    return {
      id: op.username,
      username: op.username,
      name: op.name,
      role: "Operador"
    };
  }
}

export default new OperatorService();