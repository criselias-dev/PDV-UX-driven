// ======================================================
//  SaleService.js — Camada de aplicação do PDV
//  Local: PDV UPDATE/app/application/SaleService.js
//  Responsável por orquestrar o fluxo da venda
// ======================================================

import {
  startSale as apiStartSale,
  addItem as apiAddItem,
  cancelItem as apiCancelItem,
  closeSale as apiCloseSale,
  getSale as apiGetSale
} from "../backend/api.js";

export default class SaleService {

  constructor() {
    this.currentSaleId = null;
    this.lastAddedProductId = null;
  }

  // -------------------------------
  // INICIAR VENDA
  // -------------------------------
  async startSale() {
    const sale = await apiStartSale();
    this.currentSaleId = sale.id;
    return sale;
  }

  // -------------------------------
  // ADICIONAR ITEM
  // -------------------------------
  async addItem(productId) {
    if (!this.currentSaleId) {
      throw new Error("Nenhuma venda ativa.");
    }

    const updatedSale = await apiAddItem(this.currentSaleId, productId);
    this.lastAddedProductId = productId;

    return updatedSale;
  }

  // -------------------------------
  // CANCELAR ÚLTIMA UNIDADE DO ITEM
  // -------------------------------
  async cancelLastItem() {
    if (!this.currentSaleId || !this.lastAddedProductId) {
      throw new Error("Nenhum item para cancelar.");
    }

    await apiCancelItem(this.currentSaleId, this.lastAddedProductId);
    return await apiGetSale(this.currentSaleId);
  }

  // -------------------------------
  // REPETIR ÚLTIMO ITEM
  // -------------------------------
  async repeatLastItem() {
    if (!this.currentSaleId || !this.lastAddedProductId) {
      throw new Error("Nenhum item para repetir.");
    }

    return await apiAddItem(this.currentSaleId, this.lastAddedProductId);
  }

  // -------------------------------
  // BUSCAR VENDA ATUALIZADA
  // -------------------------------
  async getSale() {
    if (!this.currentSaleId) {
      throw new Error("Nenhuma venda ativa.");
    }

    return await apiGetSale(this.currentSaleId);
  }

  // -------------------------------
  // FINALIZAR VENDA
  // -------------------------------
  async closeSale() {
    if (!this.currentSaleId) {
      throw new Error("Nenhuma venda ativa.");
    }

    const result = await apiCloseSale(this.currentSaleId);
    this.currentSaleId = null;
    this.lastAddedProductId = null;

    return result;
  }
}
