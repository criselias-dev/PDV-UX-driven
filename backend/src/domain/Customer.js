// backend/src/domain/Customer.js
export default class Customer {
  constructor({ cpf, name, points = 0, isFidelizado = false, tier = "Básico" }) {
    this.cpf = cpf;
    this.name = name;
    this.points = points;
    this.isFidelizado = isFidelizado;
    this.tier = tier;
  }
}