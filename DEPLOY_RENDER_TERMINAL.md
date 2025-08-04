# 🚀 Deploy no Render via Terminal

## 📋 Pré-requisitos

1. **Conta no Render**: https://render.com
2. **Conta no GitHub**: https://github.com
3. **Git instalado** (já deve estar no Mac)

## 🔧 Passo 1: Preparar o Repositório

### **1.1 Inicializar Git (se não existir)**
```bash
git init
```

### **1.2 Adicionar arquivos necessários**
```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status
```

### **1.3 Fazer commit inicial**
```bash
git commit -m "Initial commit - Google Meet Fake SaaS"
```

## 🔗 Passo 2: Conectar ao GitHub

### **2.1 Criar repositório no GitHub**
1. **Acesse**: https://github.com
2. **Clique** em "New repository"
3. **Nome**: `google-meet-fake-saas`
4. **Deixe público** (Render precisa acessar)
5. **NÃO** inicialize com README
6. **Clique** "Create repository"

### **2.2 Conectar repositório local ao GitHub**
```bash
# Substitua SEU_USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU_USUARIO/google-meet-fake-saas.git

# Enviar código para GitHub
git branch -M main
git push -u origin main
```

## 🎯 Passo 3: Deploy no Render

### **3.1 Criar serviço no Render**
1. **Acesse**: https://dashboard.render.com
2. **Clique** "New +"
3. **Selecione** "Web Service"
4. **Conecte** ao GitHub
5. **Selecione** o repositório `google-meet-fake-saas`

### **3.2 Configurar o serviço**
- **Name**: `google-meet-fake-saas`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server-auth.js`
- **Plan**: `Free`

### **3.3 Configurar variáveis de ambiente**
Clique em "Environment" e adicione:

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://tavinmktdigital:otaviosnow2012@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority` |
| `JWT_SECRET` | `chave_secreta_muito_segura_123456` |
| `CORS_ORIGIN` | `https://seu-app.onrender.com` (será atualizado automaticamente) |

## 📁 Arquivos que DEVEM ser enviados

### **✅ Arquivos Obrigatórios:**
```
✅ package.json
✅ server-auth.js
✅ .env (será ignorado pelo .gitignore)
✅ public/ (pasta completa)
✅ models/ (pasta completa)
✅ routes/ (pasta completa)
✅ middleware/ (pasta completa)
✅ .gitignore
✅ README.md
```

### **❌ Arquivos que NÃO devem ser enviados:**
```
❌ node_modules/ (será instalado no Render)
❌ .env (contém senhas)
❌ uploads/ (pasta de uploads)
❌ *.log (logs)
❌ .DS_Store (arquivos do Mac)
```

## 🔄 Passo 4: Atualizações Futuras

### **4.1 Fazer alterações**
```bash
# Editar arquivos
# ...

# Adicionar mudanças
git add .

# Commit das mudanças
git commit -m "Descrição das mudanças"

# Enviar para GitHub
git push origin main
```

### **4.2 Render fará deploy automático**
- O Render detecta mudanças no GitHub
- Faz deploy automático
- Atualiza a aplicação

## 🧪 Passo 5: Verificar Deploy

### **5.1 Verificar logs**
1. **No Render Dashboard** → Seu serviço
2. **Aba** "Logs"
3. **Verificar** se não há erros

### **5.2 Testar aplicação**
```bash
# Testar API
curl https://seu-app.onrender.com/api/test

# Testar registro
curl -X POST https://seu-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@exemplo.com",
    "password": "Senha123"
  }'
```

## 🚨 Problemas Comuns

### **Problema 1: "Build failed"**
**Solução**:
```bash
# Verificar se package.json está correto
cat package.json

# Verificar se todas as dependências estão listadas
npm list --depth=0
```

### **Problema 2: "Cannot find module"**
**Solução**:
```bash
# Verificar se todos os arquivos foram enviados
git ls-files

# Verificar se node_modules não foi enviado
git status
```

### **Problema 3: "MongoDB connection failed"**
**Solução**:
1. **Verificar** variável `MONGODB_URI` no Render
2. **Confirmar** se o MongoDB Atlas está acessível
3. **Verificar** se a senha está correta

## 📊 Comandos Úteis

### **Verificar status do Git:**
```bash
git status
git log --oneline
```

### **Verificar arquivos que serão enviados:**
```bash
git ls-files
```

### **Forçar push (se necessário):**
```bash
git push -f origin main
```

### **Verificar repositório remoto:**
```bash
git remote -v
```

## 🎯 Checklist de Deploy

- [ ] Git inicializado
- [ ] Arquivos adicionados ao Git
- [ ] Commit inicial feito
- [ ] Repositório criado no GitHub
- [ ] Código enviado para GitHub
- [ ] Serviço criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Aplicação testada

## 📞 Suporte

### **Se der erro no deploy:**
1. **Verifique** os logs no Render
2. **Confirme** se todos os arquivos foram enviados
3. **Teste** localmente primeiro
4. **Verifique** as variáveis de ambiente

### **Comandos de debug:**
```bash
# Verificar se servidor roda localmente
node server-auth.js

# Testar API local
curl http://localhost:10000/api/test

# Verificar arquivos do projeto
ls -la
``` 