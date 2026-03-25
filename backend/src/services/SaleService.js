import SaleRepository from "../repositories/SaleRepository.js";
import ProductRepository from "../repositories/ProductRepository.js";
import OperatorRepository from "../repositories/OperatorRepository.js";

class SaleService {
  async startSale() {
  // Criar venda sem depender de operador
  const newSale = {
    id: Date.now().toString(),
    status: "OPEN",
    operator_id: null // Nenhum operador
  };

  await SaleRepository.create(newSale);
  return await this.getSale(newSale.id);
}
  async getSale(saleId) {
    const sale = await SaleRepository.findById(saleId);

    if (!sale) {
      throw new Error("Venda não encontrada");
    }

    const items = Array.isArray(sale.items) ? sale.items : [];

    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
      0
    );

    const discount = 0; // por enquanto sem regra de desconto
    const total = subtotal - discount;

    return {
      ...sale,
      items,
      subtotal,
      discount,
      total
    };
  }

  async addItem(saleId, productId, quantity = 1) {
    const sale = await SaleRepository.findById(saleId);
    if (!sale) throw new Error("Venda não encontrada");
    if (sale.status !== "OPEN") throw new Error("Venda já está fechada");

    // força productId como string para bater com o DB
    const pid = String(productId).trim();
    const product = await ProductRepository.findById(pid);
    if (!product) throw new Error("Produto não encontrado");

    const qty = Number(quantity) || 1;
    const stockUpdated = await ProductRepository.decrementStock(pid, qty);
    if (!stockUpdated) throw new Error("Estoque insuficiente");

    const item = {
      saleId: sale.id,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: qty
    };

    await SaleRepository.addItem(item);
    return await this.getSale(saleId);
  }

  async cancelItem(saleId, productId) {
    const sale = await SaleRepository.findById(saleId);
    if (!sale) throw new Error("Venda não encontrada");
    if (sale.status !== "OPEN") throw new Error("Venda já está fechada");

    const pid = String(productId).trim();
    const items = await SaleRepository.findItemsBySaleId(saleId);
    const matchingItems = items.filter(i => String(i.product_id) === pid);

    if (matchingItems.length === 0) throw new Error("Produto não encontrado na venda");

    const removed = await SaleRepository.removeOneUnit(saleId, pid);
    if (!removed) throw new Error("Não foi possível cancelar o item");

    await ProductRepository.incrementStock(pid, 1);
    return await this.getSale(saleId);
  }

  async closeSale(saleId) {
    const sale = await SaleRepository.findById(saleId);
    if (!sale) throw new Error("Venda não encontrada");
    if (sale.status !== "OPEN") throw new Error("Venda já está fechada");

    const items = await SaleRepository.findItemsBySaleId(saleId);
    if (!items || items.length === 0) throw new Error("Não é possível fechar uma venda sem itens");

    await SaleRepository.updateStatus(saleId, "CLOSED");
    return await this.getSale(saleId);
  }
}

export default new SaleService();