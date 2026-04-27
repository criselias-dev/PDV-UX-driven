// backend/src/controllers/PrinterController.js
import printerService from '../services/PrinterService.js';

class PrinterController {
  async getAll(req, res) {
    try {
      const printers = await printerService.getAll();
      res.json(printers);
    } catch (err) {
      console.error("Erro PrinterController getAll:", err.message || err);
      res.status(500).json({ message: err.message || "Erro ao carregar impressoras" });
    }
  }

  async getById(req, res) {
    const { id } = req.params;

    try {
      const printer = await printerService.getById(id);
      res.json(printer);
    } catch (err) {
      console.error("Erro PrinterController getById:", err.message || err);
      res.status(404).json({ message: err.message || "Impressora não encontrada" });
    }
  }

  async get(req, res) {
    try {
      const printer = await printerService.get();
      res.json(printer);
    } catch (err) {
      console.error("Erro PrinterController get:", err.message || err);
      res.status(404).json({ message: err.message || "Impressora não encontrada" });
    }
  }

  async create(req, res) {
    const { name, model, status } = req.body;

    try {
      printerService.validatePrinterData({ name, model, status });

      const printer = await printerService.create({
        name,
        model: model || null,
        status: status || 'ready'
      });

      res.status(201).json(printer);
    } catch (err) {
      console.error("Erro PrinterController create:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao criar impressora" });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { name, model, status } = req.body;

    try {
      printerService.validatePrinterData({ name, model, status });

      const printer = await printerService.update(id, {
        name,
        model: model || null,
        status: status || 'ready'
      });

      res.json(printer);
    } catch (err) {
      console.error("Erro PrinterController update:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao atualizar impressora" });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      await printerService.delete(id);
      res.json({ message: "Impressora deletada com sucesso" });
    } catch (err) {
      console.error("Erro PrinterController delete:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao deletar impressora" });
    }
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status é obrigatório" });
    }

    try {
      const printer = await printerService.updateStatus(id, status);
      res.json(printer);
    } catch (err) {
      console.error("Erro PrinterController updateStatus:", err.message || err);
      res.status(400).json({ message: err.message || "Erro ao atualizar status" });
    }
  }

  async printReceipt(req, res) {
    const receiptData = req.body;

    if (!receiptData || !receiptData.saleId) {
      return res.status(400).json({ message: "Dados de venda inválidos para impressão" });
    }

    try {
      const result = await printerService.printReceipt(receiptData);
      res.json(result);
    } catch (err) {
      console.error("Erro PrinterController printReceipt:", err.message || err);
      res.status(500).json({ message: err.message || "Erro ao imprimir recibo" });
    }
  }

  async print(req, res) {
    const { saleId } = req.body;

    if (!saleId) {
      return res.status(400).json({ message: "Nenhuma venda fornecida para impressão" });
    }

    try {
      const result = await printerService.print(saleId);
      res.json(result);
    } catch (err) {
      console.error("Erro PrinterController print:", err.message || err);
      res.status(500).json({ message: err.message || "Erro ao imprimir cupom" });
    }
  }
}

export default new PrinterController();