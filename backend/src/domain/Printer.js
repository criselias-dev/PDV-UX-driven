// backend/src/domain/Printer.js
export default class Printer {
  constructor({ name, status = "READY" }) {
    this.name = name;       // nome da impressora
    this.status = status;   // READY, BUSY, OFFLINE
  }
}