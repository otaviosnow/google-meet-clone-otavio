const express = require('express');
const { processWebhook } = require('../config/mercadopago');
const User = require('../models/User');

const router = express.Router();

// Webhook do Mercado Pago
router.post('/mercadopago', async (req, res) => {
    try {
        console.log('📥 Webhook Mercado Pago recebido:', req.body);
        
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const paymentId = data.id;
            console.log('💰 Processando pagamento:', paymentId);
            
            // Processar webhook
            const result = processWebhook(req.body);
            
            if (result.success) {
                console.log('✅ Webhook processado com sucesso:', result);
                
                // Aqui você pode adicionar lógica para:
                // - Creditar tokens ao usuário
                // - Enviar email de confirmação
                // - Atualizar status do pagamento
                
                res.status(200).json({ success: true, message: 'Webhook processado' });
            } else {
                console.error('❌ Erro ao processar webhook:', result.error);
                res.status(400).json({ success: false, error: result.error });
            }
        } else {
            console.log('⚠️ Tipo de webhook não suportado:', type);
            res.status(200).json({ success: true, message: 'Webhook ignorado' });
        }
        
    } catch (error) {
        console.error('❌ Erro no webhook Mercado Pago:', error);
        res.status(500).json({ success: false, error: 'Erro interno' });
    }
});

// Rota para verificar status do pagamento
router.get('/tokens/transactions/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        console.log('🔍 Verificando status do pagamento:', transactionId);
        
        // Aqui você pode implementar a verificação do status
        // Por enquanto, retornamos um status mock
        res.json({
            success: true,
            transactionId: transactionId,
            status: 'pending',
            message: 'Pagamento em processamento'
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar pagamento:', error);
        res.status(500).json({ success: false, error: 'Erro interno' });
    }
});

module.exports = router;
