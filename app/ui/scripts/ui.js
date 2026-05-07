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
const btnClearCpf = document.getElementById("btnClearCpf");

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

// Modal de Fidelização
const fidelizacaoModal = document.getElementById("fidelizacaoModal");
const modalStep1 = document.getElementById("modalStep1");
const modalStep2 = document.getElementById("modalStep2");
const btnFidelizarSim = document.getElementById("btnFidelizarSim");
const btnFidelizarNao = document.getElementById("btnFidelizarNao");
const btnSalvarCliente = document.getElementById("btnSalvarCliente");
const btnCancelarFidelizacao = document.getElementById("btnCancelarFidelizacao");
const modalClose = document.querySelector(".modal-close");
const newCustomerCpf = document.getElementById("newCustomerCpf");
const newCustomerName = document.getElementById("newCustomerName");

const versionLabel = document.querySelector(".version-label");

// -------------------------------
// INICIALIZAÇÃO INICIAL
// -------------------------------
cpfInput.disabled = true;

// -------------------------------
// VARIÁVEL DE ESTADO & PERSISTÊNCIA
// -------------------------------
let currentSale = null;
let ignoreCpfBlur = false;
let lastSearchedCpf = null; // Armazenar CPF para o modal de fidelização

function resetCustomerInfo() {
  clientName.textContent = "—";
  fidelidadeStatus.textContent = "Cliente Não Fidelizado";
  fidelidadeStatus.className = "fidelidade-nao";
}

// Salvar sale no localStorage
function saveSaleToStorage(sale) {
  if (sale) {
    localStorage.setItem('currentSale', JSON.stringify(sale));
  } else {
    localStorage.removeItem('currentSale');
  }
}

// Restaurar sale do localStorage
function loadSaleFromStorage() {
  try {
    const stored = localStorage.getItem('currentSale');
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.warn('Erro ao restaurar venda do localStorage:', err);
    return null;
  }
}

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

function setStatusSuccess(msg) {
  statusIndicator.className = "status-indicator status-success";
  statusLabel.textContent = msg || "Sucesso";
}

function setSaleOpen(isOpen, hasItems = false) {
  btnStart.disabled = isOpen;
  btnFinish.disabled = !isOpen || !hasItems;
  productInput.disabled = !isOpen;
  cpfInput.disabled = !isOpen;
  btnCancelLast.disabled = !isOpen || !hasItems;
  btnRepeatLast.disabled = !isOpen || !hasItems;
}

function initUI() {
  // Carregar versão do backend
  loadVersion();
  
  // Tenta restaurar venda anterior
  const savedSale = loadSaleFromStorage();
  
  if (savedSale && savedSale.status === 'OPEN') {
    // Se uma venda estava aberta, restaura
    currentSale = savedSale;
    saleIdLabel.textContent = currentSale.id;
    setStatusActive();
    const hasItems = Array.isArray(currentSale.items) && currentSale.items.length > 0;
    setSaleOpen(true, hasItems);
    updateSaleUI(currentSale);
    
    // Restaura informações do cliente se houver
    if (currentSale.customer) {
      clientName.textContent = currentSale.customer.name;
      fidelidadeStatus.textContent = currentSale.customer.isFidelizado 
        ? "Cliente Fidelizado" 
        : "Cliente Não Fidelizado";
      fidelidadeStatus.className = currentSale.customer.isFidelizado 
        ? "fidelidade-sim" 
        : "fidelidade-nao";
    }
    
    productInput.focus();
    console.log("Venda restaurada do armazenamento local:", currentSale);
  } else {
    // Caso contrário, inicia novo
    currentSale = null;
    saleIdLabel.textContent = "—";
    setStatusIdle();
    clearSaleUI();
    resetCustomerInfo();
    setSaleOpen(false, false);
    saveSaleToStorage(null);
  }
}

