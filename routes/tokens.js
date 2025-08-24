const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: errors.array()
        });
    }
    next();
};

// Validações para compra de tokens
const purchaseValidation = [
    body('tokens')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantidade de tokens deve ser entre 1 e 100'),
    body('paymentMethod')
        .isIn(['pix', 'credit_card', 'debit_card'])
        .withMessage('Método de pagamento inválido')
];

// POST /api/tokens/purchase - Criar compra de tokens
router.post('/purchase', authenticateToken, purchaseValidation, handleValidationErrors, async (req, res) => {
    try {
        const { tokens, paymentMethod } = req.body;
        const tokenPrice = 2.00; // R$ 2,00 por token
        const amount = tokens * tokenPrice;

        console.log('💰 [TOKENS] Iniciando compra:', {
            userId: req.user._id,
            tokens,
            paymentMethod,
            amount
        });

        // Criar transação
        const transaction = new Transaction({
            user: req.user._id,
            amount,
            tokens,
            paymentMethod,
            status: 'pending'
        });

        await transaction.save();
        console.log('✅ [TOKENS] Transação criada:', transaction._id);

        // Se for PIX, gerar QR Code
        if (paymentMethod === 'pix') {
            try {
                // Aqui você integraria com a API do Pagar.me
                // Por enquanto, vamos simular
                const pixData = await generatePixPayment(transaction);
                
                transaction.pixCode = pixData.pixCode;
                transaction.pixQrCode = pixData.pixQrCode;
                transaction.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
                transaction.pagarmeId = pixData.pagarmeId;
                
                await transaction.save();
                
                console.log('✅ [TOKENS] PIX gerado para transação:', transaction._id);
                
                res.json({
                    message: 'Compra iniciada com sucesso',
                    transaction: transaction.toPublicJSON(),
                    pixData: {
                        code: pixData.pixCode,
                        qrCode: pixData.pixQrCode,
                        expiresAt: transaction.expiresAt
                    }
                });
            } catch (pixError) {
                console.error('❌ [TOKENS] Erro ao gerar PIX:', pixError);
                transaction.status = 'failed';
                await transaction.save();
                
                res.status(500).json({
                    error: 'Erro ao gerar PIX. Tente novamente.'
                });
            }
        } else {
            // Para cartão de crédito/débito
            try {
                const cardData = await processCardPayment(transaction);
                
                transaction.pagarmeId = cardData.pagarmeId;
                transaction.pagarmeStatus = cardData.status;
                
                if (cardData.status === 'paid') {
                    transaction.status = 'paid';
                    transaction.paidAt = new Date();
                    
                    // Adicionar tokens ao usuário
                    const user = await User.findById(req.user._id);
                    user.visionTokens += tokens;
                    await user.save();
                    
                    console.log('✅ [TOKENS] Pagamento aprovado, tokens adicionados');
                } else {
                    transaction.status = 'failed';
                }
                
                await transaction.save();
                
                res.json({
                    message: cardData.status === 'paid' ? 'Pagamento aprovado!' : 'Pagamento recusado',
                    transaction: transaction.toPublicJSON(),
                    tokensAdded: cardData.status === 'paid' ? tokens : 0
                });
            } catch (cardError) {
                console.error('❌ [TOKENS] Erro no pagamento com cartão:', cardError);
                transaction.status = 'failed';
                await transaction.save();
                
                res.status(500).json({
                    error: 'Erro no processamento do pagamento. Tente novamente.'
                });
            }
        }

    } catch (error) {
        console.error('❌ [TOKENS] Erro ao criar compra:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/tokens/transactions - Listar transações do usuário
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            transactions: transactions.map(t => t.toPublicJSON())
        });
    } catch (error) {
        console.error('❌ [TOKENS] Erro ao listar transações:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/tokens/transactions/:transactionId - Buscar transação específica
router.get('/transactions/:transactionId', authenticateToken, async (req, res) => {
    try {
        const { transactionId } = req.params;
        console.log('🔍 [TOKENS] Buscando transação:', transactionId);
        console.log('🔍 [TOKENS] User ID:', req.user._id);
        console.log('🔍 [TOKENS] Params:', req.params);
        
        console.log('🔍 [TOKENS] Buscando transação com ID:', transactionId);
        console.log('🔍 [TOKENS] User ID:', req.user._id);
        
        // Primeiro, verificar se a transação existe (sem filtro de usuário)
        const allTransactions = await Transaction.find({ _id: transactionId });
        console.log('🔍 [TOKENS] Todas as transações com este ID:', allTransactions);
        
        const transaction = await Transaction.findOne({ 
            _id: transactionId,
            user: req.user._id 
        });

        console.log('🔍 [TOKENS] Transação encontrada para o usuário:', transaction);

        if (!transaction) {
            console.log('❌ [TOKENS] Transação não encontrada');
            return res.status(404).json({
                error: 'Transação não encontrada'
            });
        }

        const result = {
            transaction: transaction.toPublicJSON()
        };
        
        console.log('✅ [TOKENS] Retornando transação:', result);
        res.json(result);
    } catch (error) {
        console.error('❌ [TOKENS] Erro ao buscar transação:', error);
        console.error('❌ [TOKENS] Stack trace:', error.stack);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// POST /api/tokens/webhook - Webhook do Pagar.me
router.post('/webhook', async (req, res) => {
    try {
        console.log('🔔 [TOKENS] Webhook recebido:', req.body);
        
        // Aqui você validaria a assinatura do webhook do Pagar.me
        const { id, status, type } = req.body;
        
        if (type === 'charge.paid') {
            const transaction = await Transaction.findOne({ pagarmeId: id });
            
            if (transaction && transaction.status === 'pending') {
                transaction.status = 'paid';
                transaction.paidAt = new Date();
                transaction.pagarmeStatus = status;
                await transaction.save();
                
                // Adicionar tokens ao usuário
                const user = await User.findById(transaction.user);
                user.visionTokens += transaction.tokens;
                await user.save();
                
                console.log('✅ [TOKENS] Pagamento confirmado via webhook, tokens adicionados');
            }
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('❌ [TOKENS] Erro no webhook:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Função para gerar PIX (simulação - substitua pela integração real do Pagar.me)
async function generatePixPayment(transaction) {
    // Simular integração com Pagar.me
    return {
        pixCode: `PIX-${transaction._id}-${Date.now()}`,
        pixQrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
        pagarmeId: `pagarme_${transaction._id}`
    };
}

// Função para processar pagamento com cartão (simulação)
async function processCardPayment(transaction) {
    // Simular processamento
    return {
        pagarmeId: `pagarme_${transaction._id}`,
        status: 'paid' // ou 'failed' para simular recusa
    };
}

module.exports = router;
