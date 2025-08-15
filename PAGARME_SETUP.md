# 🔧 CONFIGURAÇÃO PAGAR.ME - CALLX

## 📋 Pré-requisitos

1. **Conta Pagar.me** ativa
2. **Chave de API** (produção ou sandbox)
3. **Webhook** configurado

## 🔑 Variáveis de Ambiente

Adicione estas variáveis ao seu arquivo `.env`:

```env
# Pagar.me Configuration
PAGARME_API_KEY=ak_test_... # ou ak_live_... para produção
PAGARME_ENVIRONMENT=sandbox # ou production

# Dados da Empresa
COMPANY_DOCUMENT=12345678000199
COMPANY_EMAIL=contato@callx.com
COMPANY_PHONE=+5511999999999

# Webhook URL (para produção)
WEBHOOK_URL=https://google-meet-saas-v2.onrender.com/api/webhooks/pagarme
```

## 🚀 Como Configurar

### 1. **Obter Chave de API**

1. Acesse [dashboard.pagar.me](https://dashboard.pagar.me)
2. Vá em **Configurações** → **API Keys**
3. Copie a chave de **Sandbox** (para testes) ou **Produção**

### 2. **Configurar Webhook**

1. No dashboard do Pagar.me, vá em **Configurações** → **Webhooks**
2. Adicione a URL: `https://google-meet-saas-v2.onrender.com/api/webhooks/pagarme`
3. Selecione os eventos:
   - `transaction.paid`
   - `transaction.updated`

### 3. **Configurar Render.com**

1. Acesse o dashboard do Render
2. Vá em **Environment Variables**
3. Adicione as variáveis do `.env`

## 🔄 Como Funciona

### **Fluxo de Pagamento:**

1. **Usuário** seleciona quantidade de tokens
2. **Sistema** chama API do Pagar.me
3. **Pagar.me** retorna QR Code PIX
4. **Usuário** escaneia QR Code
5. **Pagar.me** envia webhook quando pago
6. **Sistema** credita tokens automaticamente

### **APIs Utilizadas:**

- `POST /api/payments/pix` - Criar pagamento
- `GET /api/payments/status/:id` - Verificar status
- `POST /api/webhooks/pagarme` - Receber webhook

## 🧪 Testes

### **Sandbox (Teste):**
```bash
# Testar configuração
curl https://google-meet-saas-v2.onrender.com/api/payments/test

# Criar pagamento de teste
curl -X POST https://google-meet-saas-v2.onrender.com/api/payments/pix \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5, "amount": 10.00}'
```

### **Produção:**
- Use chave de produção
- Configure webhook real
- Teste com valores pequenos

## 📊 Monitoramento

### **Logs Importantes:**
- `✅ Pagar.me inicializado`
- `💰 Pagamento PIX criado`
- `📥 Webhook recebido`
- `✅ Tokens creditados`

### **Status de Pagamento:**
- `pending` - Aguardando pagamento
- `paid` - Pago (tokens creditados)
- `failed` - Falhou
- `canceled` - Cancelado

## 🔒 Segurança

### **Validações:**
- ✅ Autenticação obrigatória
- ✅ Validação de dados
- ✅ Verificação de webhook
- ✅ Rate limiting (implementar se necessário)

### **Boas Práticas:**
- Use HTTPS sempre
- Valide webhook signature
- Implemente retry logic
- Monitore logs

## 🚨 Troubleshooting

### **Erro: "Pagar.me não configurado"**
- Verifique `PAGARME_API_KEY`
- Confirme ambiente (sandbox/production)

### **Erro: "Webhook não recebido"**
- Verifique URL do webhook
- Confirme eventos selecionados
- Teste com ngrok (desenvolvimento)

### **Erro: "Tokens não creditados"**
- Verifique logs do webhook
- Confirme status da transação
- Verifique dados do usuário

## 📞 Suporte

- **Pagar.me Docs:** [docs.pagar.me](https://docs.pagar.me)
- **API Reference:** [docs.pagar.me/api](https://docs.pagar.me/api)
- **Webhooks:** [docs.pagar.me/webhooks](https://docs.pagar.me/webhooks)

---

## ✅ **CONFIGURAÇÃO CONCLUÍDA!**

Após configurar as variáveis de ambiente, o sistema estará pronto para processar pagamentos PIX reais!
