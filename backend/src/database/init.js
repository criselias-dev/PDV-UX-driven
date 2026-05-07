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
  // SEED CUSTOMERS - Sistema de Fidelização
  // ===============================
  const customerCount = await db.get('SELECT COUNT(*) as count FROM customers');

  if (customerCount.count === 0) {
    // Clientes com diferentes tiers
    await db.run(
      `INSERT INTO customers (cpf, name, points, fidelity_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['11111111111', 'João Silva', 50, 'basic', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z']
    );
    await db.run(
      `INSERT INTO customers (cpf, name, points, fidelity_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['22222222222', 'Maria Souza', 250, 'bronze', '2024-01-10T10:00:00Z', '2024-02-20T14:30:00Z']
    );
    await db.run(
      `INSERT INTO customers (cpf, name, points, fidelity_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['33333333333', 'Pedro Santos', 450, 'silver', '2024-01-05T10:00:00Z', '2024-03-10T16:45:00Z']
    );
    await db.run(
      `INSERT INTO customers (cpf, name, points, fidelity_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['55555555555', 'Ana Costa', 2500, 'platinum', '2023-10-01T10:00:00Z', '2024-03-20T11:15:00Z']
    );
    console.log('Clientes com sistema de fidelização inseridos');
  }

  // ===============================
  // SEED FIDELITY HISTORY - Histórico de pontos
  // ===============================
  const historyCount = await db.get('SELECT COUNT(*) as count FROM fidelity_history');

  if (historyCount.count === 0) {
    // Histórico para João Silva (basic)
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['11111111111', 'sale_001', 25, 'Compra realizada - R$ 25.00', '2024-01-16T10:00:00Z']
    );
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['11111111111', 'sale_002', 25, 'Compra realizada - R$ 25.00', '2024-01-20T10:00:00Z']
    );

    // Histórico para Maria Souza (bronze)
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['22222222222', 'sale_003', 50, 'Compra realizada - R$ 50.00', '2024-01-12T10:00:00Z']
    );
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['22222222222', 'sale_004', 75, 'Compra realizada - R$ 75.00', '2024-01-25T10:00:00Z']
    );
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['22222222222', 'sale_005', 125, 'Compra realizada - R$ 125.00', '2024-02-20T14:30:00Z']
    );
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, points, reason, created_at) VALUES (?, ?, ?, ?)`,
      ['22222222222', 0, 'Upgrade para tier bronze', '2024-02-20T14:30:00Z']
    );

    // Histórico para Pedro Santos (silver)
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['33333333333', 'sale_006', 300, 'Compra realizada - R$ 300.00', '2024-01-06T10:00:00Z']
    );
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['33333333333', 'sale_007', 150, 'Compra realizada - R$ 150.00', '2024-03-10T16:45:00Z']
    );
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, points, reason, created_at) VALUES (?, ?, ?, ?)`,
      ['33333333333', 0, 'Upgrade para tier silver', '2024-01-06T10:00:00Z']
    );

    // Histórico para Ana Costa (platinum)
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['55555555555', 'sale_010', 1000, 'Compra realizada - R$ 1000.00', '2023-10-02T10:00:00Z']
    );
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, sale_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['55555555555', 'sale_011', 1500, 'Compra realizada - R$ 1500.00', '2024-03-20T11:15:00Z']
    );
    await db.run(
      `INSERT INTO fidelity_history (customer_cpf, points, reason, created_at) VALUES (?, ?, ?, ?)`,
      ['55555555555', 0, 'Upgrade para tier platinum', '2023-10-02T10:00:00Z']
    );

    console.log('Histórico de fidelização inserido');
  }

  // ===============================
  // SEED OPERATORS
  // ===============================
  const defaultOperators = [
    { username: 'caixa1', password: '1234', name: 'Mariana' },
    { username: 'caixa2', password: '2345', name: 'Joao' },
    { username: 'caixa3', password: '3456', name: 'Patricia' }
  ];

  for (const operator of defaultOperators) {
    await db.run(
      `INSERT OR IGNORE INTO operators (username, password, name) VALUES (?, ?, ?)`,
      [operator.username, operator.password, operator.name]
    );
  }
  console.log('Operadores padrao garantidos (caixa1, caixa2, caixa3)');

  // ===============================
  // SEED PROMOTIONS - Sistema de Fidelização (descontos por tier)
  // ===============================
  const promotionCount = await db.get('SELECT COUNT(*) as count FROM promotions');

  if (promotionCount.count === 0) {
    // Removida promoção geral de fidelidade - agora usa tiers
    // Promoções específicas de produto continuam
    await db.run(
      `INSERT INTO promotions (id, product_id, description, discount, discount_type, active, fidelity_only)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['1', '100', 'Desconto Café', 1.00, 'fixed', 1, 0]
    );
    await db.run(
      `INSERT INTO promotions (id, product_id, description, discount, discount_type, active, fidelity_only)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['2', '102', 'Promo Pão de Queijo', 0.50, 'fixed', 1, 0]
    );
    console.log('Promoções específicas inseridas (descontos de fidelização agora por tier)');
  }

  // ===============================
  // SEED PRINTER
  // ===============================
  const printer = await db.get('SELECT id FROM printer WHERE id = 1');

  if (!printer) {
    await db.run(
      `INSERT INTO printer (id, name, model, status) VALUES (?, ?, ?, ?)`,
      [1, 'PDV-PRINTER-01', 'Samsung ML1630', 'ready']
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
