// ======================================================
//  UI DO PDV — Controla toda a interface e interação
//  Local: PDV-UX-DRIVEN/app/ui/scripts/ui.js
// ======================================================

// -------------------------------
// IMPORTAÇÃO DO API.JS
// -------------------------------
import * as API from "../api.js";

// -------------------------------
// ELEMENTOS DA INTERFACE
// -------------------------------
const btnStart = document.getElementById("btnStart");
const btnFinish = document.getElementById("btnFinish");
const btnCancelLast = document.getElementById("btnCancelLast");
const btnRepeatLast = document.getElementById("btnRepeatLast");
const btnToggleContrast = document.getElementById("btnToggleContrast");
const btnAlerta = document.getElementById("btnAlerta");

const productInput = document.getElementById("productInput");
const itemsList = document.getElementById("itemsList");

const saleIdLabel = document.getElementById("saleId");
const saleTotal = document.getElementById("saleTotal");
const saleSubtotal = document.getElementById("saleSubtotal");
const saleDiscount = document.getElementById("saleDiscount");
const itemsCount = document.getElementById("itemsCount");

const productDescription = document.getElementById("productDescription");
const statusIndicator = document.getElementById("statusIndicator");
const statusLabel = document.getElementById("statusLabel");

const cpfInput = document.getElementById("cpfInput");
const clientName = document.getElementById("clientName");
const fidelidadeStatus = document.getElementById("fidelidadeStatus");

// -------------------------------
// VARIÁVEL DE ESTADO
// -------------------------------
let currentSale = null;

// -------------------------------
// STATUS VISUAL
// -------------------------------
function setStatusIdle() {
  statusIndicator.className = "status-indicator status-idle";
  statusLabel.textContent = "Sem venda ativa";
}

function setStatusActive() {
  statusIndicator.className = "status-indicator status-active";
  statusLabel.textContent = "Venda em andamento";
}

function setStatusError(msg) {
  statusIndicator.className = "status-indicator status-error";
  statusLabel.textContent = msg || "Erro";
}

// -------------------------------
// INICIAR VENDA — F1
// -------------------------------
btnStart.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    // 1️⃣ iniciar venda no backend
    currentSale = await API.startSale();

    // 2️⃣ atualizar ID da venda na tela
    saleIdLabel.textContent = currentSale.id;

    // 3️⃣ habilitar/desabilitar controles
    btnStart.disabled = true;
    btnFinish.disabled = false;
    productInput.disabled = false;
    productInput.focus();

    // 4️⃣ acender LED verde e status ativo
    setStatusActive();

    // 5️⃣ limpar somente lista de itens e descrição, mantendo ID e LED
    itemsList.innerHTML = "";
    productDescription.textContent = "";

    console.log("Venda iniciada:", currentSale); // DEBUG: confirma que currentSale existe

  } catch (err) {
    console.error("Erro ao iniciar venda:", err);
    setStatusError("Erro ao iniciar venda");
  }
});

// -------------------------------
// FINALIZAR VENDA
// -------------------------------
btnFinish.addEventListener("click", async () => {
  try {
    if (!currentSale) throw new Error("Nenhuma venda ativa");

    await API.closeSale(currentSale.id);
    await API.printSale(currentSale.id);

    currentSale = null;
    saleIdLabel.textContent = "—";
    btnStart.disabled = false;
    btnFinish.disabled = true;
    productInput.disabled = true;
    productInput.value = "";

    clearSaleUI();
    setStatusIdle();
  } catch (err) {
    console.error(err);
    setStatusError("Erro ao finalizar");
  }
});

// -------------------------------
// PREENCHER DESCRIÇÃO AO DIGITAR CÓDIGO
// -------------------------------
productInput.addEventListener("input", async () => {
  const productId = productInput.value.trim();

  // se apagou o campo, limpa a descrição
  if (!productId) {
    productDescription.textContent = "";
    return;
  }

  // só busca quando tiver EXATAMENTE 3 dígitos
  if (!/^\d{3}$/.test(productId)) {
    return;
  }

  try {
    const product = await API.getProductById(productId);
    productDescription.textContent = product.name || "";
  } catch {
    productDescription.textContent = "";
  }
});

