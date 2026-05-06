#!/usr/bin/env node

/**
 * Script para atualizar a versão do PDV a cada commit
 * Executa um bump de versão baseado no tipo de mudança
 * 
 * Uso: npm run version:bump [major|minor|patch]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const versionPath = path.join(__dirname, '..', 'version.json');

// Ler versão atual
let versionData = {
  version: '2026.1.0',
  lastUpdated: new Date().toISOString(),
  major: 2026,
  minor: 1,
  patch: 0
};

try {
  if (fs.existsSync(versionPath)) {
    const rawData = fs.readFileSync(versionPath, 'utf-8');
    versionData = JSON.parse(rawData);
  }
} catch (err) {
  console.warn('Erro ao ler versão anterior:', err.message);
}

// Obter tipo de bump (padrão: patch)
const bumpType = process.argv[2] || 'patch';

// Aplicar bump
switch (bumpType.toLowerCase()) {
  case 'major':
    versionData.major++;
    versionData.minor = 0;
    versionData.patch = 0;
    break;
  case 'minor':
    versionData.minor++;
    versionData.patch = 0;
    break;
  case 'patch':
  default:
    versionData.patch++;
}

// Atualizar versão string
versionData.version = `${versionData.major}.${versionData.minor}.${versionData.patch}`;
versionData.lastUpdated = new Date().toISOString();

// Salvar nova versão
try {
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n', 'utf-8');
  console.log(`✅ Versão atualizada para: ${versionData.version}`);
} catch (err) {
  console.error('❌ Erro ao salvar versão:', err.message);
  process.exit(1);
}
