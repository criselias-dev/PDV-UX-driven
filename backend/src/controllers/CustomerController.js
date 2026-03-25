// backend/src/controllers/CustomerController.js
import customerService from '../services/CustomerService.js';

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
}

export default new CustomerController();