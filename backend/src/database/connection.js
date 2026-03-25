import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho real do banco, sempre relativo a ESTE arquivo
const dbPath = path.join(__dirname, 'pdv.sqlite');

export const db = await open({
  filename: dbPath,
  driver: sqlite3.Database
});

console.log(`SQLite conectado em: ${dbPath}`);