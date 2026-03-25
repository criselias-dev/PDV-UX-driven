// backend/src/controllers/OperatorController.js
import operatorService from '../services/OperatorService.js';

class OperatorController {
  async login(req, res) {
    const { username, password } = req.body;

    try {
      const operator = await operatorService.login(username, password);
      res.json(operator);
    } catch (err) {
      console.error("Erro OperatorController login:", err.message || err);
      res.status(401).json({ message: err.message || "Falha no login" });
    }
  }

  async status(req, res) {
    try {
      const operator = await operatorService.getStatus();
      res.json(operator);
    } catch (err) {
      console.error("Erro OperatorController status:", err.message || err);
      res.status(400).json({ message: err.message || "Nenhum operador logado" });
    }
  }
}

export default new OperatorController();