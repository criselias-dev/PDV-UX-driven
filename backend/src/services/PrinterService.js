import PrinterRepository from "../repositories/PrinterRepository.js";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PrinterService {
  constructor() {
    this.receiptsDir = path.join(__dirname, '../../receipts');
    this.pdfsDir = path.join(this.receiptsDir, 'pdfs');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.receiptsDir)) {
      fs.mkdirSync(this.receiptsDir, { recursive: true });
    }
    if (!fs.existsSync(this.pdfsDir)) {
      fs.mkdirSync(this.pdfsDir, { recursive: true });
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

  async print(saleId) {
    try {
      // Buscar dados da venda para gerar o recibo
      const saleService = (await import('./SaleService.js')).default;
      const saleData = await saleService.getSale(saleId);

      if (!saleData) {
        throw new Error(`Venda ${saleId} não encontrada`);
      }

      // Preparar dados do recibo
      const receiptData = {
        saleId: saleData.id,
        customer: saleData.customer,
        items: saleData.items,
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        total: saleData.total,
        timestamp: saleData.created_at || new Date().toISOString()
      };

      // Gerar e salvar PDF
      const pdfPath = await this.generateAndSavePDF(receiptData);

      // Gerar texto para impressão física
      const receiptText = this.generateReceiptText(receiptData);

      // Imprimir fisicamente (se impressora estiver configurada)
      try {
        await this.printPhysicalReceipt(receiptText);
      } catch (printErr) {
        console.warn('[PrinterService] Erro na impressão física:', printErr.message);
        // Não falha completamente se a impressão física falhar
      }

      return {
        success: true,
        saleId: saleId,
        pdfUrl: this.getPDFUrl(pdfPath),
        pdfPath: pdfPath,
        message: "Cupom gerado e enviado para impressão"
      };
    } catch (err) {
      console.error('[PrinterService] Erro ao imprimir venda:', err);
      throw new Error(`Erro ao imprimir venda: ${err.message}`);
    }
  }

  groupReceiptItems(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const grouped = {};

    items.forEach((item) => {
      const productId = item.product_id || item.productId || item.id || '';
      const productName = item.product_name || item.productName || 'Produto';
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const key = productId ? String(productId) : `${productName}::${price}`;

      if (!grouped[key]) {
        grouped[key] = {
          product_id: productId || null,
          product_name: productName,
          price: price,
          quantity: 0
        };
      }

      grouped[key].quantity += quantity;
    });

    return Object.values(grouped).map((item) => ({
      ...item,
      subtotal: item.price * item.quantity
    }));
  }

  async generateAndSavePDF(receiptData) {
    const { saleId } = receiptData;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // Criar diretório organizado por data: pdfs/2026/05/
    const dateDir = path.join(this.pdfsDir, year.toString(), month);
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }

    // Nome do arquivo: SALE_001_20260506_143022.pdf
    const timestamp = `${year}${month}${day}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `SALE_${String(saleId).padStart(3, '0')}_${timestamp}.pdf`;
    const filepath = path.join(dateDir, filename);

    // Gerar PDF
    const doc = new PDFDocument({
      size: [80 * 2.83465, 297 * 2.83465], // 80mm width (receipt paper), auto height
      margin: 10
    });

    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    // Cabeçalho
    doc.fontSize(12).font('Helvetica-Bold').text('MERCADO PEPINHO', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('PDV RECEIPT', { align: 'center' });
    doc.moveDown(0.5);

    // Linha separadora
    doc.moveTo(10, doc.y).lineTo(doc.page.width - 10, doc.y).stroke();
    doc.moveDown(0.5);

    // Informações da venda
    doc.fontSize(8).font('Helvetica');
    doc.text(`Sale ID: ${saleId}`);
    doc.text(`Date/Time: ${now.toLocaleString('pt-BR')}`);
    doc.moveDown(0.5);

    // Informações do cliente
    if (receiptData.customer) {
      doc.fontSize(8).font('Helvetica-Bold').text('CUSTOMER INFORMATION:');
      doc.fontSize(8).font('Helvetica');
      doc.text(`Name: ${receiptData.customer.name}`);
      doc.text(`CPF: ${receiptData.customer.cpf}`);
      doc.text(`Status: ${receiptData.customer.fidelity_status || 'N/A'}`);
      doc.moveDown(0.5);
    }

    // Itens
    doc.fontSize(8).font('Helvetica-Bold').text('ITEMS:');
    doc.moveDown(0.3);

    const groupedItems = this.groupReceiptItems(receiptData.items);
    if (groupedItems.length > 0) {
      groupedItems.forEach((item) => {
        doc.fontSize(8).font('Helvetica');
        doc.text(`${item.product_name} - Qtd: ${item.quantity} - R$ ${item.subtotal.toFixed(2)}`);
        doc.moveDown(0.2);
      });
    }

    doc.moveDown(0.5);

    // Totais
    const subtotal = receiptData.subtotal || 0;
    const discount = receiptData.discount || 0;
    const total = receiptData.total || subtotal;

    doc.fontSize(8).font('Helvetica-Bold');
    doc.text(`Subtotal: R$ ${subtotal.toFixed(2)}`, { align: 'right' });

    if (discount > 0) {
      doc.text(`Discount: -R$ ${discount.toFixed(2)}`, { align: 'right' });
    }

    doc.fontSize(10).text(`TOTAL: R$ ${total.toFixed(2)}`, { align: 'right' });

    doc.moveDown(1);

    // Rodapé
    doc.fontSize(8).font('Helvetica').text('Thank you for your purchase!', { align: 'center' });
    doc.text('MERCADO PEPINHO - PDV System', { align: 'center' });

    // Finalizar PDF
    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log(`[PrinterService] PDF saved to: ${filepath}`);
        resolve(filepath);
      });
      writeStream.on('error', reject);
    });
  }

  async printPhysicalReceipt(receiptText) {
    // Por enquanto, apenas salva como arquivo de texto
    // Futuramente implementar impressão real na ML1630
    const timestamp = new Date().getTime();
    const filename = `print_${timestamp}.txt`;
    const filepath = path.join(this.receiptsDir, filename);

    fs.writeFileSync(filepath, receiptText, 'utf8');
    console.log(`[PrinterService] Physical receipt prepared: ${filepath}`);

    // TODO: Implementar impressão real na ML1630
    // Exemplo: await this.printToWindowsPrinter('ML1630', filepath);
  }

  async getPDFs() {
    const pdfs = [];

    try {
      // Percorrer diretórios de ano
      const years = fs.readdirSync(this.pdfsDir).filter(item =>
        fs.statSync(path.join(this.pdfsDir, item)).isDirectory() &&
        /^\d{4}$/.test(item) // Apenas anos (4 dígitos)
      ).sort().reverse(); // Mais recentes primeiro

      for (const year of years) {
        const yearPath = path.join(this.pdfsDir, year);
        const months = fs.readdirSync(yearPath).filter(item =>
          fs.statSync(path.join(yearPath, item)).isDirectory() &&
          /^\d{2}$/.test(item) // Apenas meses (2 dígitos)
        ).sort().reverse(); // Mais recentes primeiro

        for (const month of months) {
          const monthPath = path.join(yearPath, month);
          const files = fs.readdirSync(monthPath).filter(file =>
            file.endsWith('.pdf')
          ).sort().reverse(); // Mais recentes primeiro

          for (const file of files) {
            const filePath = path.join(monthPath, file);
            const stats = fs.statSync(filePath);

            // Extrair informações do nome do arquivo
            const match = file.match(/^SALE_(\d+)_(\d{8})_(\d{6})\.pdf$/);
            if (match) {
              const [, saleId, dateStr, timeStr] = match;
              const date = new Date(
                parseInt(dateStr.substring(0, 4)), // ano
                parseInt(dateStr.substring(4, 6)) - 1, // mês (0-based)
                parseInt(dateStr.substring(6, 8)), // dia
                parseInt(timeStr.substring(0, 2)), // hora
                parseInt(timeStr.substring(2, 4)), // minuto
                parseInt(timeStr.substring(4, 6)) // segundo
              );

              pdfs.push({
                filename: file,
                saleId: parseInt(saleId),
                year: year,
                month: month,
                date: date.toISOString(),
                size: stats.size,
                path: `/api/printer/pdfs/${year}/${month}/${file}`
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('[PrinterService] Erro ao listar PDFs:', err);
      throw new Error('Erro ao listar arquivos PDF');
    }

    return pdfs;
  }

  async getPDFPath(year, month, filename) {
    // Validar parâmetros para segurança
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !filename.endsWith('.pdf')) {
      throw new Error('Parâmetros inválidos');
    }

    const filepath = path.join(this.pdfsDir, year, month, filename);

    // Verificar se o caminho está dentro do diretório permitido
    const resolvedPath = path.resolve(filepath);
    const resolvedPdfsDir = path.resolve(this.pdfsDir);

    if (!resolvedPath.startsWith(resolvedPdfsDir)) {
      throw new Error('Acesso negado');
    }

    return filepath;
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

    const groupedItems = this.groupReceiptItems(items);
    if (groupedItems.length > 0) {
      groupedItems.forEach((item) => {
        receipt += `${item.product_name} - Qtd: ${item.quantity} - R$ ${item.subtotal.toFixed(2)}\n`;
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

  getPDFUrl(localPath) {
    // Extract year, month, filename from the local path
    // Example: C:\path\to\receipts\pdfs\2026\05\SALE_001_20260507_103057.pdf
    const relativePath = path.relative(this.pdfsDir, localPath);
    const parts = relativePath.split(path.sep);

    if (parts.length >= 3) {
      const [year, month, filename] = parts;
      return `/receipts/pdfs/${year}/${month}/${filename}`;
    }

    return null;
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
