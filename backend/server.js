import express from 'express';
import cors from 'cors';

import { initDatabase } from './src/database/init.js';

import saleRoutes from './src/routes/sale.routes.js';
import productRoutes from './src/routes/product.routes.js';
import customerRoutes from './src/routes/customer.routes.js';
import operatorRoutes from './src/routes/operator.routes.js';
import promotionRoutes from './src/routes/promotion.routes.js';
import printerRoutes from './src/routes/printer.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Inicializa SQLite antes de subir a API
await initDatabase();

app.use('/api/sales', saleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/printer', printerRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'PDV-UX-driven backend is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});