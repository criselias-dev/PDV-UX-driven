import { db } from '../database/connection.js';

class OperatorRepository {
  async find(username) {
    const operator = await db.get(
      'SELECT username, password, name FROM operators WHERE username = ?',
      [username]
    );

    return operator || null;
  }

  async setCurrent(operator) {
    await db.run(
      'UPDATE current_session SET username = ? WHERE id = 1',
      [operator?.username || null]
    );
  }

  async getCurrent() {
    const row = await db.get(
      `SELECT o.username, o.password, o.name
       FROM current_session cs
       LEFT JOIN operators o ON o.username = cs.username
       WHERE cs.id = 1`
    );

    return row?.username ? row : null;
  }
}

export default new OperatorRepository();