// Carregar versão do backend
async function loadVersion() {
  try {
    const versionInfo = await API.getVersion();
    if (versionInfo && versionInfo.version) {
      versionLabel.textContent = versionInfo.version;
      console.log("Versão do PDV:", versionInfo.version);
    }
  } catch (err) {
    console.warn("Erro ao carregar versão:", err);
    // Mantém versão padrão se houver erro
  }
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
    saveSaleToStorage(currentSale);

    // 2️⃣ atualizar ID da venda na tela
    saleIdLabel.textContent = currentSale.id;

    // 3️⃣ habilitar/desabilitar controles (venda aberta, mas ainda sem itens)
    setSaleOpen(true, false);
    productInput.focus();

    // 4️⃣ acender LED verde e status ativo
    setStatusActive();

    // 5️⃣ manter a UI da venda vazia até o primeiro item
    updateSaleUI(currentSale);

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

    try {
      const printResult = await API.printSale(currentSale.id);
      if (printResult && printResult.pdfUrl) {
        setStatusSuccess(`Venda finalizada! <a href="${printResult.pdfUrl}" target="_blank" style="color: #007bff;">Ver PDF do cupom</a>`);
      } else {
        setStatusSuccess("Venda finalizada!");
      }
    } catch (printErr) {
      console.warn("Venda fechada, mas erro na impressão:", printErr);
      setStatusSuccess("Venda finalizada (impressão falhou)");
    }

    currentSale = null;
    saveSaleToStorage(null);
    saleIdLabel.textContent = "—";
    productInput.value = "";

    clearSaleUI();
    setStatusIdle();
    setSaleOpen(false);
  } catch (err) {
    console.error(err);
    setStatusError(err.message || "Erro ao finalizar");
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
    saveSaleToStorage(currentSale);
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
    saveSaleToStorage(currentSale);
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
    saveSaleToStorage(currentSale);
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
async function handleCpfLookup(cpf) {
  if (!cpf) return;

  try {
    const customer = await API.getCustomerByCPF(cpf);
    const fidelityInfo = await API.getCustomerFidelityInfo(cpf);

    clientName.textContent = customer.name;
    fidelidadeStatus.textContent = `Tier: ${fidelityInfo.tier.toUpperCase()} (${fidelityInfo.discount}% desconto)`;
    fidelidadeStatus.className = customer.isFidelizado
      ? "fidelidade-sim"
      : "fidelidade-nao";

    // Mostrar pontos e próximo tier se disponível
    if (fidelityInfo.nextTier) {
      fidelidadeStatus.textContent += ` - ${fidelityInfo.points} pontos (próximo: ${fidelityInfo.nextTier.tier.toUpperCase()} em ${fidelityInfo.nextTier.pointsNeeded} pontos)`;
    } else {
      fidelidadeStatus.textContent += ` - ${fidelityInfo.points} pontos (tier máximo!)`;
    }

    // Se há uma venda ativa, associar o cliente e recalcular desconto
    if (currentSale) {
      try {
        currentSale = await API.setCustomer(currentSale.id, cpf);
        saveSaleToStorage(currentSale);
        updateSaleUI(currentSale);
        console.log("Cliente associado à venda:", customer.name);
      } catch (setErr) {
        console.warn("Erro ao associar cliente à venda:", setErr);
        // Não falha completamente, apenas avisa
      }
    }
  } catch (err) {
    // CPF não encontrado - mostrar modal de fidelização
    lastSearchedCpf = cpf;
    newCustomerCpf.value = cpf;
    newCustomerName.value = "";
    showModalStep(1);
    resetCustomerInfo();
  }
}

// ======================================================
// FUNÇÕES DO MODAL DE FIDELIZAÇÃO
// ======================================================

function showModalStep(step) {
  fidelizacaoModal.classList.add("show");
  if (step === 1) {
    modalStep1.classList.remove("hidden");
    modalStep2.classList.add("hidden");
  } else if (step === 2) {
    modalStep1.classList.add("hidden");
    modalStep2.classList.remove("hidden");
  }
}

function hideModal() {
  fidelizacaoModal.classList.remove("show");
  lastSearchedCpf = null;
}

async function handleFidelizarSim() {
  // Mostrar formulário de cadastro (step 2)
  showModalStep(2);
  newCustomerName.focus();
}

function handleFidelizarNao() {
  // Continuar a venda sem fidelizar
  hideModal();
  cpfInput.value = "";
  cpfInput.focus();
}

async function handleSalvarCliente() {
  const name = newCustomerName.value.trim();
  const cpf = lastSearchedCpf;

  if (!name) {
    alert("Por favor, digite o nome do cliente");
    return;
  }

  if (!cpf) {
    alert("CPF inválido");
    return;
  }

  try {
    // Criar novo cliente
    const newCustomer = await API.createCustomer({
      cpf: cpf,
      name: name,
      points: 0,
      fidelity_status: 'basic'
    });

    console.log("Novo cliente criado:", newCustomer);

    // Associar o cliente à venda
    if (currentSale) {
      currentSale = await API.setCustomer(currentSale.id, cpf);
      saveSaleToStorage(currentSale);
      updateSaleUI(currentSale);
    }

    // Exibir dados do cliente
    clientName.textContent = newCustomer.name;
    fidelidadeStatus.textContent = `Tier: BASIC (0% desconto) - 0 pontos`;
    fidelidadeStatus.className = "fidelidade-nao";

    // Fechar modal
    hideModal();
    cpfInput.value = cpf;
    cpfInput.focus();

    console.log("Cliente fidelizado e associado à venda!");
  } catch (err) {
    alert("Erro ao cadastrar cliente: " + err.message);
    console.error("Erro ao criar cliente:", err);
  }
}

cpfInput.addEventListener("blur", async () => {
  if (ignoreCpfBlur) {
    ignoreCpfBlur = false;
    return;
  }

  const cpf = cpfInput.value.trim();
  await handleCpfLookup(cpf);
});

cpfInput.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();

  const cpf = cpfInput.value.trim();
  await handleCpfLookup(cpf);

  cpfInput.value = "";
});

