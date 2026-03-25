import PrinterRepository from "../repositories/PrinterRepository.js";

class PrinterService {
  async print(content) {
    if (!content) {
      throw new Error("Conteúdo inválido");
    }

    const printer = await PrinterRepository.get();

    if (!printer) {
      throw new Error("Impressora não configurada");
    }

    // Simulação de impressão
    console.log(`[${printer.name}] IMPRIMINDO:`, content);

    return {
      success: true,
      printer: printer.name,
      message: "Conteúdo enviado para impressão"
    };
  }

  async getPrinter() {
    const printer = await PrinterRepository.get();

    if (!printer) {
      throw new Error("Impressora não encontrada");
    }

    return printer;
  }
}

export default new PrinterService();