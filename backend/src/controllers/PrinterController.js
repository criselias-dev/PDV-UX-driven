// backend/src/controllers/PrinterController.js
import printerService from '../services/PrinterService.js';

class PrinterController {
  async print(req, res) {
    const { saleId } = req.body;

    if (!saleId) {
      return res.status(400).json({ message: "Nenhuma venda fornecida para impressão" });
    }

    try {
      const result = await printerService.print(saleId);
      res.json(result);
    } catch (err) {
      console.error("Erro PrinterController:", err.message || err);
      res.status(500).json({ message: err.message || "Erro ao imprimir cupom" });
    }
  }
}

export default new PrinterController();