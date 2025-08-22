const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { initializePagarme, createPixPayment, checkPaymentStatus, processWebhook } = require('../config/pagarme');
const User = require('../models/User');

const router = express.Router();

// Inicializar cliente Pagar.me
let pagarmeClient = null;

// Função para inicializar o cliente (será chamada quando necessário)
async function getPagarmeClient() {
    if (!pagarmeClient) {
        pagarmeClient = await initializePagarme();
    }
    return pagarmeClient;
}

// Criar pagamento PIX
router.post('/create-pix', authenticateToken, async (req, res) => {
    try {
        const { quantity, amount } = req.body;
        
        if (!quantity || !amount) {
            return res.status(400).json({ 
                success: false, 
                error: 'Quantidade e valor são obrigatórios' 
            });
        }

        // Obter dados do usuário
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'Usuário não encontrado' 
            });
        }

        // Inicializar cliente Pagar.me
        const client = await getPagarmeClient();
        
        // Dados do cliente para o Pagar.me
        const customerData = {
            id: user._id.toString(),
            name: user.name || user.email,
            email: user.email,
            document: user.document || '00000000000'
        };

        // Descrição do pagamento
        const description = `${quantity} tokens CallX - ${user.email}`;

        // Criar pagamento PIX
        const paymentResult = await createPixPayment(client, amount, description, customerData);
        
        if (!paymentResult.success) {
            return res.status(500).json({
                success: false,
                error: paymentResult.error
            });
        }

        // Salvar informações do pagamento no usuário (opcional)
        // Você pode criar um modelo Payment se quiser rastrear pagamentos
        
        console.log(`💰 Pagamento PIX criado para ${user.email}: ${paymentResult.transactionId}`);

        res.json({
            success: true,
            message: 'Pagamento PIX criado com sucesso',
            data: {
                transactionId: paymentResult.transactionId,
                pixQrCode: paymentResult.pixQrCode,
                pixQrCodeUrl: paymentResult.pixQrCodeUrl,
                pixExpiration: paymentResult.pixExpiration,
                amount: paymentResult.amount,
                quantity: quantity
            }
        });

    } catch (error) {
        console.error('❌ Erro ao criar pagamento PIX:', error);
        
        // Verificar se é erro do Pagar.me
        if (error.message && error.message.includes('Pagar.me API error')) {
            console.error('🔍 Detalhes do erro Pagar.me:', {
                response: error.response,
                errors: error.response?.errors,
                status: error.response?.status
            });
            
            res.status(500).json({
                success: false,
                error: `Erro do Pagar.me: ${error.response?.status || 'Desconhecido'} - ${error.response?.errors?.[0]?.message || error.message}`
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor: ' + error.message
            });
        }
    }
});

// Verificar status do pagamento
router.get('/status/:transactionId', authenticateToken, async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        if (!transactionId) {
            return res.status(400).json({
                success: false,
                error: 'ID da transação é obrigatório'
            });
        }

        // Inicializar cliente Pagar.me
        const client = await getPagarmeClient();
        
        // Verificar status
        const statusResult = await checkPaymentStatus(client, transactionId);
        
        if (!statusResult.success) {
            return res.status(500).json({
                success: false,
                error: statusResult.error
            });
        }

        res.json({
            success: true,
            data: statusResult
        });

    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Webhook do Pagar.me (não requer autenticação)
router.post('/webhook', async (req, res) => {
    try {
        const payload = req.body;
        
        console.log('📥 Webhook Pagar.me recebido:', {
            type: payload.type,
            transactionId: payload.current_transaction?.id
        });

        // Processar webhook
        const webhookResult = processWebhook(payload);
        
        if (webhookResult.success && payload.current_transaction?.status === 'paid') {
            // Pagamento confirmado - creditar tokens ao usuário
            const customerId = webhookResult.customerId;
            const amount = webhookResult.amount;
            
            // Calcular quantidade de tokens (R$ 2,00 por token)
            const tokensToAdd = Math.floor(amount / 2);
            
            // Encontrar usuário e adicionar tokens
            const user = await User.findById(customerId);
            if (user) {
                user.visionTokens += tokensToAdd;
                await user.save();
                
                console.log(`✅ Tokens creditados: ${user.email} +${tokensToAdd} tokens (R$ ${amount})`);
            }
        }

        // Sempre retornar 200 para o Pagar.me
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('❌ Erro no webhook:', error);
        res.status(200).json({ received: true }); // Sempre retornar 200
    }
});

// Rota de teste para verificar configuração
router.get('/test', async (req, res) => {
    try {
        const client = await getPagarmeClient();
        
        res.json({
            success: true,
            message: 'Pagar.me configurado corretamente',
            environment: process.env.PAGARME_ENVIRONMENT || 'sandbox'
        });

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        res.status(500).json({
            success: false,
            error: 'Erro na configuração do Pagar.me'
        });
    }
});

module.exports = router;
