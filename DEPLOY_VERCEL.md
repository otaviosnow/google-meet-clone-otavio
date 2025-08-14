# 🚀 DEPLOY NO VERCEL

## 🎯 Por que Vercel?

- ✅ **Totalmente gratuito** para projetos pessoais
- ✅ **Deploy automático** funciona perfeitamente
- ✅ **Interface moderna** e intuitiva
- ✅ **Logs em tempo real**
- ✅ **Sem problemas** de cache
- ✅ **Muito mais confiável** que Render

## 🔧 Passo a Passo

### **Passo 1: Criar conta no Vercel**
1. **Acesse:** https://vercel.com
2. **Clique** "Sign Up"
3. **Conecte** sua conta GitHub
4. **Autorize** o Vercel

### **Passo 2: Importar Projeto**
1. **Clique** "New Project"
2. **Selecione** o repositório: `otaviosnow/google-meet-clone-otavio`
3. **Clique** "Import"

### **Passo 3: Configurar Projeto**
1. **Nome do projeto:** `google-meet-clone-otavio` (ou qualquer nome)
2. **Framework Preset:** `Node.js`
3. **Root Directory:** `./` (deixar padrão)
4. **Build Command:** deixar vazio (usar padrão)
5. **Output Directory:** deixar vazio (usar padrão)
6. **Install Command:** `npm install`

### **Passo 4: Configurar Variáveis de Ambiente**
Antes de fazer deploy, clique em "Environment Variables" e adicione:

| Nome | Valor |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MONGODB_URI` | `mongodb+srv://tavinmktdigital:otaviosnow2012@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority` |
| `JWT_SECRET` | `chave_secreta_muito_segura_123456` |

### **Passo 5: Deploy**
1. **Clique** "Deploy"
2. **Aguarde** o deploy terminar (~2-3 minutos)
3. **Copie** a URL gerada (ex: `https://google-meet-clone-otavio.vercel.app`)

## 🎯 Vantagens do Vercel

### **Deploy Automático**
- ✅ **Detecta mudanças** no GitHub automaticamente
- ✅ **Deploy em segundos**
- ✅ **Preview** de cada commit
- ✅ **Rollback** fácil

### **Logs e Debug**
- ✅ **Logs em tempo real**
- ✅ **Fácil debug**
- ✅ **Métricas** de performance
- ✅ **Analytics** integrado

### **Performance**
- ✅ **CDN global**
- ✅ **Edge functions**
- ✅ **Muito rápido**
- ✅ **Escalável**

## 📞 Próximos Passos

1. **Crie a conta** no Vercel
2. **Importe** o projeto GitHub
3. **Configure** as variáveis de ambiente
4. **Faça** o deploy
5. **Teste** a aplicação

## 🔄 Após o Deploy

### **URLs da Aplicação**
- **Dashboard:** `https://sua-url.vercel.app/app`
- **API:** `https://sua-url.vercel.app/api/test`
- **Meet:** `https://sua-url.vercel.app/meet`

### **Testar Funcionalidades**
- ✅ **Login inválido** → deve dar erro
- ✅ **Registro** → deve funcionar
- ✅ **Login válido** → deve funcionar
- ✅ **Dashboard** → deve carregar

## 🚨 Se Houver Problemas

### **Problema 1: Build falhou**
**Solução:**
- Verifique se todas as dependências estão no `package.json`
- Verifique se o `vercel.json` está correto

### **Problema 2: Variáveis não configuradas**
**Solução:**
- Vá em "Settings" → "Environment Variables"
- Adicione todas as variáveis listadas acima

### **Problema 3: MongoDB não conecta**
**Solução:**
- Verifique se a string `MONGODB_URI` está correta
- Teste a conexão localmente primeiro

**O Vercel vai resolver todos os problemas!** 🚀
