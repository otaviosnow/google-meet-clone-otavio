# 🚀 Deploy Rápido no Render

## ⚡ Método Automático (Recomendado)

### **Passo 1: Executar script automático**
```bash
./deploy-render.sh
```

O script vai:
- ✅ Verificar se Git está instalado
- ✅ Inicializar Git
- ✅ Adicionar arquivos
- ✅ Fazer commit
- ✅ Pedir URL do GitHub
- ✅ Enviar para GitHub
- ✅ Dar instruções para Render

## 🔧 Método Manual

### **Passo 1: Instalar Git (se necessário)**
```bash
xcode-select --install
```

### **Passo 2: Inicializar Git**
```bash
git init
git add .
git commit -m "Initial commit"
```

### **Passo 3: Criar repositório no GitHub**
1. **Acesse**: https://github.com/new
2. **Nome**: `google-meet-fake-saas`
3. **Deixe público**
4. **NÃO** inicialize com README
5. **Clique** "Create repository"

### **Passo 4: Enviar para GitHub**
```bash
git remote add origin https://github.com/SEU_USUARIO/google-meet-fake-saas.git
git branch -M main
git push -u origin main
```

### **Passo 5: Deploy no Render**
1. **Acesse**: https://dashboard.render.com
2. **Clique** "New +" → "Web Service"
3. **Conecte** ao GitHub
4. **Selecione** o repositório
5. **Configure**:
   - **Name**: `google-meet-fake-saas`
   - **Build Command**: `npm install`
   - **Start Command**: `node server-auth.js`

### **Passo 6: Variáveis de Ambiente**
No Render Dashboard → Environment:

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://tavinmktdigital:otaviosnow2012@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority` |
| `JWT_SECRET` | `chave_secreta_muito_segura_123456` |

## 📁 Arquivos Importantes

### **✅ Serão enviados:**
- `server-auth.js` (servidor principal)
- `package.json` (dependências)
- `public/` (frontend)
- `models/` (modelos MongoDB)
- `routes/` (rotas da API)
- `middleware/` (middlewares)
- `.gitignore` (ignora arquivos sensíveis)

### **❌ NÃO serão enviados:**
- `node_modules/` (instalado no Render)
- `.env` (contém senhas)
- `uploads/` (pasta de uploads)

## 🔄 Atualizações Futuras

### **Para atualizar:**
```bash
# Fazer mudanças nos arquivos
# ...

# Adicionar e enviar
git add .
git commit -m "Descrição das mudanças"
git push origin main

# Render fará deploy automático
```

## 🧪 Testar Deploy

### **Após o deploy:**
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

### **"Build failed"**
- Verificar se `package.json` está correto
- Verificar se todas as dependências estão listadas

### **"Cannot find module"**
- Verificar se todos os arquivos foram enviados
- Verificar se `node_modules` não foi enviado

### **"MongoDB connection failed"**
- Verificar variável `MONGODB_URI` no Render
- Verificar se MongoDB Atlas está acessível

## 📞 Suporte

### **Se der erro:**
1. **Verificar** logs no Render Dashboard
2. **Testar** localmente primeiro
3. **Verificar** variáveis de ambiente
4. **Confirmar** se todos os arquivos foram enviados

### **Comandos úteis:**
```bash
# Verificar status
git status

# Verificar arquivos enviados
git ls-files

# Testar localmente
node server-auth.js
``` 