import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  await db.exec(schema);

  // ===============================
  // SEED PRODUCTS
  // ===============================
  const productCount = await db.get('SELECT COUNT(*) as count FROM products');

  if (productCount.count === 0) {
    await db.run(
      `INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)`,
      ['100', 'Café Expresso', 5.00, 50]
    );
    await db.run(
      `INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)`,
      ['101', 'Cappuccino', 7.50, 40]
    );
    await db.run(
      `INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)`,
      ['102', 'Pão de Queijo', 4.00, 60]
    );
    await db.run(
      `INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)`,
      ['103', 'Água Mineral', 3.00, 100]
    );
    console.log('Produtos iniciais inseridos');
  }

  // ===============================
  // SEED CUSTOMERS
  // ===============================
  const customerCount = await db.get('SELECT COUNT(*) as count FROM customers');

  if (customerCount.count === 0) {
    await db.run(
      `INSERT INTO customers (cpf, name, points) VALUES (?, ?, ?)`,
      ['11111111111', 'João Silva', 120]
    );
    await db.run(
      `INSERT INTO customers (cpf, name, points) VALUES (?, ?, ?)`,
      ['22222222222', 'Maria Souza', 300]
    );
    await db.run(
      `INSERT INTO customers (cpf, name, points) VALUES (?, ?, ?)`,
      ['24941917855', 'Cris Elias', 1200]
    );
    console.log('Clientes iniciais inseridos');
  }

  // ===============================
  // SEED OPERATORS
  // ===============================
  const operatorCount = await db.get('SELECT COUNT(*) as count FROM operators');

  if (operatorCount.count === 0) {
    await db.run(
      `INSERT INTO operators (username, password, name) VALUES (?, ?, ?)`,
      ['admin', '1234', 'Administrador']
    );
    console.log('Operadores iniciais inseridos');
  }

  // ===============================
  // SEED PROMOTIONS
  // ===============================
  const promotionCount = await db.get('SELECT COUNT(*) as count FROM promotions');

  if (promotionCount.count === 0) {
    await db.run(
      `INSERT INTO promotions (id, product_id, description, discount, active)
       VALUES (?, ?, ?, ?, ?)`,
      ['1', '100', 'Desconto Café', 1.00, 1]
    );
    await db.run(
      `INSERT INTO promotions (id, product_id, description, discount, active)
       VALUES (?, ?, ?, ?, ?)`,
      ['2', '102', 'Promo Pão de Queijo', 0.50, 1]
    );
    console.log('Promoções iniciais inseridas');
  }

  // ===============================
  // SEED PRINTER
  // ===============================
  const printer = await db.get('SELECT id FROM printer WHERE id = 1');

  if (!printer) {
    await db.run(
      `INSERT INTO printer (id, name) VALUES (?, ?)`,
      [1, 'PDV-PRINTER-01']
    );
    console.log('Impressora padrão inserida');
  }

  // ===============================
  // SEED CURRENT SESSION
  // ===============================
  const session = await db.get('SELECT id FROM current_session WHERE id = 1');

  if (!session) {
    await db.run(
      `INSERT INTO current_session (id, username) VALUES (?, ?)`,
      [1, null]
    );
    console.log('Sessão atual inicializada');
  }

  console.log('Database initialized');
}