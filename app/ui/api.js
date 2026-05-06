// frontend/api.js
// ======================================================
// API do Frontend — Comunicação com o backend PDV-UX-driven
// ======================================================

const API_BASE = "http://localhost:3000/api";

// ------------------------------------------------------
// Função auxiliar para JSON seguro
// ------------------------------------------------------
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ------------------------------------------------------
// Função base para evitar repetição
// ------------------------------------------------------
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`);

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    console.log(`[API] Response status: ${res.status}`);

    const data = await safeJson(res);

    if (!res.ok) {
      throw new Error(data?.message || `Erro em ${endpoint}`);
    }

    return data;
  } catch (error) {
    console.error(`[API] Error for ${url}:`, error);
    throw error;
  }
}

// ======================================================
// VENDAS
// ======================================================

export async function startSale() {
  return request("/sales", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
}

export async function addItem(saleId, productId, quantity = 1) {
  return request("/sales/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ saleId, productId, quantity })
  });
}

export async function cancelItem(saleId, productId) {
  return request("/sales/items/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ saleId, productId })
  });
}

export async function getSale(saleId) {
  return request(`/sales/${saleId}`);
}

export async function closeSale(saleId) {
  return request(`/sales/${saleId}/close`, { method: "POST" });
}

export async function setCustomer(saleId, customerCPF) {
  return request("/sales/customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ saleId, customerCPF })
  });
}

// ======================================================
// PRODUTOS
// ======================================================

export async function getProductById(id) {
  return request(`/products/${id}`);
}

export async function getAllProducts() {
  return request("/products");
}

// ======================================================
// CLIENTES (FIDELIDADE)
// ======================================================

export async function getCustomerByCPF(cpf) {
  return request(`/customers/${cpf}`);
}

export async function getCustomerFidelityInfo(cpf) {
  return request(`/customers/${cpf}/fidelity`);
}

export async function createCustomer(customerData) {
  return request("/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData)
  });
}

// ======================================================
// OPERADOR
// ======================================================

export async function operatorLogin(username, password) {
  return request("/operator/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
}

export async function getOperatorStatus() {
  return request("/operator/status");
}

// ======================================================
// PROMOÇÕES
// ======================================================

export async function getActivePromotions() {
  return request("/promotions/active");
}

// ======================================================
// IMPRESSÃO
// ======================================================

export async function printSale(saleId) {
  return request("/printer/print", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ saleId })
  });
}