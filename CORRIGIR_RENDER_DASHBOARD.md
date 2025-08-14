# 🔧 Corrigir Render Dashboard - Forçar server-render.js

## 🚨 **Problema Identificado:**

O Render está executando `server.js` em vez de `server-render.js` mesmo com as configurações corretas.

## ✅ **Solução: Corrigir no Dashboard do Render**

### **Passo 1: Acessar o Dashboard**
1. **Vá para**: https://dashboard.render.com
2. **Clique** no seu serviço `google-meet-saas`
3. **Vá** na aba "Settings"

### **Passo 2: Corrigir Build Command**
Na seção "Build & Deploy":

**Build Command:**
```
chmod +x render-build.sh && ./render-build.sh
```

**Start Command:**
```
npm start
```

### **Passo 3: Verificar Environment Variables**
Na seção "Environment Variables":

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

### **Passo 4: Forçar Deploy Manual**
1. **Vá** na aba "Manual Deploy"
2. **Clique** em "Deploy latest commit"
3. **Aguarde** o deploy terminar

## 🔧 **Configurações Específicas**

### **Se o problema persistir, tente:**

**Opção 1: Start Command direto**
```
node server-render.js
```

**Opção 2: Start Command com npm**
```
npm start
```

**Opção 3: Start Command com path completo**
```
node ./server-render.js
```

## 📋 **Verificar Logs**

Após o deploy, verifique os logs:

1. **Vá** na aba "Logs"
2. **Procure** por estas mensagens:
   - ✅ "🚀 Servidor Render otimizado iniciado!"
   - ✅ "📋 API: http://localhost:10000/api/test"
   - ❌ "server.js" (não deve aparecer)

## 🚨 **Se ainda der erro:**

### **Problema 1: "Cannot find module"**
**Solução**: Verificar se server-render.js foi enviado
```bash
# No terminal local
git ls-files | grep server-render.js
```

### **Problema 2: "Build failed"**
**Solução**: Verificar render-build.sh
```bash
# No terminal local
chmod +x render-build.sh
./render-build.sh
```

### **Problema 3: "Port already in use"**
**Solução**: Render usa PORT automático
```javascript
// No server-render.js já está correto:
const PORT = process.env.PORT || 10000;
```

## 🎯 **URLs de Teste**

Após corrigir, teste:

1. **API Test**: `https://seu-app.onrender.com/api/test`
2. **Página Principal**: `https://seu-app.onrender.com/`
3. **Meet**: `https://seu-app.onrender.com/meet`
4. **App**: `https://seu-app.onrender.com/app`

## 📊 **Checklist Final:**

- [ ] ✅ Build Command corrigido no dashboard
- [ ] ✅ Start Command corrigido no dashboard
- [ ] ✅ Environment Variables configuradas
- [ ] ✅ Deploy manual executado
- [ ] ✅ Logs verificados
- [ ] ✅ URLs testadas

**Execute as correções no dashboard do Render agora!** 