// backend/src/domain/Printer.js
export default class Printer {
  constructor({ id = 1, name, model, status = 'ready' }) {
    this.id = id;
    this.name = name;
    this.model = model;
    this.status = status; // 'ready', 'busy', 'offline', 'error'
  }

  isReady() {
    return this.status === 'ready';
  }

  setStatus(newStatus) {
    if (['ready', 'busy', 'offline', 'error'].includes(newStatus)) {
      this.status = newStatus;
      return true;
    }
    return false;
  }
}