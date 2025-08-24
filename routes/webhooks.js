const express = require('express');
const mercadopago = require('mercadopago');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const router = express.Router();

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// POST /api/webhooks/mercadopago - Webhook do Mercado Pago
router.post('/mercadopago', async (req, res) => {
  try {
    console.log('🔍 [WEBHOOK] ===== WEBHOOK RECEBIDO =====');
    console.log('🔍 [WEBHOOK] Headers:', req.headers);
    console.log('🔍 [WEBHOOK] Body:', JSON.stringify(req.body, null, 2));
    
    const { type, data } = req.body;
    
    console.log('🔍 [WEBHOOK] Tipo:', type);
    console.log('🔍 [WEBHOOK] Dados:', data);
    
    // Verificar se é um evento de pagamento
    if (type !== 'payment') {
      console.log('⚠️ [WEBHOOK] Tipo não é payment, ignorando:', type);
      return res.status(200).json({ received: true });
    }
    
    // Buscar detalhes do pagamento no Mercado Pago
    const payment = await mercadopago.payment.get(data.id);
    
    console.log('🔍 [WEBHOOK] Pagamento encontrado:', {
      id: payment.body.id,
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      external_reference: payment.body.external_reference
    });
    
    // Buscar transação no banco
    const transaction = await Transaction.findOne({
      mercadopagoId: payment.body.id.toString()
    });
    
    if (!transaction) {
      console.error('❌ [WEBHOOK] Transação não encontrada para payment ID:', payment.body.id);
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    
    console.log('🔍 [WEBHOOK] Transação encontrada:', {
      id: transaction._id,
      status: transaction.status,
      userId: transaction.user
    });
    
    // Verificar se o status mudou
    if (payment.body.status === transaction.status) {
      console.log('ℹ️ [WEBHOOK] Status não mudou, ignorando');
      return res.status(200).json({ received: true });
    }
    
    // Atualizar status da transação
    transaction.status = payment.body.status;
    
    if (payment.body.status === 'approved') {
      console.log('✅ [WEBHOOK] Pagamento aprovado!');
      
      transaction.paidAt = new Date();
      
      // Creditar tokens ao usuário
      const user = await User.findById(transaction.user);
      if (user) {
        user.visionTokens += transaction.tokens;
        await user.save();
        
        console.log('✅ [WEBHOOK] Tokens creditados:', {
          userId: user._id,
          tokensAdicionados: transaction.tokens,
          tokensTotal: user.visionTokens
        });
      } else {
        console.error('❌ [WEBHOOK] Usuário não encontrado:', transaction.user);
      }
    } else if (payment.body.status === 'rejected') {
      console.log('❌ [WEBHOOK] Pagamento rejeitado');
    } else if (payment.body.status === 'cancelled') {
      console.log('⚠️ [WEBHOOK] Pagamento cancelado');
    }
    
    await transaction.save();
    
    console.log('✅ [WEBHOOK] Transação atualizada:', {
      id: transaction._id,
      novoStatus: transaction.status
    });
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro ao processar webhook:', error);
    console.error('❌ [WEBHOOK] Stack trace:', error.stack);
    
    // Sempre retornar 200 para o Mercado Pago não reenviar
    res.status(200).json({ error: 'Erro interno' });
  }
});

module.exports = router;
