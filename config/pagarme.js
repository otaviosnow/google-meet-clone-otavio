// Configuração do Pagar.me
const pagarme = require('pagarme');

// Configurações do ambiente
const PAGARME_CONFIG = {
    // Chave de API do Pagar.me (produção ou sandbox)
    apiKey: process.env.PAGARME_API_KEY || 'ak_test_...',
    
    // Ambiente (production ou sandbox)
    environment: process.env.PAGARME_ENVIRONMENT || 'sandbox',
    
    // Configurações da empresa
    company: {
        name: 'CallX',
        document: process.env.COMPANY_DOCUMENT || '12345678000199',
        email: process.env.COMPANY_EMAIL || 'contato@callx.com',
        phone: process.env.COMPANY_PHONE || '+5511999999999'
    },
    
    // Configurações de pagamento
    payment: {
        // Tempo de expiração do PIX (em segundos)
        pixExpiration: 3600, // 1 hora
        
        // Configurações de notificação
        webhookUrl: process.env.WEBHOOK_URL || 'https://google-meet-saas-v2.onrender.com/api/webhooks/pagarme'
    }
};

// Função para inicializar o cliente Pagar.me
function initializePagarme() {
    try {
        console.log('🔧 [PAGARME] Iniciando configuração...');
        console.log('🔑 [PAGARME] API Key:', PAGARME_CONFIG.apiKey ? 'Configurada' : 'NÃO CONFIGURADA');
        console.log('🌍 [PAGARME] Ambiente:', PAGARME_CONFIG.environment);
        
        if (!PAGARME_CONFIG.apiKey || PAGARME_CONFIG.apiKey === 'ak_test_...') {
            throw new Error('Chave API do Pagar.me não configurada. Configure PAGARME_API_KEY no Render.');
        }
        
        const client = pagarme.client.connect({
            api_key: PAGARME_CONFIG.apiKey
        });
        
        console.log('✅ Pagar.me inicializado com sucesso');
        console.log(`🌍 Ambiente: ${PAGARME_CONFIG.environment}`);
        
        return client;
    } catch (error) {
        console.error('❌ Erro ao inicializar Pagar.me:', error);
        throw error;
    }
}

// Função para criar pagamento PIX
async function createPixPayment(client, amount, description, customerData = {}) {
    try {
        const paymentData = {
            amount: Math.round(amount * 100), // Pagar.me trabalha em centavos
            payment_method: 'pix',
            pix_expiration_date: new Date(Date.now() + (PAGARME_CONFIG.payment.pixExpiration * 1000)).toISOString(),
            customer: {
                external_id: customerData.id || 'customer_' + Date.now(),
                name: customerData.name || 'Cliente CallX',
                email: customerData.email || 'cliente@callx.com',
                type: 'individual',
                country: 'br',
                documents: [
                    {
                        type: 'cpf',
                        number: customerData.document || '00000000000'
                    }
                ]
            },
            billing: {
                name: customerData.name || 'Cliente CallX',
                address: {
                    country: 'br',
                    state: 'SP',
                    city: 'São Paulo',
                    neighborhood: 'Centro',
                    street: 'Rua Exemplo',
                    street_number: '123',
                    zipcode: '01234-567'
                }
            },
            items: [
                {
                    id: 'tokens_callx',
                    title: description,
                    unit_price: Math.round(amount * 100),
                    quantity: 1,
                    tangible: false
                }
            ]
        };

        console.log('🔄 Criando pagamento PIX...');
        const transaction = await client.transactions.create(paymentData);
        
        console.log('✅ Pagamento PIX criado:', transaction.id);
        
        return {
            success: true,
            transactionId: transaction.id,
            pixQrCode: transaction.pix_qr_code,
            pixQrCodeUrl: transaction.pix_qr_code_url,
            pixExpiration: transaction.pix_expiration_date,
            amount: amount,
            status: transaction.status
        };
        
    } catch (error) {
        console.error('❌ Erro ao criar pagamento PIX:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Função para verificar status do pagamento
async function checkPaymentStatus(client, transactionId) {
    try {
        const transaction = await client.transactions.find({ id: transactionId });
        
        return {
            success: true,
            transactionId: transaction.id,
            status: transaction.status,
            amount: transaction.amount / 100, // Converter de centavos
            paidAt: transaction.paid_at
        };
        
    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Função para processar webhook do Pagar.me
function processWebhook(payload) {
    try {
        console.log('📥 Webhook recebido:', payload.type);
        
        if (payload.type === 'transaction') {
            const transaction = payload.current_transaction;
            
            return {
                success: true,
                transactionId: transaction.id,
                status: transaction.status,
                amount: transaction.amount / 100,
                paidAt: transaction.paid_at,
                customerId: transaction.customer.external_id
            };
        }
        
        return {
            success: false,
            error: 'Tipo de webhook não suportado'
        };
        
    } catch (error) {
        console.error('❌ Erro ao processar webhook:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    PAGARME_CONFIG,
    initializePagarme,
    createPixPayment,
    checkPaymentStatus,
    processWebhook
};
