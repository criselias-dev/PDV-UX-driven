// backend/src/controllers/SaleController.js
import saleService from '../services/SaleService.js';

class SaleController {
  async startSale(req, res) {
    const { customerCPF } = req.body || {};

    try {
      const sale = await saleService.startSale(customerCPF || null);
      res.json(sale);
    } catch (err) {
      console.error("Erro SaleController startSale:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao iniciar venda" });
    }
  }

  async setCustomer(req, res) {
    const { saleId, customerCPF } = req.body;

    if (!saleId || !customerCPF) {
      return res.status(400).json({ message: "SaleId ou CPF não informado" });
    }

    try {
      const sale = await saleService.setCustomer(saleId, customerCPF);
      res.json(sale);
    } catch (err) {
      console.error("Erro SaleController setCustomer:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao atribuir cliente à venda" });
    }
  }

  async addItem(req, res) {
    const { saleId, productId, quantity } = req.body;

    if (!saleId || !productId) {
      return res.status(400).json({ message: "SaleId ou ProductId não informado" });
    }

    try {
      const sale = await saleService.addItem(saleId, productId, quantity || 1);
      res.json(sale);
    } catch (err) {
      console.error("Erro SaleController addItem:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao adicionar item" });
    }
  }

  async cancelItem(req, res) {
    const { saleId, productId } = req.body;

    if (!saleId || !productId) {
      return res.status(400).json({ message: "SaleId ou ProductId não informado" });
    }

    try {
      const sale = await saleService.cancelItem(saleId, productId);
      res.json(sale);
    } catch (err) {
      console.error("Erro SaleController cancelItem:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao cancelar item" });
    }
  }

  async getSale(req, res) {
    const { saleId } = req.params;

    if (!saleId) {
      return res.status(400).json({ message: "SaleId não informado" });
    }

    try {
      const sale = await saleService.getSale(saleId);
      res.json(sale);
    } catch (err) {
      console.error("Erro SaleController getSale:", err.message || err);
      res.status(404).json({ message: err.message || "Venda não encontrada" });
    }
  }

  async closeSale(req, res) {
    const { saleId } = req.params;

    if (!saleId) {
      return res.status(400).json({ message: "SaleId não informado" });
    }

    try {
      const result = await saleService.closeSale(saleId);
      res.json(result);
    } catch (err) {
      console.error("Erro SaleController closeSale:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao fechar venda" });
    }
  }
}

export default new SaleController();