// -------------------------------
// ADICIONAR ITEM (ENTER)
// -------------------------------
productInput.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;

  const productId = productInput.value.trim();
  if (!productId || !currentSale) return;

  try {
    currentSale = await API.addItem(currentSale.id, productId);
    updateSaleUI(currentSale);

    // após lançar o item, limpa os dois campos para o próximo input
    productInput.value = "";
    productDescription.textContent = "";
    productInput.focus();
  } catch (err) {
    alert(err.message);
    productInput.value = "";
    productDescription.textContent = "";
    productInput.focus();
  }
});

// -------------------------------
// CANCELAR ÚLTIMO ITEM
// -------------------------------
btnCancelLast.addEventListener("click", async () => {
  try {
    if (!currentSale || !currentSale.items?.length) return;

    const lastItem = [...currentSale.items].reverse()[0];
    if (!lastItem) return;

    currentSale = await API.cancelItem(currentSale.id, lastItem.product_id);
    updateSaleUI(currentSale);
  } catch (err) {
    console.error(err);
    setStatusError("Erro ao cancelar item");
  }
});

// -------------------------------
// REPETIR ÚLTIMO ITEM
// -------------------------------
btnRepeatLast.addEventListener("click", async () => {
  try {
    if (!currentSale) return;

    const lastItem = [...currentSale.items].reverse()[0];

    if (!lastItem) return;

    currentSale = await API.addItem(currentSale.id, lastItem.product_id, lastItem.quantity);
    updateSaleUI(currentSale);
  } catch (err) {
    console.error(err);
    setStatusError("Erro ao repetir item");
  }
});

// -------------------------------
// MODO ALTO CONTRASTE
// -------------------------------
btnToggleContrast.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});

// -------------------------------
// ALERTA (F12)
// -------------------------------
btnAlerta.addEventListener("click", () => {
  alert("⚠️ Atenção operador!\nFunção de alerta acionada.");
});

// -------------------------------
// BUSCAR CLIENTE PELO CPF
// -------------------------------
cpfInput.addEventListener("blur", async () => {
  const cpf = cpfInput.value.trim();
  if (!cpf) return;

  try {
    const customer = await API.getCustomerByCPF(cpf);

    clientName.textContent = customer.name;
    fidelidadeStatus.textContent = customer.isFidelizado
      ? "Cliente Fidelizado"
      : "Cliente Não Fidelizado";

    fidelidadeStatus.className = customer.isFidelizado
      ? "fidelidade-sim"
      : "fidelidade-nao";
  } catch (err) {
    clientName.textContent = "—";
    fidelidadeStatus.textContent = "Cliente Não Fidelizado";
    fidelidadeStatus.className = "fidelidade-nao";
  }
});

// -------------------------------
// ATUALIZAR UI DA VENDA
// -------------------------------
function updateSaleUI(sale) {
  itemsList.innerHTML = "";

  const grouped = {};

  sale.items.forEach(i => {
    if (!grouped[i.product_id]) {
      grouped[i.product_id] = {
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: 0,
        price: i.price
      };
    }
    grouped[i.product_id].quantity += i.quantity;
  });

  Object.values(grouped).forEach(item => {
    const li = document.createElement("li");

    const subtotal = item.price * item.quantity;
    li.textContent = `${item.product_name} — Qtd: ${item.quantity} — R$ ${subtotal.toFixed(2)}`;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "❌";
    cancelBtn.classList.add("cancel-btn");

    cancelBtn.onclick = async () => {
      try {
        currentSale = await API.cancelItem(currentSale.id, item.product_id);
        updateSaleUI(currentSale);
      } catch (err) {
        console.error(err);
        setStatusError("Erro ao cancelar item");
      }
    };

    li.appendChild(cancelBtn);
    itemsList.appendChild(li);
  });

  itemsCount.textContent = sale.items.length;
  saleSubtotal.textContent = `R$ ${sale.subtotal.toFixed(2)}`;
  saleDiscount.textContent = `R$ ${sale.discount.toFixed(2)}`;
  saleTotal.textContent = `R$ ${sale.total.toFixed(2)}`;
}

// -------------------------------
// LIMPAR TELA
// -------------------------------
function clearSaleUI() {
  itemsList.innerHTML = "";
  productDescription.textContent = "";
  itemsCount.textContent = "0";
  saleSubtotal.textContent = "R$ 0,00";
  saleDiscount.textContent = "R$ 0,00";
  saleTotal.textContent = "R$ 0,00";
}

// -------------------------------
// LOG
// -------------------------------
console.log("UI carregado e pronto.");