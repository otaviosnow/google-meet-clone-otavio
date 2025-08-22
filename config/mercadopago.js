// Configuração do Mercado Pago
const mercadopago = require('mercadopago');

// Configurações do ambiente
const MERCADOPAGO_CONFIG = {
    // Access Token do Mercado Pago (sandbox ou produção)
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-...',
    
    // Ambiente (sandbox ou produção)
    environment: process.env.MERCADOPAGO_ENVIRONMENT || 'production',
    
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
        webhookUrl: process.env.WEBHOOK_URL || 'https://google-meet-saas-v2.onrender.com/api/webhooks/mercadopago'
    }
};

// Função para inicializar o cliente Mercado Pago
function initializeMercadoPago() {
    try {
        console.log('🔧 [MERCADOPAGO] Iniciando configuração...');
        console.log('🔑 [MERCADOPAGO] Access Token:', MERCADOPAGO_CONFIG.accessToken ? 'Configurado' : 'NÃO CONFIGURADO');
        console.log('🌍 [MERCADOPAGO] Ambiente:', MERCADOPAGO_CONFIG.environment);
        
        if (!MERCADOPAGO_CONFIG.accessToken || MERCADOPAGO_CONFIG.accessToken === 'TEST-...') {
            throw new Error('Access Token do Mercado Pago não configurado. Configure MERCADOPAGO_ACCESS_TOKEN no Render.');
        }
        
        // Configurar o SDK do Mercado Pago
        mercadopago.configure({
            access_token: MERCADOPAGO_CONFIG.accessToken
        });
        
        console.log('✅ Mercado Pago inicializado com sucesso');
        console.log(`🌍 Ambiente: ${MERCADOPAGO_CONFIG.environment}`);
        
        return mercadopago;
    } catch (error) {
        console.error('❌ Erro ao inicializar Mercado Pago:', error);
        throw error;
    }
}

// Função para criar pagamento PIX
async function createPixPayment(amount, description, customerData = {}) {
    try {
        const paymentData = {
            transaction_amount: amount, // Mercado Pago trabalha em reais
            description: description,
            payment_method_id: 'pix',
            payer: {
                email: customerData.email || 'cliente@callx.com',
                first_name: customerData.name ? customerData.name.split(' ')[0] : 'Cliente',
                last_name: customerData.name ? customerData.name.split(' ').slice(1).join(' ') : 'CallX',
                identification: {
                    type: 'CPF',
                    number: customerData.document || '00000000000'
                }
            },
            notification_url: MERCADOPAGO_CONFIG.payment.webhookUrl,
            external_reference: customerData.id || `order_${Date.now()}`,
            expires: true,
            expiration_date_to: new Date(Date.now() + (MERCADOPAGO_CONFIG.payment.pixExpiration * 1000)).toISOString()
        };

        console.log('🔄 Criando pagamento PIX...');
        console.log('📊 Dados do pagamento:', JSON.stringify(paymentData, null, 2));
        
        const payment = await mercadopago.payment.save(paymentData);
        console.log('✅ Pagamento PIX criado:', payment.body.id);
        
        return {
            success: true,
            transactionId: payment.body.id,
            pixQrCode: payment.body.point_of_interaction.transaction_data.qr_code,
            pixQrCodeUrl: payment.body.point_of_interaction.transaction_data.qr_code_base64,
            pixExpiration: payment.body.date_of_expiration,
            amount: amount,
            status: payment.body.status
        };
        
    } catch (error) {
        console.error('❌ Erro ao criar pagamento PIX:', error);
        console.error('❌ Detalhes do erro Mercado Pago:', {
            message: error.message,
            status: error.status,
            response: error.response
        });
        return {
            success: false,
            error: error.message
        };
    }
}

// Função para verificar status do pagamento
async function checkPaymentStatus(transactionId) {
    try {
        const payment = await mercadopago.payment.get(transactionId);
        
        return {
            success: true,
            transactionId: payment.body.id,
            status: payment.body.status,
            amount: payment.body.transaction_amount,
            paidAt: payment.body.date_approved
        };
        
    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Função para processar webhook do Mercado Pago
function processWebhook(payload) {
    try {
        console.log('📥 Webhook recebido:', payload.type);
        
        if (payload.type === 'payment') {
            const payment = payload.data;
            
            return {
                success: true,
                transactionId: payment.id,
                status: payment.status,
                amount: payment.transaction_amount,
                paidAt: payment.date_approved,
                customerId: payment.external_reference
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
    MERCADOPAGO_CONFIG,
    initializeMercadoPago,
    createPixPayment,
    checkPaymentStatus,
    processWebhook
};
