// Constantes
const TOKEN_PRICE = 2.00;

// Variáveis globais
let paymentCheckInterval;
let countdownInterval;
let qrExpirationTime = 30 * 60 * 1000; // 30 minutos em ms

// Elementos DOM
const qrCodeContainer = document.getElementById('qrCodeContainer');
const pixCodeInput = document.getElementById('pixCode');
const copyPixCodeBtn = document.getElementById('copyPixCode');
const modalQuantity = document.getElementById('modalQuantity');
const modalTotal = document.getElementById('modalTotal');
const countdownTime = document.getElementById('countdownTime');
const expirationCounter = document.getElementById('expirationCounter');
const successModal = document.getElementById('successModal');
const successTokens = document.getElementById('successTokens');
const successTotal = document.getElementById('successTotal');
const backToDashboardBtn = document.getElementById('backToDashboard');

// Função principal
async function initializePayment() {
    try {
        // Pegar parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const quantity = parseInt(urlParams.get('quantity')) || 5;
        const amount = quantity * TOKEN_PRICE;
        const transactionId = urlParams.get('transactionId');

        console.log('🔍 Parâmetros da URL:', { quantity, amount, transactionId });

        // Atualizar informações na tela
        modalQuantity.textContent = quantity;
        modalTotal.textContent = amount.toFixed(2).replace('.', ',');

        // Se não tem transactionId, criar novo pagamento
        if (!transactionId) {
            console.log('🔄 Criando novo pagamento PIX...');
            await createPixPayment(quantity, amount);
        } else {
            console.log('🔄 Carregando pagamento existente...');
            await loadExistingPayment(transactionId);
        }

        // Iniciar contador de expiração
        startExpirationCountdown();

        // Iniciar verificação de status do pagamento
        startPaymentStatusCheck(transactionId);

    } catch (error) {
        console.error('❌ Erro ao inicializar pagamento:', error);
        alert('Erro ao carregar pagamento. Tente novamente.');
    }
}

