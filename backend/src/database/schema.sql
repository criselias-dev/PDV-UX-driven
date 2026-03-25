-- ===============================
-- SALES
-- ===============================
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'OPEN'
);

-- ===============================
-- SALE ITEMS
-- ===============================
CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ===============================
-- PRODUCTS
-- ===============================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL
);

-- ===============================
-- CUSTOMERS
-- ===============================
CREATE TABLE IF NOT EXISTS customers (
  cpf TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0
);

-- ===============================
-- OPERATORS
-- ===============================
CREATE TABLE IF NOT EXISTS operators (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT NOT NULL
);

-- ===============================
-- CURRENT OPERATOR SESSION
-- Apenas 1 sessão ativa simples para PDV local
-- ===============================
CREATE TABLE IF NOT EXISTS current_session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  username TEXT,
  FOREIGN KEY (username) REFERENCES operators(username)
);

-- ===============================
-- PROMOTIONS
-- ===============================
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  description TEXT NOT NULL,
  discount REAL NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ===============================
-- PRINTER
-- PDV local assume 1 impressora principal
-- ===============================
CREATE TABLE IF NOT EXISTS printer (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL
);