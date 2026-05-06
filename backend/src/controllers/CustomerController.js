// backend/src/controllers/CustomerController.js
import customerService from '../services/CustomerService.js';
import fidelityService from '../services/FidelityService.js';

class CustomerController {
  async getByCPF(req, res) {
    const { cpf } = req.params;

    try {
      const customer = await customerService.getByCPF(cpf);

      res.json(customer);
    } catch (err) {
      console.error("Erro CustomerController:", err.message || err);
      res.status(404).json({ message: err.message || "Cliente não encontrado" });
    }
  }

  async getFidelityInfo(req, res) {
    const { cpf } = req.params;

    try {
      const fidelityInfo = await fidelityService.getFidelityInfo(cpf);

      res.json(fidelityInfo);
    } catch (err) {
      console.error("Erro CustomerController getFidelityInfo:", err.message || err);
      res.status(404).json({ message: err.message || "Cliente não encontrado" });
    }
  }

  async create(req, res) {
    const customerData = req.body;

    try {
      const customer = await customerService.create(customerData);

      res.status(201).json(customer);
    } catch (err) {
      console.error("Erro CustomerController:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao criar cliente" });
    }
  }
}

export default new CustomerController();