// ======================================================
//  ProductService.js — Serviço de produtos do PDV
//  Local: PDV UPDATE/app/application/ProductService.js
//  Responsável por buscar informações reais do produto
// ======================================================

import { getProductById } from "../backend/api.js";

export default class ProductService {

  constructor() {}

  // -------------------------------
  // BUSCAR PRODUTO PELO CÓDIGO
  // -------------------------------
  async fetchProduct(productId) {
    if (!productId) {
      throw new Error("Código do produto inválido.");
    }

    const product = await getProductById(productId);

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || "",
      imageUrl: product.imageUrl || null
    };
  }
}
