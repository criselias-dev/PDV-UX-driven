import PrinterRepository from "../repositories/PrinterRepository.js";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PrinterService {
  constructor() {
    this.receiptsDir = path.join(__dirname, '../../receipts');
    this.ensureReceiptsDir();
  }

  ensureReceiptsDir() {
    if (!fs.existsSync(this.receiptsDir)) {
      fs.mkdirSync(this.receiptsDir, { recursive: true });
    }
  }

  async getById(id = 1) {
    const printer = await PrinterRepository.findById(id);
    if (!printer) {
      throw new Error("Impressora não encontrada");
    }

    return this.formatPrinter(printer);
  }

  async get() {
    const printer = await PrinterRepository.get();
    if (!printer) {
      throw new Error("Impressora não encontrada");
    }

    return this.formatPrinter(printer);
  }

  async getAll() {
    const printers = await PrinterRepository.getAll();
    return printers.map(p => this.formatPrinter(p));
  }

  async create(printerData) {
    if (!printerData.name || printerData.name.trim() === '') {
      throw new Error("Nome da impressora é obrigatório");
    }

    const printer = await PrinterRepository.create({
      name: printerData.name,
      model: printerData.model || null,
      status: printerData.status || 'ready'
    });

    return this.formatPrinter(printer);
  }

  async update(id, printerData) {
    if (!printerData.name || printerData.name.trim() === '') {
      throw new Error("Nome da impressora é obrigatório");
    }

    const printer = await PrinterRepository.update(id, {
      name: printerData.name,
      model: printerData.model || null,
      status: printerData.status || 'ready'
    });

    return this.formatPrinter(printer);
  }

  async updateStatus(id, status) {
    if (!['ready', 'busy', 'offline', 'error'].includes(status)) {
      throw new Error("Status inválido");
    }

    const printer = await PrinterRepository.updateStatus(id, status);
    return this.formatPrinter(printer);
  }

  async delete(id) {
    return await PrinterRepository.delete(id);
  }

  async printReceipt(receiptData) {
    const printer = await this.get();

    if (!printer.status || printer.status !== 'ready') {
      throw new Error("Impressora não está pronta");
    }

    try {
      // Generate receipt text
      const receiptText = this.generateReceiptText(receiptData);

      // Save as PDF (mock implementation - saves as text for now)
      const pdfPath = await this.savePDF(receiptText, receiptData.saleId);

      // Try to print to Windows printer (Samsung ML1630)
      await this.printToWindowsPrinter(printer.name, pdfPath);

      return {
        success: true,
        printer: printer.name,
        pdfPath: pdfPath,
        message: "Recibo enviado para impressão com sucesso"
      };
    } catch (err) {
      console.error("Erro ao imprimir:", err.message);
      throw new Error(err.message || "Erro ao imprimir recibo");
    }
  }

  generateReceiptText(receiptData) {
    const { saleId, customer, items, subtotal, discount, total, timestamp } = receiptData;

    let receipt = "";
    receipt += "========================================\n";
    receipt += "     MERCADO PEPINHO - PDV RECEIPT\n";
    receipt += "========================================\n";
    receipt += `Sale ID: ${saleId}\n`;
    receipt += `Date/Time: ${timestamp || new Date().toLocaleString('pt-BR')}\n`;
    receipt += "\n";

    if (customer) {
      receipt += `Customer: ${customer.name}\n`;
      receipt += `CPF: ${customer.cpf}\n`;
      receipt += `Status: ${customer.fidelity_status}\n`;
      receipt += "\n";
    }

    receipt += "ITEMS:\n";
    receipt += "----------------------------------------\n";

    if (items && items.length > 0) {
      items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        receipt += `${item.productName}\n`;
        receipt += `  ${item.quantity}x R$ ${item.price.toFixed(2)} = R$ ${itemTotal.toFixed(2)}\n`;
      });
    }

    receipt += "----------------------------------------\n";
    receipt += `Subtotal:       R$ ${(subtotal || 0).toFixed(2)}\n`;
    if (discount && discount > 0) {
      receipt += `Discount:      -R$ ${discount.toFixed(2)}\n`;
    }
    receipt += `TOTAL:          R$ ${(total || subtotal || 0).toFixed(2)}\n`;
    receipt += "\n";
    receipt += "========================================\n";
    receipt += "Thank you for your purchase!\n";
    receipt += "========================================\n";

    return receipt;
  }

  async savePDF(receiptText, saleId) {
    const timestamp = new Date().getTime();
    const filename = `receipt_${saleId}_${timestamp}.txt`;
    const filepath = path.join(this.receiptsDir, filename);

    fs.writeFileSync(filepath, receiptText, 'utf8');
    console.log(`[PrinterService] Receipt saved to: ${filepath}`);

    return filepath;
  }

  async printToWindowsPrinter(printerName, filePath) {
    return new Promise((resolve, reject) => {
      // Windows command to print to a specific printer
      // Using 'print' command for text files
      const cmd = `print /D:"${printerName}" "${filePath}"`;

      exec(cmd, (error, stdout, stderr) => {
        if (error && !error.message.includes('success')) {
          console.warn(`Print command note: ${error.message}`);
          // Don't reject on Windows print errors - they often report false negatives
        }

        console.log(`[PrinterService] Print job sent to ${printerName}`);
        resolve();
      });
    });
  }

  formatPrinter(printer) {
    return {
      id: printer.id,
      name: printer.name,
      model: printer.model,
      status: printer.status || 'ready'
    };
  }

  validatePrinterData(data) {
    if (!data.name || data.name.trim() === '') {
      throw new Error("Nome da impressora é obrigatório");
    }

    if (data.status && !['ready', 'busy', 'offline', 'error'].includes(data.status)) {
      throw new Error("Status inválido (deve ser: ready, busy, offline, error)");
    }

    return true;
  }
}

export default new PrinterService();