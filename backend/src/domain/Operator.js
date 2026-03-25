// backend/src/domain/Operator.js
export default class Operator {
  constructor({ username, name, role = "Operador" }) {
    this.username = username;
    this.name = name;
    this.role = role;
  }
}