// ======================================================
//  PrinterService.js — Serviço de impressão do PDV
//  Local: PDV UPDATE/app/application/PrinterService.js
// ======================================================

import { printSale } from "../backend/api.js";

export default class PrinterService {

  constructor() {}

  // -------------------------------
  // ENVIAR VENDA PARA IMPRESSÃO
  // -------------------------------
  async print(saleId) {
    if (!saleId) {
      throw new Error("Nenhuma venda ativa para imprimir.");
    }

    const result = await printSale(saleId);

    return {
      success: result.success || false,
      message: result.message || "Cupom enviado para impressão."
    };
  }

  // -------------------------------
  // MOCK OPCIONAL (caso backend não responda)
  // -------------------------------
  simulatePrint() {
    return {
      success: true,
      message: "Cupom impresso com sucesso (simulação)."
    };
  }
}
