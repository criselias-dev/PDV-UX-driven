// getStock.js
import { db } from './src/database/connection.js';

async function showStock() {
  const products = await db.all('SELECT id, name, stock FROM products;');
  console.table(products);
  process.exit(0);
}

showStock();