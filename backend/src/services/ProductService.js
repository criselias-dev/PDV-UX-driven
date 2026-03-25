import ProductRepository from "../repositories/ProductRepository.js";

class ProductService {
  async getById(id) {
    const product = await ProductRepository.findById(id);

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock
    };
  }

  async getAll() {
    return await ProductRepository.findAll();
  }
}

export default new ProductService();