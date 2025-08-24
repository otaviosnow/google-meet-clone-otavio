const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { initializeMercadoPago, createPixPayment, checkPaymentStatus, processWebhook } = require('../config/mercadopago');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Inicializar cliente Mercado Pago
let mercadopagoClient = null;

// Função para inicializar o cliente (será chamada quando necessário)
async function getMercadoPagoClient() {
    if (!mercadopagoClient) {
        mercadopagoClient = await initializeMercadoPago();
    }
    return mercadopagoClient;
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

        // Inicializar cliente Mercado Pago
        const client = await getMercadoPagoClient();
        
        // Dados do cliente para o Mercado Pago
        const customerData = {
            id: user._id.toString(),
            name: user.name || user.email,
            email: user.email,
            document: user.document || '00000000000'
        };

        // Descrição do pagamento
        const description = `${quantity} tokens CallX - ${user.email}`;

        // Criar pagamento PIX
        const paymentResult = await createPixPayment(amount, description, customerData);
        
        if (!paymentResult.success) {
            return res.status(500).json({
                success: false,
                error: paymentResult.error
            });
        }

        // Salvar transação no banco de dados
        const transaction = new Transaction({
            user: user._id,
            amount: amount,
            tokens: quantity,
            paymentMethod: 'pix',
            status: 'pending',
            pagarmeId: paymentResult.transactionId, // Usando o ID do Mercado Pago
            pixCode: paymentResult.pixQrCode,
            pixQrCode: paymentResult.pixQrCodeUrl,
            expiresAt: paymentResult.pixExpiration
        });

        await transaction.save();
        
        console.log(`💰 Pagamento PIX criado para ${user.email}: ${paymentResult.transactionId}`);
        console.log(`💾 Transação salva no banco: ${transaction._id}`);

        res.json({
            success: true,
            message: 'Pagamento PIX criado com sucesso',
            data: {
                transactionId: transaction._id, // Usando o ID do nosso banco
                mercadopagoId: paymentResult.transactionId, // ID do Mercado Pago
                pixQrCode: paymentResult.pixQrCode,
                pixQrCodeUrl: paymentResult.pixQrCodeUrl,
                pixExpiration: paymentResult.pixExpiration,
                amount: paymentResult.amount,
                quantity: quantity
            }
        });

    } catch (error) {
        console.error('❌ Erro ao criar pagamento PIX:', error);
        
        // Verificar se é erro do Mercado Pago
        if (error.message && error.message.includes('Mercado Pago API error')) {
            console.error('🔍 Detalhes do erro Mercado Pago:', {
                response: error.response,
                errors: error.response?.errors,
                status: error.response?.status
            });
            
            res.status(500).json({
                success: false,
                error: `Erro do Mercado Pago: ${error.response?.status || 'Desconhecido'} - ${error.response?.errors?.[0]?.message || error.message}`
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

// Buscar dados completos do pagamento (incluindo QR Code)
router.get('/payment/:transactionId', authenticateToken, async (req, res) => {
    try {
        const { transactionId } = req.params;
        console.log('🔍 Buscando dados completos do pagamento:', transactionId);

        // Inicializar cliente Mercado Pago
        const client = await getMercadoPagoClient();
        
        // Buscar pagamento no Mercado Pago
        const payment = await client.payment.get(transactionId);
        
        if (payment && payment.body) {
            const paymentData = payment.body;
            
            // Extrair dados do PIX
            const pixData = paymentData.point_of_interaction?.transaction_data;
            
            res.json({
                success: true,
                data: {
                    transactionId: transactionId,
                    status: paymentData.status,
                    amount: paymentData.transaction_amount,
                    pixQrCode: pixData?.qr_code,
                    pixQrCodeUrl: pixData?.qr_code_base64,
                    externalReference: paymentData.external_reference
                },
                message: 'Dados do pagamento recuperados com sucesso'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Pagamento não encontrado'
            });
        }
    } catch (error) {
        console.error('❌ Erro ao buscar dados do pagamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota de teste para verificar configuração
router.get('/test', async (req, res) => {
    try {
        const client = await getMercadoPagoClient();
        
        res.json({
            success: true,
            message: 'Mercado Pago configurado corretamente',
            environment: process.env.MERCADOPAGO_ENVIRONMENT || 'production'
        });

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        res.status(500).json({
            success: false,
            error: 'Erro na configuração do Mercado Pago'
        });
    }
});

module.exports = router;