btnClearCpf.addEventListener("click", () => {
  ignoreCpfBlur = true;
  cpfInput.value = "";
  resetCustomerInfo();
  cpfInput.focus();
});

// -------------------------------
// ATUALIZAR UI DA VENDA
// -------------------------------
function updateSaleUI(sale) {
  itemsList.innerHTML = "";

  const grouped = {};

  const hasItems = Array.isArray(sale.items) && sale.items.length > 0;
  setSaleOpen(true, hasItems);

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
        saveSaleToStorage(currentSale);
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
// INICIALIZAÇÃO
// -------------------------------
initUI();

// ======================================================
// EVENT LISTENERS DO MODAL DE FIDELIZAÇÃO
// ======================================================

// Botão "Não" - fechar modal e continuar
btnFidelizarNao.addEventListener("click", handleFidelizarNao);

// Botão "Sim" - mostrar formulário de cadastro
btnFidelizarSim.addEventListener("click", handleFidelizarSim);

// Botão "Salvar" - cadastrar novo cliente
btnSalvarCliente.addEventListener("click", handleSalvarCliente);

// Botão "Cancelar" - voltar para step 1
btnCancelarFidelizacao.addEventListener("click", () => {
  showModalStep(1);
});

// Fechar modal (X)
modalClose.addEventListener("click", hideModal);

// Fechar ao clicar fora do modal
fidelizacaoModal.addEventListener("click", (e) => {
  if (e.target === fidelizacaoModal) {
    hideModal();
  }
});

// Permitir Enter para salvar cliente
newCustomerName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSalvarCliente();
  }
});

// -------------------------------
// LOG
// -------------------------------
console.log("UI carregado e pronto.");