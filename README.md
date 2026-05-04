# PDV UX-Driven — Sistema de Ponto de Venda Orientado à Experiência

O **PDV UX-Driven** é um sistema de ponto de venda desenvolvido com uma abordagem **UX-Driven Development**, onde o fluxo operacional do usuário define a arquitetura do sistema.

Diferente do modelo tradicional (backend-first), este projeto é construído **de fora para dentro**, garantindo que cada decisão técnica exista para atender uma necessidade real de operação.

---

## 🎯 Objetivo

Construir um sistema de PDV:

* Modular e evolutivo
* Orientado à operação real
* Com separação clara de responsabilidades
* Preparado para crescimento incremental de regras de negócio

---

## 🧠 Abordagem: UX-Driven Development

* A interface define o fluxo
* O fluxo define as regras
* As regras definem os serviços
* Os serviços definem o backend

Isso reduz retrabalho, evita complexidade desnecessária e mantém o sistema alinhado com o uso real.

---

## 🧩 Arquitetura

O projeto segue uma arquitetura em camadas bem definidas:

* **Controller** → recebe requisições e orquestra o fluxo
* **Service** → aplica regras de negócio
* **Repository** → acesso e persistência de dados
* **Domain** → representação das entidades
* **Database** → SQLite para persistência local

Essa separação permite evolução independente de cada camada.

---

## 🔄 Fluxo Operacional (em evolução)

Fluxo atual da venda:

1. Seleção de produto via interface
2. Validação do produto no backend
3. Montagem da estrutura de venda
4. Persistência parcial no banco de dados

Em evolução:

* Finalização completa da venda
* Aplicação de regras de desconto
* Integração com fidelidade de cliente
* Geração completa de recibo

---

## 🧪 Estado Atual do Projeto

### ✔ Implementado

* Estrutura backend completa em camadas
* Persistência com SQLite
* Organização de rotas, controllers e serviços
* Modelagem de domínio (Product, Sale, Customer, etc.)
* Interface frontend funcional
* Comunicação frontend ↔ backend

### ⚙️ Em Desenvolvimento

* Finalização da venda
* Motor de promoções
* Regras de fidelidade de cliente
* Validações avançadas de fluxo

---

## 🧠 Decisões Técnicas

* **SQLite** → simplicidade e foco em lógica antes de escala
* **Arquitetura em camadas** → clareza e manutenção
* **Separação Domain / Service / Repository** → isolamento de responsabilidades
* **UX-first** → evitar backend superdimensionado

---

## 🧱 Estrutura do Projeto

pdv-ux-driven/

├── app/
│   ├── ui/
│   │   ├── index.html
│   │   ├── scripts/
│   │   └── styles/
│   │
│   ├── application/
│   │   ├── SaleService.js
│   │   ├── ProductService.js
│   │   ├── CustomerService.js
│   │   ├── OperatorService.js
│   │   ├── DiscountService.js
│   │   └── PrinterService.js
│   │
│   └── backend/
│       └── api.js
│
└── backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── domain/
│   └── infrastructure/
│
├── server.js
└── package.json

---

## ▶️ Como Executar

### Backend

cd backend
npm install
node server.js

### Frontend

Abrir:

app/ui/index.html

---

## 🔗 Direção de Evolução

O projeto não foi construído com regras fixas.

As regras de negócio estão sendo:

* Modeladas progressivamente
* Validadas via simulação de uso real
* Refinadas conforme novos cenários surgem

Essa abordagem garante que o sistema evolua com consistência.

---

## 🧠 Sobre o Projeto

Este projeto não é apenas um PDV.

Ele demonstra:

* Capacidade de modelar sistemas reais
* Tradução de fluxo operacional em lógica de software
* Construção incremental orientada a problema
* Organização arquitetural consistente

---

## 📜 Licença

Projeto proprietário — uso interno.
