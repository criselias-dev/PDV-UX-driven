import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './src/database/init.js';

import saleRoutes from './src/routes/sale.routes.js';
import productRoutes from './src/routes/product.routes.js';
import customerRoutes from './src/routes/customer.routes.js';
import operatorRoutes from './src/routes/operator.routes.js';
import promotionRoutes from './src/routes/promotion.routes.js';
import printerRoutes from './src/routes/printer.routes.js';

const app = express();

app.use(cors({
  origin: true, // Permite qualquer origem temporariamente para debug
  credentials: true
}));
app.use(express.json());

// ==============================
// VERSÃO DO PDV
// ==============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let versionData = {
  version: '2026.1.0',
  lastUpdated: new Date().toISOString()
};

try {
  const versionPath = path.join(projectRoot, 'version.json');
  if (fs.existsSync(versionPath)) {
    const rawData = fs.readFileSync(versionPath, 'utf-8');
    versionData = JSON.parse(rawData);
  }
} catch (err) {
  console.warn('Erro ao ler version.json:', err.message);
}

app.get('/api/version', (req, res) => {
  res.json(versionData);
});

// Inicializa SQLite antes de subir a API
await initDatabase();

// Servir arquivos estáticos (PDFs dos cupons)
const receiptsDir = path.join(projectRoot, 'receipts');
app.use('/receipts', express.static(receiptsDir));

app.use('/api/sales', saleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/printer', printerRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'PDV-UX-driven backend is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.message || err);
  res.status(500).json({ message: err.message || 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});