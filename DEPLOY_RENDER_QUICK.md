# 🚀 Deploy Rápido no Render

## 📋 Passo a Passo

### 1. Criar Repositório GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# Criar repo no GitHub e conectar
git remote add origin https://github.com/seu-usuario/google-meet-fake-saas.git
git push -u origin main
```

### 2. Deploy no Render
1. Acesse: https://dashboard.render.com
2. Clique "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `google-meet-fake-saas`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Configurar Variáveis de Ambiente
No Render Dashboard → Environment:

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://tavinmktdigital:SUA_SENHA@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `chave_secreta_muito_segura_123456` |
| `CORS_ORIGIN` | `https://seu-app.onrender.com` |

### 4. Testar
- **Dashboard**: `https://seu-app.onrender.com`
- **Demo**: `https://seu-app.onrender.com/meet/demo`

## 🎯 URLs Finais
- **SaaS**: `https://seu-app.onrender.com`
- **Chamada Demo**: `https://seu-app.onrender.com/meet/demo`
- **API**: `https://seu-app.onrender.com/api` 