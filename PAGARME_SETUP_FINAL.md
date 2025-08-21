# 🔧 CONFIGURAÇÃO FINAL PAGAR.ME - CALLX

## ✅ Chave API Configurada
**Sua chave API:** `sk_9616854ea1654a9386a716249ce57976`

## 📋 Passos para Configurar no Render

### 1. Acessar o Dashboard do Render
1. Vá para: https://dashboard.render.com
2. Faça login na sua conta
3. Selecione o projeto `google-meet-saas-v2`

### 2. Configurar Variáveis de Ambiente
1. No dashboard do projeto, vá em **Environment**
2. Clique em **Add Environment Variable**
3. Adicione as seguintes variáveis:

```
PAGARME_API_KEY=sk_9616854ea1654a9386a716249ce57976
PAGARME_ENVIRONMENT=sandbox
COMPANY_DOCUMENT=12345678000199
COMPANY_EMAIL=contato@callx.com
COMPANY_PHONE=+5511999999999
WEBHOOK_URL=https://google-meet-saas-v2.onrender.com/api/webhooks/pagarme
```

### 3. Configurar Webhook no Pagar.me
1. Acesse: https://dashboard.pagar.me
2. Vá em **Configurações** → **Webhooks**
3. Clique em **Adicionar Webhook**
4. Configure:
   - **URL:** `https://google-meet-saas-v2.onrender.com/api/webhooks/pagarme`
   - **Eventos:** Selecione todos os eventos de pagamento

### 4. Fazer Deploy
1. No Render, clique em **Manual Deploy**
2. Selecione **Deploy latest commit**
3. Aguarde o deploy completar

## 🧪 Testar Integração

### Teste de Pagamento PIX
1. Acesse: https://google-meet-saas-v2.onrender.com
2. Faça login
3. Vá em **Tokens** → **Comprar Tokens**
4. Teste um pagamento PIX de R$ 1,00

### Verificar Logs
1. No Render, vá em **Logs**
2. Procure por mensagens:
   - `✅ Pagar.me inicializado com sucesso`
   - `🔄 Criando pagamento PIX...`
   - `✅ Pagamento PIX criado:`

## 🔍 Troubleshooting

### Erro: "Pagar.me não configurado"
- Verifique se `PAGARME_API_KEY` está configurada
- Verifique se o deploy foi feito após adicionar as variáveis

### Erro: "API Key inválida"
- Verifique se a chave está correta
- Verifique se está no ambiente correto (sandbox/production)

### Webhook não funciona
- Verifique se a URL está correta
- Verifique se o webhook foi adicionado no Pagar.me
- Verifique os logs do Render

## 📞 Suporte
- **Pagar.me Docs:** https://docs.pagar.me
- **Render Docs:** https://render.com/docs

## ✅ Status da Configuração
- [ ] Variáveis de ambiente configuradas no Render
- [ ] Webhook configurado no Pagar.me
- [ ] Deploy realizado
- [ ] Teste de pagamento realizado
- [ ] Logs verificados
