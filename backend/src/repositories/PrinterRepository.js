import { db } from '../database/connection.js';

class PrinterRepository {
  async findById(id = 1) {
    const printer = await db.get(
      'SELECT id, name, model, status FROM printer WHERE id = ?',
      [id]
    );

    return printer || null;
  }

  async get() {
    return await this.findById(1);
  }

  async getAll() {
    const printers = await db.all(
      'SELECT id, name, model, status FROM printer ORDER BY id ASC'
    );

    return printers;
  }

  async create(printer) {
    const id = printer.id || 1;
    await db.run(
      'INSERT INTO printer (id, name, model, status) VALUES (?, ?, ?, ?)',
      [id, printer.name, printer.model || null, printer.status || 'ready']
    );

    return await this.findById(id);
  }

  async update(id, printer) {
    await db.run(
      'UPDATE printer SET name = ?, model = ?, status = ? WHERE id = ?',
      [printer.name, printer.model || null, printer.status || 'ready', id]
    );

    return await this.findById(id);
  }

  async updateStatus(id, status) {
    await db.run(
      'UPDATE printer SET status = ? WHERE id = ?',
      [status, id]
    );

    return await this.findById(id);
  }

  async delete(id) {
    if (id === 1) {
      throw new Error("Não é possível deletar a impressora padrão (id=1)");
    }

    await db.run('DELETE FROM printer WHERE id = ?', [id]);
    return true;
  }
}

export default new PrinterRepository();