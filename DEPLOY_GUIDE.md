# 🚀 Guia Rápido de Deploy - Google Meet Fake SaaS

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Render (gratuita)
- Conta no MongoDB Atlas (gratuita)

## 🎯 Deploy no Render (Recomendado)

### 1. Preparar o Repositório

```bash
# Clone o projeto
git clone <seu-repositorio>
cd google-meet-fake-saas

# Adicione ao GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Configurar MongoDB Atlas

1. **Acesse [MongoDB Atlas](https://cloud.mongodb.com)**
2. **Crie uma conta gratuita**
3. **Crie um cluster** (M0 - Free)
4. **Configure o IP** (0.0.0.0/0 para qualquer IP)
5. **Crie um usuário** com senha
6. **Copie a string de conexão**

### 3. Deploy no Render

1. **Acesse [Render](https://render.com)**
2. **Clique em "New +" → "Web Service"**
3. **Conecte seu repositório GitHub**
4. **Configure o serviço**:
   - **Name**: `google-meet-fake-saas`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **Adicione as variáveis de ambiente**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   JWT_SECRET=sua_chave_secreta_muito_segura_aqui
   CORS_ORIGIN=https://seu-app.onrender.com
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=100000000
   ```

6. **Clique em "Create Web Service"**

### 4. Testar o Deploy

- Aguarde o build (2-3 minutos)
- Acesse a URL fornecida pelo Render
- Teste o registro e login
- Teste o upload de vídeo
- Teste a criação de reunião

## 🎯 Deploy no Hostinger

### 1. Configurar Node.js no Hostinger

1. **Acesse o painel do Hostinger**
2. **Vá em "Aplicações" → "Node.js"**
3. **Crie uma nova aplicação**:
   - **Nome**: `google-meet-fake-saas`
   - **Versão Node.js**: `18.x`
   - **Porta**: `3000`

### 2. Upload dos Arquivos

```bash
# Via Git (recomendado)
git clone <seu-repositorio>
cd google-meet-fake-saas
git remote add hostinger <url-do-hostinger>
git push hostinger main

# Ou via FTP
# Faça upload de todos os arquivos para a pasta da aplicação
```

### 3. Configurar Variáveis de Ambiente

No painel do Hostinger:
1. **Vá em "Aplicações" → Sua App → "Variáveis de Ambiente"**
2. **Adicione as variáveis**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   JWT_SECRET=sua_chave_secreta_muito_segura_aqui
   CORS_ORIGIN=https://seu-dominio.com
   ```

### 4. Iniciar a Aplicação

1. **Vá em "Aplicações" → Sua App**
2. **Clique em "Iniciar"**
3. **Aguarde o status "Running"**

## 🔧 Configurações Importantes

### MongoDB Atlas

```javascript
// String de conexão exemplo
mongodb+srv://username:password@cluster.mongodb.net/google-meet-fake?retryWrites=true&w=majority
```

### JWT Secret

```bash
# Gere uma chave segura
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### CORS Origin

```javascript
// Para desenvolvimento
CORS_ORIGIN=http://localhost:3000

// Para produção (Render)
CORS_ORIGIN=https://seu-app.onrender.com

// Para produção (Hostinger)
CORS_ORIGIN=https://seu-dominio.com
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Build Falha
```bash
# Verifique se todas as dependências estão no package.json
npm install

# Verifique se o Node.js está na versão correta
node --version
```

#### MongoDB não conecta
```bash
# Verifique a string de conexão
# Confirme se o IP está liberado (0.0.0.0/0)
# Teste a conexão com MongoDB Compass
```

#### Upload não funciona
```bash
# Verifique permissões da pasta uploads/
# Confirme MAX_FILE_SIZE
# Teste com arquivo pequeno primeiro
```

#### CORS Error
```bash
# Verifique CORS_ORIGIN
# Confirme se a URL está correta
# Teste com * temporariamente
```

### Logs

#### Render
- Acesse o dashboard do Render
- Vá em "Logs" para ver os logs em tempo real

#### Hostinger
- Acesse o painel do Hostinger
- Vá em "Aplicações" → Sua App → "Logs"

## 📊 Monitoramento

### Métricas Importantes
- **Tempo de resposta** da API
- **Uso de memória** da aplicação
- **Conexões** com MongoDB
- **Uploads** de vídeo
- **Visualizações** de reuniões

### Alertas Recomendados
- **Erro 500** - Problemas no servidor
- **Timeout** - Requisições lentas
- **MongoDB** - Problemas de conexão
- **Upload** - Falhas no upload

## 🔒 Segurança

### Checklist
- [ ] HTTPS habilitado
- [ ] JWT_SECRET seguro
- [ ] Rate limiting ativo
- [ ] Validação de dados
- [ ] Sanitização de inputs
- [ ] CORS configurado
- [ ] Headers de segurança

### Recomendações
- Use variáveis de ambiente para secrets
- Monitore logs regularmente
- Faça backup do MongoDB
- Atualize dependências
- Use firewall adequado

## 🚀 Próximos Passos

### Após o Deploy
1. **Teste todas as funcionalidades**
2. **Configure domínio personalizado**
3. **Configure SSL/HTTPS**
4. **Configure backup automático**
5. **Configure monitoramento**
6. **Configure analytics**

### Melhorias
- [ ] CDN para vídeos
- [ ] Cache com Redis
- [ ] Compressão de vídeo
- [ ] Thumbnails automáticos
- [ ] Sistema de planos
- [ ] API pública

---

**🎉 Seu SaaS está pronto para uso!** 