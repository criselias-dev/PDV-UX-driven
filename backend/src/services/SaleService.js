import SaleRepository from "../repositories/SaleRepository.js";
import ProductRepository from "../repositories/ProductRepository.js";
import OperatorRepository from "../repositories/OperatorRepository.js";
import PromotionService from "./PromotionService.js";
import CustomerService from "./CustomerService.js";

class SaleService {
  async startSale(customerCPF = null) {
    // Criar venda sem depender de operador
    const newSale = {
      id: Date.now().toString(),
      status: "OPEN",
      operator_id: null, // Nenhum operador
      customer_cpf: customerCPF || null
    };

    await SaleRepository.create(newSale);
    return await this.getSale(newSale.id);
  }

  async getSale(saleId, customerCPF = null) {
    const sale = await SaleRepository.findById(saleId);

    if (!sale) {
      throw new Error("Venda não encontrada");
    }

    const items = Array.isArray(sale.items) ? sale.items : [];

    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
      0
    );

    // Calculate loyalty discount if customer is provided
    let discount = 0;
    let customer = null;

    if (customerCPF) {
      try {
        customer = await CustomerService.getByCPF(customerCPF);
        discount = await PromotionService.calculateLoyaltyDiscount(subtotal, customer.isFidelizado);
      } catch (err) {
        console.warn("Customer not found for discount calculation:", err.message);
      }
    }

    const total = subtotal - discount;

    return {
      ...sale,
      items,
      customer,
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
    return await this.getSale(saleId, sale.customer_cpf);
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
    return await this.getSale(saleId, sale.customer_cpf);
  }

  async setCustomer(saleId, customerCPF) {
    const sale = await SaleRepository.findById(saleId);
    if (!sale) throw new Error("Venda não encontrada");

    // Validate customer exists
    try {
      await CustomerService.getByCPF(customerCPF);
    } catch (err) {
      throw new Error("Cliente não encontrado");
    }

    // Update sale with customer CPF
    await SaleRepository.updateCustomer(saleId, customerCPF);

    return await this.getSale(saleId, customerCPF);
  }

  async closeSale(saleId) {
    const sale = await SaleRepository.findById(saleId);
    if (!sale) throw new Error("Venda não encontrada");
    if (sale.status !== "OPEN") throw new Error("Venda já está fechada");

    const items = await SaleRepository.findItemsBySaleId(saleId);
    if (!items || items.length === 0) throw new Error("Não é possível fechar uma venda sem itens");

    await SaleRepository.updateStatus(saleId, "CLOSED");
    return await this.getSale(saleId, sale.customer_cpf);
  }
}

export default new SaleService();