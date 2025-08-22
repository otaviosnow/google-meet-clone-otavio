# 🚀 Guia de Configuração do Mercado Pago

## 📋 Pré-requisitos

- Conta no Mercado Pago (gratuita)
- Conta verificada no Mercado Pago
- Documento pessoal ou empresarial

## 🎯 Passo a Passo

### 1. Criar Conta no Mercado Pago

1. **Acesse**: https://www.mercadopago.com.br
2. **Clique**: "Criar conta"
3. **Preencha**: Dados pessoais/empresariais
4. **Verifique**: Email e telefone
5. **Complete**: Verificação de identidade

### 2. Acessar Credenciais

1. **Faça login** no Mercado Pago
2. **Vá em**: https://www.mercadopago.com.br/developers/panel/credentials
3. **Selecione**: "Credenciais de teste" (sandbox)

### 3. Obter Access Token

1. **Copie** o "Access Token" de teste
2. **Formato**: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
3. **Guarde** para usar no Render

### 4. Configurar no Render

1. **Acesse**: https://dashboard.render.com
2. **Clique** no seu serviço: `google-meet-saas-v2`
3. **Vá na aba**: Environment
4. **Adicione variável**:
   - **Key**: `MERCADOPAGO_ACCESS_TOKEN`
   - **Value**: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Clique**: "Save"

### 5. Configurar Webhook (Opcional)

1. **No Mercado Pago**: https://www.mercadopago.com.br/developers/panel/notifications
2. **Adicione URL**: `https://google-meet-saas-v2.onrender.com/api/webhooks/mercadopago`
3. **Selecione eventos**: `payment.created`, `payment.updated`

## 🔧 Variáveis de Ambiente

### No Render Dashboard:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `MERCADOPAGO_ACCESS_TOKEN` | `TEST-...` | Token de acesso (sandbox) |
| `MERCADOPAGO_ENVIRONMENT` | `sandbox` | Ambiente (sandbox/production) |
| `COMPANY_DOCUMENT` | `12345678000199` | CNPJ da empresa |
| `COMPANY_EMAIL` | `contato@callx.com` | Email da empresa |
| `COMPANY_PHONE` | `+5511999999999` | Telefone da empresa |
| `WEBHOOK_URL` | `https://...` | URL do webhook |

## 🧪 Teste Sandbox

### Dados de Teste:

**PIX (Sandbox)**:
- **CPF**: `12345678909`
- **Nome**: `Teste Mercado Pago`
- **Email**: `test@mercadopago.com`

### Como Testar:

1. **Acesse**: https://google-meet-saas-v2.onrender.com/comprar-tokens.html
2. **Faça login** (se necessário)
3. **Clique**: "Gerar QR Code PIX (Mercado Pago)"
4. **Escaneie** o QR Code com app bancário
5. **Use dados de teste** para pagamento

## 🚀 Produção

### Para ir para produção:

1. **No Mercado Pago**: Mude para "Credenciais de produção"
2. **Copie** o Access Token de produção
3. **No Render**: Atualize `MERCADOPAGO_ACCESS_TOKEN`
4. **Configure**: `MERCADOPAGO_ENVIRONMENT=production`

## 🐛 Troubleshooting

### Erro 401 Unauthorized:
- Verifique se o Access Token está correto
- Confirme se está usando o ambiente correto (sandbox/production)

### Erro 403 Forbidden:
- Verifique se a conta está verificada
- Confirme se tem permissões para receber pagamentos

### QR Code não aparece:
- Verifique os logs no Render Dashboard
- Confirme se o Mercado Pago está respondendo

### Pagamento não é confirmado:
- Verifique se o webhook está configurado
- Confirme se a URL do webhook está acessível

## 📊 Vantagens do Mercado Pago

✅ **Mais fácil de configurar**
✅ **Documentação em português**
✅ **Suporte brasileiro**
✅ **Menos restrições de permissões**
✅ **Integração nativa com PIX**
✅ **Dashboard intuitivo**

## 📞 Suporte

- **Mercado Pago**: https://www.mercadopago.com.br/developers/support
- **Documentação**: https://www.mercadopago.com.br/developers/docs
- **Render Logs**: Dashboard do Render → Logs

## 🎯 Próximos Passos

1. **Configure** o Access Token no Render
2. **Teste** o pagamento PIX
3. **Verifique** se os tokens são creditados
4. **Configure** webhook (opcional)
5. **Teste** em produção quando necessário

**O Mercado Pago é muito mais simples que o Pagar.me!** 🚀
