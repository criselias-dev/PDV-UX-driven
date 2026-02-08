// ======================================================
//  API DO PDV — Comunicação com o backend real
//  Local: PDV UPDATE/app/backend/api.js
// ======================================================

const API_BASE = "http://127.0.0.1:3000/api";

// ======================================================
//  FUNÇÃO AUXILIAR PARA JSON SEGURO
// ======================================================
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ======================================================
//  VENDAS
// ======================================================

// Iniciar venda
export async function startSale() {
  const res = await fetch(`${API_BASE}/sales`, { method: "POST" });
  const data = await safeJson(res);

  if (!res.ok) throw new Error(data?.message || "Erro ao iniciar venda");
  return data;
}

// Adicionar item
export async function addItem(saleId, productId) {
  const res = await fetch(`${API_BASE}/sales/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ saleId, productId, quantity: 1 })
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Erro ao adicionar item");
  return data;
}

// Cancelar 1 unidade do item
export async function cancelItem(saleId, productId) {
  const res = await fetch(`${API_BASE}/sales/items/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ saleId, productId })
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Erro ao cancelar item");
  return data;
}

// Buscar venda
export async function getSale(saleId) {
  const res = await fetch(`${API_BASE}/sales/${saleId}`);
  const data = await safeJson(res);

  if (!res.ok) throw new Error(data?.message || "Erro ao buscar venda");
  return data;
}

// Finalizar venda
export async function closeSale(saleId) {
  const res = await fetch(`${API_BASE}/sales/${saleId}/close`, {
    method: "POST"
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Erro ao finalizar venda");
  return data;
}

// ======================================================
//  PRODUTOS
// ======================================================

// Buscar produto por ID
export async function getProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  const data = await safeJson(res);

  if (!res.ok) throw new Error(data?.message || "Produto não encontrado");
  return data;
}

// ======================================================
//  CLIENTES (FIDELIDADE)
// ======================================================

// Buscar cliente por CPF
export async function getCustomerByCPF(cpf) {
  const res = await fetch(`${API_BASE}/customers/${cpf}`);
  const data = await safeJson(res);

  if (!res.ok) throw new Error(data?.message || "Cliente não encontrado");
  return data;
}

// ======================================================
//  OPERADOR
// ======================================================

// Login do operador
export async function operatorLogin(username, password) {
  const res = await fetch(`${API_BASE}/operator/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Falha no login");
  return data;
}

// Buscar operador atual
export async function getOperatorStatus() {
  const res = await fetch(`${API_BASE}/operator/status`);
  const data = await safeJson(res);

  if (!res.ok) throw new Error(data?.message || "Erro ao buscar operador");
  return data;
}

// ======================================================
//  DESCONTOS / PROMOÇÕES
// ======================================================

// Buscar promoções ativas
export async function getActivePromotions() {
  const res = await fetch(`${API_BASE}/promotions/active`);
  const data = await safeJson(res);

  if (!res.ok) throw new Error(data?.message || "Erro ao buscar promoções");
  return data;
}

// ======================================================
//  IMPRESSÃO
// ======================================================

// Enviar venda para impressão
export async function printSale(saleId) {
  const res = await fetch(`${API_BASE}/printer/print`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ saleId })
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Erro ao imprimir cupom");
  return data;
}
