# 🔧 Como Verificar e Configurar Variáveis no Render

## 📍 Onde Encontrar as Variáveis

### **Passo 1: Acessar o Dashboard do Render**
1. **Acesse**: https://dashboard.render.com
2. **Clique** no seu serviço: `google-meet-fake-saas`
3. **Vá** na aba "Environment"

## 🔍 Como Verificar as Variáveis

### **Passo 2: Verificar Variáveis Existentes**
No Render Dashboard → Environment, você deve ver:

| Variável | Valor Esperado | Status |
|----------|----------------|--------|
| `NODE_ENV` | `production` | ⚠️ Verificar |
| `PORT` | `10000` | ⚠️ Verificar |
| `MONGODB_URI` | `mongodb+srv://tavinmktdigital:otaviosnow2012@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority` | ⚠️ Verificar |
| `JWT_SECRET` | `chave_secreta_muito_segura_123456` | ⚠️ Verificar |
| `CORS_ORIGIN` | `https://seu-app.onrender.com` | ⚠️ Verificar |

## ⚙️ Como Configurar/Editar Variáveis

### **Passo 3: Adicionar/Editar Variáveis**
1. **No Render Dashboard** → Environment
2. **Clique** em "Add Environment Variable"
3. **Configure** cada variável:

#### **Variável 1: NODE_ENV**
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Clique**: "Save"

#### **Variável 2: PORT**
- **Key**: `PORT`
- **Value**: `10000`
- **Clique**: "Save"

#### **Variável 3: MONGODB_URI**
- **Key**: `MONGODB_URI`
- **Value**: `mongodb+srv://tavinmktdigital:otaviosnow2012@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority`
- **Clique**: "Save"

#### **Variável 4: JWT_SECRET**
- **Key**: `JWT_SECRET`
- **Value**: `chave_secreta_muito_segura_123456`
- **Clique**: "Save"

#### **Variável 5: CORS_ORIGIN**
- **Key**: `CORS_ORIGIN`
- **Value**: `https://seu-app.onrender.com` (substitua pela URL real do seu app)
- **Clique**: "Save"

## 🚨 Problemas Comuns

### **Problema 1: Variável não aparece**
**Solução**:
- Clique "Add Environment Variable"
- Digite o nome e valor
- Clique "Save"

### **Problema 2: Valor incorreto**
**Solução**:
- Clique no lápis ✏️ ao lado da variável
- Edite o valor
- Clique "Save"

### **Problema 3: URL do CORS incorreta**
**Solução**:
- Pegue a URL real do seu app no Render
- Atualize a variável `CORS_ORIGIN`
- Exemplo: `https://google-meet-fake-saas.onrender.com`

## 📋 Checklist de Verificação

Após configurar, confirme:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `MONGODB_URI` = string completa do MongoDB Atlas
- [ ] `JWT_SECRET` = chave secreta
- [ ] `CORS_ORIGIN` = URL correta do seu app

## 🔄 Após Configurar Variáveis

### **Passo 4: Re-deploy**
1. **Vá** na aba "Manual Deploy"
2. **Clique** "Deploy latest commit"
3. **Aguarde** o deploy terminar
4. **Teste** a aplicação

## 🧪 Como Testar

### **Após o deploy, teste:**

1. **API Test**: `https://seu-app.onrender.com/api/test`
2. **Dashboard**: `https://seu-app.onrender.com`
3. **Demo**: `https://seu-app.onrender.com/meet/demo`

## 📞 Suporte

### **Se der erro:**
1. **Verifique** os logs no Render Dashboard → Logs
2. **Confirme** se todas as variáveis estão configuradas
3. **Teste** a conexão MongoDB localmente
4. **Re-deploy** se necessário

### **Logs importantes:**
- ✅ "Conectado ao MongoDB Atlas"
- ✅ "Servidor Render rodando na porta 10000"
- ❌ "Erro ao conectar ao MongoDB"
- ❌ "Variável não definida" 