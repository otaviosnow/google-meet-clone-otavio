# 🚀 MIGRAR DO RENDER PARA RAILWAY

## ⚠️ Problema com o Render

O Render está com problemas de cache/deploy que impedem as atualizações de código. Vamos migrar para o Railway, que é mais confiável.

## 🎯 Por que Railway?

- ✅ **Deploy automático** funciona perfeitamente
- ✅ **MongoDB Atlas** integrado
- ✅ **Interface simples** e intuitiva
- ✅ **Gratuito** para projetos pequenos
- ✅ **Mais confiável** que o Render

## 🔧 Passo a Passo para Migrar

### **Passo 1: Criar conta no Railway**
1. **Acesse:** https://railway.app
2. **Clique** "Start a New Project"
3. **Conecte** sua conta GitHub
4. **Selecione** o repositório: `google-meet`

### **Passo 2: Configurar o Projeto**
1. **Clique** "Deploy from GitHub repo"
2. **Selecione** o repositório: `otaviosnow/google-meet`
3. **Aguarde** o deploy inicial

### **Passo 3: Configurar Variáveis de Ambiente**
No Railway Dashboard → seu projeto → Variables:

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` (Railway usa 3000) |
| `MONGODB_URI` | `mongodb+srv://tavinmktdigital:otaviosnow2012@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority` |
| `JWT_SECRET` | `chave_secreta_muito_segura_123456` |

### **Passo 4: Configurar Domínio**
1. **Vá** em "Settings"
2. **Clique** "Generate Domain"
3. **Copie** a URL gerada (ex: `https://google-meet-fake-production.up.railway.app`)

### **Passo 5: Testar o Deploy**
1. **Aguarde** o deploy terminar
2. **Acesse** a URL gerada
3. **Teste** a API: `/api/test`
4. **Teste** o login: deve rejeitar credenciais inválidas

## 🎯 Vantagens do Railway

### **Deploy Automático**
- ✅ **Funciona perfeitamente**
- ✅ **Detecta mudanças** no GitHub
- ✅ **Deploy em segundos**

### **Logs em Tempo Real**
- ✅ **Logs detalhados**
- ✅ **Atualização em tempo real**
- ✅ **Fácil debug**

### **MongoDB Integrado**
- ✅ **Conexão automática**
- ✅ **Sem problemas** de configuração
- ✅ **Backup automático**

## 📞 Próximos Passos

1. **Crie a conta** no Railway
2. **Conecte** o repositório GitHub
3. **Configure** as variáveis de ambiente
4. **Teste** o deploy
5. **Me informe** se funcionou

## 🔄 Após Migrar

### **Atualizar URLs**
- **Dashboard:** `https://sua-url-railway.app/app`
- **API:** `https://sua-url-railway.app/api/test`
- **Meet:** `https://sua-url-railway.app/meet`

### **Testar Funcionalidades**
- ✅ **Login inválido** → deve dar erro
- ✅ **Registro** → deve funcionar
- ✅ **Login válido** → deve funcionar
- ✅ **Dashboard** → deve carregar

**O Railway vai resolver todos os problemas do Render!** 🚀
