# 📌 Sistema de Versionamento Automático

## Visão Geral
O PDV-UX-driven agora possui um sistema automático de versionamento que atualiza a versão a cada commit.

## 📋 Estrutura
- **version.json**: Arquivo centralizado que armazena a versão atual
- **scripts/version-bump.js**: Script Node.js que incrementa a versão
- **backend/server.js**: Expõe versão via endpoint `/api/version`
- **app/ui/scripts/ui.js**: Carrega e exibe versão no header

## 🔄 Fluxo de Versioning

### Semântica de Versão
Formato: `AAAA.MINOR.PATCH`
- **AAAA** (2026): Ano de criação (constante)
- **MINOR**: Feature releases ou mudanças significativas
- **PATCH**: Bug fixes, pequenos ajustes (incrementa a cada commit por padrão)

### Workflow Padrão
1. **Fazer alterações no código**
2. **Testar e validar**
3. **Rodar bump de versão**: 
   ```bash
   npm run version:patch
   ```
4. **Commit e push com nova versão**

## 📦 Scripts Disponíveis

```bash
# Backend (executar em ./backend)
cd backend

# Bump PATCH (padrão: 2026.1.0 → 2026.1.1)
npm run version:patch

# Bump MINOR (ex: 2026.1.0 → 2026.2.0)
npm run version:minor

# Bump MAJOR (ex: 2026.1.0 → 2027.0.0)
npm run version:major
```

## 🔍 Como Verificar a Versão

### Via Backend
```bash
curl http://localhost:3000/api/version
# Retorna: { "version": "2026.1.1", "lastUpdated": "2026-05-06T...", ... }
```

### Via Interface
A versão é carregada automaticamente no header do PDV ao iniciar

### Via Arquivo
```bash
cat version.json
```

## 💡 Boas Práticas

### Quando usar PATCH
- Bug fixes
- Melhorias de performance
- Ajustes de UI/UX menores
- Documentação

### Quando usar MINOR  
- Novas features
- Mudanças arquiteturais
- Novos módulos/serviços
- Integrações importantes

### Quando usar MAJOR
- Mudanças quebráveis (breaking changes)
- Reescritas significativas
- Incompatibilidade com versões anteriores

## 📝 Exemplo de Commit com Versionamento

```bash
# 1. Fazer mudanças
# 2. Rodar version bump
npm run version:patch

# 3. Commit com a versão
git add -A
git commit -m "feat: implement customer registration modal

- Add modal for new customer fidelity registration
- Auto-populate CPF field
- Show step-based form flow

Version: 2026.1.1"
```

## 🔗 Integração com Git

Para automatizar ainda mais, você pode criar um pre-commit hook:

```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "Atualizando versão..."
cd backend && npm run version:patch
git add ../version.json
```

## ⚙️ Configuração no version.json

```json
{
  "version": "2026.1.1",
  "lastUpdated": "2026-05-06T12:30:45.123Z",
  "major": 2026,
  "minor": 1,
  "patch": 1
}
```

Cada campo é atualizado automaticamente pelo script de bump.
