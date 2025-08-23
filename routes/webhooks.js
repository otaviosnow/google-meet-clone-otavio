const express = require('express');
const { processWebhook, checkPaymentStatus, initializeMercadoPago } = require('../config/mercadopago');
const User = require('../models/User');
const mercadopago = require('mercadopago');

const router = express.Router();

// Webhook do Mercado Pago
router.post('/mercadopago', async (req, res) => {
    try {
        console.log('📥 Webhook Mercado Pago recebido:', req.body);
        
        // Mercado Pago envia { resource: 'id', topic: 'payment' }
        const { resource, topic } = req.body;
        
        if (topic === 'payment') {
            const paymentId = resource;
            console.log('💰 Processando pagamento:', paymentId);
            
            // Processar webhook
            const result = processWebhook({ type: 'payment', data: { id: paymentId } });
            
            if (result.success) {
                console.log('✅ Webhook processado com sucesso:', result);
                
                // Verificar se o pagamento foi aprovado
                const paymentStatus = await checkPaymentStatus(paymentId);
                
                if (paymentStatus.success && paymentStatus.status === 'approved') {
                    console.log('💰 Pagamento aprovado! Creditando tokens...');
                    
                    // Buscar o pagamento original para pegar os dados
                    const payment = await mercadopago.payment.get(paymentId);
                    const externalReference = payment.body.external_reference;
                    const amount = payment.body.transaction_amount;
                    
                    console.log('📊 Dados do pagamento:', {
                        externalReference,
                        amount,
                        status: paymentStatus.status
                    });
                    
                    // Calcular tokens (R$ 2,00 por token)
                    const tokensToAdd = Math.floor(amount / 2);
                    
                    // Buscar usuário pelo external_reference (que deve ser o ID do usuário)
                    const user = await User.findById(externalReference);
                    
                    if (user) {
                        // Adicionar tokens
                        user.visionTokens += tokensToAdd;
                        await user.save();
                        
                        console.log(`✅ Tokens creditados: ${user.email} +${tokensToAdd} tokens (R$ ${amount})`);
                        console.log(`🎫 Total de tokens: ${user.visionTokens}`);
                    } else {
                        console.error('❌ Usuário não encontrado:', externalReference);
                    }
                } else {
                    console.log('⚠️ Pagamento não aprovado ainda:', paymentStatus.status);
                }
                
                res.status(200).json({ success: true, message: 'Webhook processado' });
            } else {
                console.error('❌ Erro ao processar webhook:', result.error);
                res.status(400).json({ success: false, error: result.error });
            }
        } else {
            console.log('⚠️ Tipo de webhook não suportado:', topic);
            res.status(200).json({ success: true, message: 'Webhook ignorado' });
        }
        
    } catch (error) {
        console.error('❌ Erro no webhook Mercado Pago:', error);
        res.status(500).json({ success: false, error: 'Erro interno' });
    }
});

// Rota para verificar status do pagamento
router.get('/transactions/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        console.log('🔍 Verificando status do pagamento:', transactionId);
        
        // Inicializar cliente Mercado Pago
        const client = await initializeMercadoPago();
        
        // Verificar status real no Mercado Pago
        const paymentStatus = await checkPaymentStatus(transactionId);
        
        if (paymentStatus.success) {
            res.json({
                success: true,
                transactionId: transactionId,
                status: paymentStatus.status,
                statusDetail: paymentStatus.statusDetail,
                amount: paymentStatus.amount,
                message: 'Status do pagamento consultado com sucesso'
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Transação não encontrada ou erro ao verificar' 
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar pagamento:', error);
        res.status(500).json({ success: false, error: 'Erro interno' });
    }
});

module.exports = router;
