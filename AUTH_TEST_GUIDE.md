# 🔐 Guia de Teste do Sistema de Autenticação

## 🚀 Como Testar

### **Passo 1: Iniciar o Servidor**
```bash
node server-auth.js
```

### **Passo 2: Acessar a Aplicação**
- **URL**: http://localhost:10000
- **API Test**: http://localhost:10000/api/test

## 📋 Testes de Funcionalidade

### **1. Teste de Registro**
1. **Clique** em "Registrar" ou "Criar Conta"
2. **Preencha** os campos:
   - Nome: `Teste Usuário`
   - Email: `teste@exemplo.com`
   - Senha: `Senha123` (deve ter maiúscula, minúscula e número)
3. **Clique** "Registrar"
4. **Resultado esperado**: Conta criada, usuário logado automaticamente

### **2. Teste de Login**
1. **Faça logout** (se estiver logado)
2. **Clique** em "Entrar"
3. **Preencha**:
   - Email: `teste@exemplo.com`
   - Senha: `Senha123`
4. **Clique** "Entrar"
5. **Resultado esperado**: Login realizado com sucesso

### **3. Teste de Recuperação de Senha**
1. **Clique** em "Esqueci minha senha"
2. **Digite** o email: `teste@exemplo.com`
3. **Clique** "Enviar Link de Recuperação"
4. **Resultado esperado**: Token de recuperação exibido (em produção seria enviado por email)

### **4. Teste de Redefinição de Senha**
1. **Copie** o token de recuperação exibido
2. **Clique** em "Voltar ao Login"
3. **Cole** o token no campo "Token de Recuperação"
4. **Digite** nova senha: `NovaSenha456`
5. **Confirme** a senha
6. **Clique** "Redefinir Senha"
7. **Resultado esperado**: Senha redefinida com sucesso

### **5. Teste de Login com Nova Senha**
1. **Faça login** com a nova senha: `NovaSenha456`
2. **Resultado esperado**: Login realizado com sucesso

## 🔍 Verificações no MongoDB

### **Conectar ao MongoDB Atlas**
1. **Acesse**: https://cloud.mongodb.com
2. **Vá** em "Browse Collections"
3. **Procure** pela coleção `users`

### **Verificar Usuário Criado**
```javascript
// No MongoDB Compass ou Shell
db.users.findOne({ email: "teste@exemplo.com" })
```

**Campos esperados:**
- `name`: "Teste Usuário"
- `email`: "teste@exemplo.com"
- `password`: (hash bcrypt)
- `isActive`: true
- `createdAt`: (timestamp)
- `updatedAt`: (timestamp)

## 🚨 Problemas Comuns

### **Problema 1: "Email já está em uso"**
**Solução**: Use um email diferente ou delete o usuário no MongoDB

### **Problema 2: "Senha deve ter pelo menos 6 caracteres"**
**Solução**: Use senha com pelo menos 6 caracteres, uma maiúscula, uma minúscula e um número

### **Problema 3: "Token inválido ou expirado"**
**Solução**: 
- Use o token correto (copie exatamente)
- Tokens expiram em 1 hora
- Gere um novo token

### **Problema 4: "Erro ao conectar ao MongoDB"**
**Solução**:
1. **Verifique** o `.env`:
   ```
   MONGODB_URI=mongodb+srv://tavinmktdigital:otaviosnow2012@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority
   JWT_SECRET=chave_secreta_muito_segura_123456
   ```
2. **Teste** a conexão: `node test-mongodb.js`

## 📊 Logs Importantes

### **Registro bem-sucedido:**
```
✅ Conectado ao MongoDB Atlas
🚀 Servidor de Autenticação rodando na porta 10000
POST /api/auth/register - 201
```

### **Login bem-sucedido:**
```
POST /api/auth/login - 200
```

### **Recuperação de senha:**
```
POST /api/auth/forgot-password - 200
```

## 🧪 Testes Automatizados

### **Teste via cURL:**

#### **1. Registrar usuário:**
```bash
curl -X POST http://localhost:10000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuário",
    "email": "teste@exemplo.com",
    "password": "Senha123"
  }'
```

#### **2. Fazer login:**
```bash
curl -X POST http://localhost:10000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "Senha123"
  }'
```

#### **3. Solicitar recuperação:**
```bash
curl -X POST http://localhost:10000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com"
  }'
```

## ✅ Checklist de Verificação

- [ ] Servidor inicia sem erros
- [ ] Conexão com MongoDB estabelecida
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] Recuperação de senha funciona
- [ ] Redefinição de senha funciona
- [ ] Usuário salvo no MongoDB
- [ ] Token JWT gerado corretamente
- [ ] Validações funcionam
- [ ] Interface responsiva

## 🚀 Próximos Passos

1. **Teste** todas as funcionalidades
2. **Verifique** se os dados estão no MongoDB
3. **Teste** o sistema completo (vídeos, reuniões)
4. **Deploy** no Render
5. **Configure** variáveis de ambiente no Render

## 📞 Suporte

### **Se algo não funcionar:**
1. **Verifique** os logs do servidor
2. **Confirme** a conexão MongoDB
3. **Teste** as rotas via cURL
4. **Verifique** o console do navegador
5. **Confirme** as variáveis de ambiente 