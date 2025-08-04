# 📋 Guia de Upload para GitHub

## ✅ ARQUIVOS QUE DEVEM SER ENVIADOS

### 📁 Arquivos Principais:
- `server-render.js` ✅ **IMPORTANTE** (novo servidor)
- `package.json` ✅ (atualizado)
- `render.yaml` ✅
- `.env.example` ✅
- `.gitignore` ✅

### 📁 Pastas Completas:
- `public/` ✅ (toda a pasta)
- `models/` ✅ (toda a pasta)
- `routes/` ✅ (toda a pasta)
- `middleware/` ✅ (toda a pasta)

### 📁 Documentação:
- `README_SAAS.md` ✅
- `DEPLOY_FIXED.md` ✅
- `DEPLOY_MANUAL.md` ✅
- `DEPLOY_RENDER_QUICK.md` ✅

## ❌ ARQUIVOS QUE NÃO DEVEM SER ENVIADOS

### 🔒 Arquivos de Segurança:
- `.env` ❌ **CRÍTICO** (contém senhas reais)
- `node_modules/` ❌ (será instalado no Render)
- `uploads/` ❌ (será criado no Render)

### 🔧 Arquivos de Desenvolvimento:
- `server.js` ❌ (antigo, problemático)
- `server-demo.js` ❌ (apenas para teste local)
- `test-mongodb.js` ❌ (apenas para teste local)
- `check-deploy.sh` ❌ (apenas para teste local)
- `config-mongodb.sh` ❌ (apenas para teste local)

### 📊 Logs e Cache:
- `logs/` ❌
- `*.log` ❌
- `.cache/` ❌

## 🚨 VERIFICAÇÃO ANTES DO UPLOAD

### 1. Verificar se .env NÃO está sendo enviado:
```bash
# O arquivo .env deve estar no .gitignore
# Se aparecer no GitHub, DELETE IMEDIATAMENTE
```

### 2. Verificar se server-render.js está sendo enviado:
```bash
# Este é o arquivo principal agora
# Deve estar no repositório
```

### 3. Verificar se package.json está atualizado:
```bash
# Deve ter "main": "server-render.js"
# Deve ter "start": "node server-render.js"
```

## 📋 Lista de Verificação

Antes de fazer upload, confirme:

- [ ] `.env` NÃO está sendo enviado
- [ ] `server-render.js` está sendo enviado
- [ ] `package.json` está atualizado
- [ ] `node_modules/` NÃO está sendo enviado
- [ ] `uploads/` NÃO está sendo enviado
- [ ] Todas as pastas (`public/`, `models/`, `routes/`, `middleware/`) estão sendo enviadas

## 🔧 Como Fazer Upload Corretamente

### Opção A: GitHub Web
1. Acesse seu repositório no GitHub
2. Clique em "Add file" → "Upload files"
3. Arraste apenas os arquivos da lista ✅
4. **NÃO** arraste arquivos da lista ❌

### Opção B: GitHub Desktop
1. Clone o repositório
2. Copie apenas os arquivos da lista ✅
3. Commit e Push

## 🚨 EMERGÊNCIA

Se você acidentalmente enviou o arquivo `.env`:
1. **DELETE IMEDIATAMENTE** do GitHub
2. **Mude a senha** do MongoDB Atlas
3. **Atualize** as variáveis no Render

## 📞 Suporte

Se tiver dúvidas sobre algum arquivo:
- ✅ = Enviar
- ❌ = NÃO enviar
- 🔒 = Crítico para segurança 