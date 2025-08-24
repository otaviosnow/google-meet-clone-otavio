const express = require('express');
const mercadopago = require('mercadopago');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// POST /api/payments/create-pix - Criar pagamento PIX
router.post('/create-pix', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 [PAYMENT] ===== INICIANDO CRIAÇÃO DE PIX =====');
    console.log('🔍 [PAYMENT] Usuário:', req.user._id);
    console.log('🔍 [PAYMENT] Body:', req.body);
    
    const { tokens } = req.body;
    
    if (!tokens || tokens < 1) {
      console.error('❌ [PAYMENT] Quantidade de tokens inválida:', tokens);
      return res.status(400).json({ error: 'Quantidade de tokens inválida' });
    }
    
    // Calcular valor (R$ 2,00 por token)
    const amountInReais = tokens * 2;
    const amountInCents = Math.round(amountInReais * 100);
    
    console.log('🔍 [PAYMENT] Valor calculado:', {
      tokens,
      amountInReais,
      amountInCents
    });
    
    // Criar pagamento no Mercado Pago
    const paymentData = {
      transaction_amount: amountInReais,
      description: `${tokens} token${tokens > 1 ? 's' : ''} - CallX`,
      payment_method_id: 'pix',
      payer: {
        email: req.user.email,
        first_name: req.user.name.split(' ')[0] || 'Usuário',
        last_name: req.user.name.split(' ').slice(1).join(' ') || 'CallX'
      },
      notification_url: process.env.WEBHOOK_URL,
      external_reference: req.user._id.toString()
    };
    
    console.log('🔍 [PAYMENT] Dados do pagamento:', paymentData);
    
    const payment = await mercadopago.payment.save(paymentData);
    
    console.log('✅ [PAYMENT] Pagamento criado no Mercado Pago:', {
      id: payment.body.id,
      status: payment.body.status,
      status_detail: payment.body.status_detail
    });
    
    // Extrair dados do PIX
    const pixData = payment.body.point_of_interaction.transaction_data.qr_code;
    const qrCodeBase64 = payment.body.point_of_interaction.transaction_data.qr_code_base64;
    
    console.log('🔍 [PAYMENT] Dados PIX extraídos:', {
      qrCode: pixData ? pixData.substring(0, 50) + '...' : 'N/A',
      qrCodeBase64: qrCodeBase64 ? 'Base64 presente' : 'N/A'
    });
    
    // Calcular expiração (30 minutos)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    
    // Salvar transação no banco
    const transaction = new Transaction({
      mercadopagoId: payment.body.id.toString(),
      user: req.user._id,
      tokens: tokens,
      amount: amountInCents,
      status: 'pending',
      pix: {
        qrCode: pixData,
        qrCodeBase64: qrCodeBase64,
        expiresAt: expiresAt
      }
    });
    
    await transaction.save();
    
    console.log('✅ [PAYMENT] Transação salva no banco:', {
      id: transaction._id,
      mercadopagoId: transaction.mercadopagoId
    });
    
    // Retornar dados para o frontend
    const response = {
      transactionId: transaction._id,
      mercadopagoId: transaction.mercadopagoId,
      qrCode: pixData,
      qrCodeBase64: qrCodeBase64,
      expiresAt: expiresAt,
      amount: amountInReais,
      tokens: tokens
    };
    
    console.log('✅ [PAYMENT] Resposta enviada:', {
      transactionId: response.transactionId,
      mercadopagoId: response.mercadopagoId,
      qrCodeLength: response.qrCode ? response.qrCode.length : 0,
      qrCodeBase64Length: response.qrCodeBase64 ? response.qrCodeBase64.length : 0
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ [PAYMENT] Erro ao criar PIX:', error);
    console.error('❌ [PAYMENT] Stack trace:', error.stack);
    
    res.status(500).json({ 
      error: 'Erro ao criar pagamento PIX',
      details: error.message 
    });
  }
});

// GET /api/payments/status/:transactionId - Verificar status do pagamento
router.get('/status/:transactionId', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 [STATUS] ===== VERIFICANDO STATUS =====');
    console.log('🔍 [STATUS] Transaction ID:', req.params.transactionId);
    console.log('🔍 [STATUS] Usuário:', req.user._id);
    
    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      user: req.user._id
    });
    
    if (!transaction) {
      console.error('❌ [STATUS] Transação não encontrada');
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    
    console.log('🔍 [STATUS] Transação encontrada:', {
      id: transaction._id,
      mercadopagoId: transaction.mercadopagoId,
      status: transaction.status
    });
    
    // Se já está aprovada, retornar
    if (transaction.status === 'approved') {
      console.log('✅ [STATUS] Transação já aprovada');
      return res.json({
        status: 'approved',
        transactionId: transaction._id,
        tokens: transaction.tokens,
        amount: transaction.amount / 100
      });
    }
    
    // Verificar no Mercado Pago
    const payment = await mercadopago.payment.get(transaction.mercadopagoId);
    
    console.log('🔍 [STATUS] Status no Mercado Pago:', {
      id: payment.body.id,
      status: payment.body.status,
      status_detail: payment.body.status_detail
    });
    
    // Atualizar status se mudou
    if (payment.body.status !== transaction.status) {
      transaction.status = payment.body.status;
      
      if (payment.body.status === 'approved') {
        transaction.paidAt = new Date();
        
        // Creditar tokens ao usuário
        const user = await User.findById(req.user._id);
        user.tokens += transaction.tokens;
        await user.save();
        
        console.log('✅ [STATUS] Tokens creditados:', {
          userId: user._id,
          tokensAdicionados: transaction.tokens,
          tokensTotal: user.tokens
        });
      }
      
      await transaction.save();
      
      console.log('✅ [STATUS] Status atualizado:', transaction.status);
    }
    
    res.json({
      status: transaction.status,
      transactionId: transaction._id,
      tokens: transaction.tokens,
      amount: transaction.amount / 100
    });
    
  } catch (error) {
    console.error('❌ [STATUS] Erro ao verificar status:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar status do pagamento',
      details: error.message 
    });
  }
});

module.exports = router;
