// ======================================================
//  UI DO PDV — Controla toda a interface e interação
//  Local: PDV UPDATE/app/ui/ui.js
// ======================================================

// -------------------------------
// IMPORTAÇÃO DOS SERVICES
// -------------------------------
import SaleService from "../application/SaleService.js";
import ProductService from "../application/ProductService.js";
import CustomerService from "../application/CustomerService.js";
import OperatorService from "../application/OperatorService.js";
import DiscountService from "../application/DiscountService.js";
import PrinterService from "../application/PrinterService.js";

// -------------------------------
// INSTÂNCIAS DOS SERVICES
// -------------------------------
const saleService = new SaleService();
const productService = new ProductService();
const customerService = new CustomerService();
const operatorService = new OperatorService();
const discountService = new DiscountService();
const printerService = new PrinterService();

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
// INICIAR VENDA
// -------------------------------
btnStart.addEventListener("click", async () => {
  try {
    const sale = await saleService.startSale();
    saleIdLabel.textContent = sale.id;

    btnStart.disabled = true;
    btnFinish.disabled = false;
    productInput.disabled = false;
    productInput.focus();

    setStatusActive();
    clearSaleUI();

  } catch (err) {
    console.error(err);
    setStatusError("Erro ao iniciar venda");
  }
});

// -------------------------------
// FINALIZAR VENDA
// -------------------------------
btnFinish.addEventListener("click", async () => {
  try {
    const saleId = saleService.currentSaleId;

    await saleService.closeSale();
    await printerService.print(saleId);

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
// ADICIONAR ITEM (ENTER)
// -------------------------------
productInput.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;

  const productId = productInput.value.trim();
  if (!productId) return;

  try {
    const updatedSale = await saleService.addItem(productId);
    updateSaleUI(updatedSale);

    productInput.value = "";
    productInput.focus();

  } catch (err) {
    alert(err.message);
    productInput.value = "";
    productInput.focus();
  }
});

// -------------------------------
// CANCELAR ÚLTIMO ITEM
// -------------------------------
btnCancelLast.addEventListener("click", async () => {
  try {
    const updatedSale = await saleService.cancelLastItem();
    updateSaleUI(updatedSale);

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
    const updatedSale = await saleService.repeatLastItem();
    updateSaleUI(updatedSale);

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
    const customer = await customerService.fetchCustomer(cpf);

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

  sale.items
    .filter(i => i.status === "ACTIVE")
    .forEach(i => {
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
      const updatedSale = await saleService.cancelLastItem();
      updateSaleUI(updatedSale);
    };

    li.appendChild(cancelBtn);
    itemsList.appendChild(li);
  });

  itemsCount.textContent = sale.items.filter(i => i.status === "ACTIVE").length;
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