// Criar pagamento PIX
async function createPixPayment(quantity, amount) {
    try {
        const response = await fetch('/api/payments/create-pix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                quantity: quantity,
                amount: amount
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Pagamento PIX criado:', result);

        if (result.success && result.data) {
            // Gerar QR Code
            generateQRCode(result.data.pixQrCodeUrl || result.data.pixQrCode);
            
            // Preencher código PIX
            pixCodeInput.value = result.data.pixQrCode || result.data.pixQrCodeUrl || '';
            
            // Salvar transactionId na URL
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('transactionId', result.data.transactionId || result.transactionId);
            window.history.replaceState({}, '', newUrl);
            
            // Iniciar verificação com o novo transactionId
            startPaymentStatusCheck(result.data.transactionId || result.transactionId);
        } else {
            throw new Error(result.message || 'Erro ao criar pagamento');
        }

    } catch (error) {
        console.error('❌ Erro ao criar pagamento PIX:', error);
        alert('Erro ao gerar QR Code PIX. Tente novamente.');
    }
}

// Carregar pagamento existente
async function loadExistingPayment(transactionId) {
    try {
        // Primeiro, tentar buscar dados completos do pagamento
        const response = await fetch(`/api/payments/payment/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Pagamento carregado:', result);

        if (result.success && result.data) {
            // Gerar QR Code
            generateQRCode(result.data.pixQrCodeUrl || result.data.pixQrCode);
            
            // Preencher código PIX
            pixCodeInput.value = result.data.pixQrCode || result.data.pixQrCodeUrl || '';
        } else {
            throw new Error(result.message || 'Erro ao carregar pagamento');
        }

    } catch (error) {
        console.error('❌ Erro ao carregar pagamento:', error);
        alert('Erro ao carregar pagamento. Tente novamente.');
    }
}

// Gerar QR Code
function generateQRCode(qrCodeData) {
    if (!qrCodeData) {
        console.error('❌ Dados do QR Code não fornecidos');
        return;
    }

    console.log('🔄 Gerando QR Code com dados:', qrCodeData);

    // Limpar container
    qrCodeContainer.innerHTML = '';

    // Verificar se a biblioteca QR Code está disponível
    if (typeof QRCode === 'undefined') {
        console.error('❌ Biblioteca QR Code não carregada');
        qrCodeContainer.innerHTML = '<p style="color: red;">Erro: Biblioteca QR Code não carregada</p>';
        return;
    }

    try {
        // Gerar QR Code usando qrcodejs
        new QRCode(qrCodeContainer, {
            text: qrCodeData,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#FFFFFF',
            correctLevel: QRCode.CorrectLevel.H
        });
        
        console.log('✅ QR Code gerado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao gerar QR Code:', error);
        qrCodeContainer.innerHTML = '<p style="color: red;">Erro ao gerar QR Code</p>';
    }
}

// Iniciar contador de expiração
function startExpirationCountdown() {
    const startTime = Date.now();
    const endTime = startTime + qrExpirationTime;

    countdownInterval = setInterval(() => {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownTime.textContent = '00:00';
            expirationCounter.classList.add('expired');
            expirationCounter.innerHTML = '<i class="fas fa-exclamation-triangle"></i> QR Code expirado';
            return;
        }

        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        countdownTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Aviso quando faltar 5 minutos
        if (timeLeft <= 5 * 60 * 1000) {
            expirationCounter.classList.add('warning');
        }
    }, 1000);
}

// Parar contador de expiração
function stopExpirationCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// Iniciar verificação de status do pagamento
function startPaymentStatusCheck(transactionId) {
    if (!transactionId) {
        console.error('❌ TransactionId não fornecido');
        return;
    }

    console.log('🔄 Iniciando verificação de status para:', transactionId);

    paymentCheckInterval = setInterval(async () => {
        try {
                    const response = await fetch(`/api/tokens/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('📊 Status do pagamento:', result);

            if (result.success && result.status === 'approved') {
                console.log('✅ Pagamento aprovado!');
                stopExpirationCountdown();
                showSuccessModal();
                clearInterval(paymentCheckInterval);
            }

        } catch (error) {
            console.error('❌ Erro ao verificar status:', error);
        }
    }, 5000); // Verificar a cada 5 segundos
}

// Parar verificação de status
function stopPaymentStatusCheck() {
    if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
        paymentCheckInterval = null;
    }
}

// Mostrar modal de sucesso
function showSuccessModal() {
    const quantity = parseInt(modalQuantity.textContent);
    successTokens.textContent = quantity;
    successTotal.textContent = quantity;
    successModal.style.display = 'flex';
}

// Fechar modal de sucesso
function closeSuccessModal() {
    successModal.style.display = 'none';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Página de pagamento PIX carregada');
    initializePayment();
});

// Copiar código PIX
copyPixCodeBtn.addEventListener('click', () => {
    pixCodeInput.select();
    pixCodeInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        copyPixCodeBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyPixCodeBtn.style.background = 'rgba(16, 185, 129, 0.2)';
        copyPixCodeBtn.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        copyPixCodeBtn.style.color = '#10b981';
        
        setTimeout(() => {
            copyPixCodeBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyPixCodeBtn.style.background = 'rgba(59, 130, 246, 0.2)';
            copyPixCodeBtn.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            copyPixCodeBtn.style.color = '#3b82f6';
        }, 2000);
    } catch (err) {
        console.error('❌ Erro ao copiar:', err);
    }
});

// Voltar ao dashboard
backToDashboardBtn.addEventListener('click', () => {
    window.location.href = '/';
});

// Fechar modal de sucesso ao clicar fora
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        closeSuccessModal();
    }
});

// Limpar intervalos quando sair da página
window.addEventListener('beforeunload', () => {
    stopExpirationCountdown();
    stopPaymentStatusCheck();
});
