# 📁 Guia de Arquivos para Upload

## ✅ **ARQUIVOS QUE DEVEM SER ENVIADOS**

### **📄 Arquivos Principais (OBRIGATÓRIOS)**
```
✅ server-auth.js          (servidor principal)
✅ package.json            (dependências)
✅ package-lock.json       (versões exatas)
✅ .gitignore             (ignora arquivos sensíveis)
```

### **📁 Pastas Completas (OBRIGATÓRIAS)**
```
✅ public/                (frontend completo)
   ├── index.html
   ├── meet.html
   ├── css/
   ├── js/
   ├── images/
   └── test-auth.html

✅ models/                (modelos MongoDB)
   ├── User.js
   ├── Video.js
   └── Meeting.js

✅ routes/                (rotas da API)
   ├── auth.js
   ├── videos.js
   ├── meetings.js
   └── users.js

✅ middleware/            (middlewares)
   └── auth.js
```

### **📄 Arquivos de Configuração (OPCIONAIS)**
```
✅ render.yaml            (configuração Render)
✅ ecosystem.config.js    (configuração PM2)
✅ Dockerfile            (containerização)
✅ env.example           (exemplo de variáveis)
```

### **📄 Documentação (OPCIONAIS)**
```
✅ README.md             (documentação principal)
✅ README_SAAS.md        (documentação SaaS)
✅ *.md                  (outros guias)
```

## ❌ **ARQUIVOS QUE NÃO DEVEM SER ENVIADOS**

### **🔒 Arquivos Sensíveis (NUNCA ENVIAR)**
```
❌ .env                   (contém senhas reais)
❌ .env.local
❌ .env.production
```

### **📦 Dependências (NÃO ENVIAR)**
```
❌ node_modules/          (instalado no Render)
❌ npm-debug.log*
❌ yarn-debug.log*
❌ yarn-error.log*
```

### **📁 Uploads e Dados (NÃO ENVIAR)**
```
❌ uploads/              (pasta de uploads)
❌ *.mp4                 (vídeos grandes)
❌ *.webm
❌ *.avi
❌ *.mov
❌ *.mkv
```

### **🖥️ Arquivos do Sistema (NÃO ENVIAR)**
```
❌ .DS_Store             (macOS)
❌ .DS_Store?
❌ ._*
❌ Thumbs.db             (Windows)
❌ ehthumbs.db
```

### **🔧 Arquivos de Desenvolvimento (NÃO ENVIAR)**
```
❌ *.log                 (logs)
❌ .vscode/              (configurações IDE)
❌ .idea/
❌ *.swp
❌ *.swo
```

## 🚀 **Como Fazer Upload Manual**

### **Opção 1: Git (Recomendado)**
```bash
# Adicionar apenas arquivos necessários
git add server-auth.js
git add package.json
git add package-lock.json
git add .gitignore
git add public/
git add models/
git add routes/
git add middleware/
git add render.yaml
git add README.md

# Verificar o que será enviado
git status

# Fazer commit
git commit -m "Initial commit - Google Meet Fake SaaS"

# Enviar para GitHub
git push origin main
```

### **Opção 2: Upload Manual no GitHub**
1. **Acesse**: https://github.com/SEU_USUARIO/google-meet-fake-saas
2. **Clique** "Add file" → "Upload files"
3. **Arraste** os arquivos necessários
4. **NÃO** arraste:
   - `node_modules/`
   - `.env`
   - `uploads/`
   - `*.mp4`

## 📋 **Checklist de Upload**

### **✅ Verificar antes do upload:**
- [ ] `server-auth.js` está presente
- [ ] `package.json` está presente
- [ ] `public/` pasta está completa
- [ ] `models/` pasta está presente
- [ ] `routes/` pasta está presente
- [ ] `middleware/` pasta está presente
- [ ] `.gitignore` está presente
- [ ] `.env` NÃO está sendo enviado
- [ ] `node_modules/` NÃO está sendo enviado
- [ ] `uploads/` NÃO está sendo enviado

## 🔍 **Verificar após upload**

### **No GitHub:**
1. **Verifique** se todos os arquivos estão lá
2. **Verifique** se não há arquivos sensíveis
3. **Verifique** se as pastas estão completas

### **No Render:**
1. **Verifique** se o build não falha
2. **Verifique** se o servidor inicia
3. **Verifique** se a API funciona

## 🚨 **Problemas Comuns**

### **"Build failed"**
- Verificar se `package.json` está correto
- Verificar se todas as dependências estão listadas

### **"Cannot find module"**
- Verificar se todos os arquivos foram enviados
- Verificar se `node_modules` não foi enviado

### **"Environment variables missing"**
- Configurar variáveis no Render Dashboard
- Verificar se `.env` não foi enviado

## 📊 **Comandos Úteis**

```bash
# Verificar arquivos que serão enviados
git status

# Verificar arquivos ignorados
git status --ignored

# Verificar tamanho dos arquivos
du -sh *

# Verificar se .env está sendo ignorado
git check-ignore .env
```

## 🎯 **Resumo Final**

### **ENVIAR:**
- ✅ Arquivos de código (`.js`, `.json`, `.html`, `.css`)
- ✅ Pastas de código (`public/`, `models/`, `routes/`, `middleware/`)
- ✅ Arquivos de configuração (`.gitignore`, `render.yaml`)
- ✅ Documentação (`.md`)

### **NÃO ENVIAR:**
- ❌ Arquivos sensíveis (`.env`)
- ❌ Dependências (`node_modules/`)
- ❌ Uploads (`uploads/`, `*.mp4`)
- ❌ Arquivos do sistema (`.DS_Store`)

**Siga esta lista e o deploy funcionará perfeitamente!** 