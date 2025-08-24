// Variáveis globais
let selectedTokens = 0;
let selectedPrice = 0;
let currentTransaction = null;
let countdownInterval = null;

// Elementos DOM
const tokenOptions = document.querySelectorAll('.token-option');
const selectedAmount = document.getElementById('selectedAmount');
const selectedPriceElement = document.getElementById('selectedPrice');
const generatePixBtn = document.getElementById('generatePixBtn');

// Modais
const pixModal = document.getElementById('pixModal');
const successModal = document.getElementById('successModal');
const closeButtons = document.querySelectorAll('.close');

// Elementos do modal PIX
const modalQuantity = document.getElementById('modalQuantity');
const modalTotal = document.getElementById('modalTotal');
const countdownTime = document.getElementById('countdownTime');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const pixCode = document.getElementById('pixCode');
const copyPixBtn = document.getElementById('copyPixBtn');

// Elementos do modal de sucesso
const successTokens = document.getElementById('successTokens');
const successTotal = document.getElementById('successTotal');
const backToMenuBtn = document.getElementById('backToMenuBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [TOKENS] Página carregada');
    
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('❌ [TOKENS] Usuário não logado');
        window.location.href = '/';
        return;
    }
    
    console.log('✅ [TOKENS] Usuário logado');
    initializeEventListeners();
});

// Inicializar event listeners
function initializeEventListeners() {
    console.log('🔍 [TOKENS] Inicializando event listeners');
    
    // Seleção de tokens
    tokenOptions.forEach(option => {
        option.addEventListener('click', function() {
            const tokens = parseInt(this.dataset.tokens);
            selectTokens(tokens);
        });
    });
    
    // Botão gerar PIX
    generatePixBtn.addEventListener('click', generatePixPayment);
    
    // Fechar modais
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Clicar fora do modal para fechar
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    // Copiar código PIX
    copyPixBtn.addEventListener('click', copyPixCode);
    
    // Voltar ao menu
    backToMenuBtn.addEventListener('click', function() {
        window.location.href = '/';
    });
    
    console.log('✅ [TOKENS] Event listeners inicializados');
}

// Selecionar quantidade de tokens
function selectTokens(tokens) {
    console.log('🔍 [TOKENS] Selecionando tokens:', tokens);
    
    // Remover seleção anterior
    tokenOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Selecionar nova opção
    const selectedOption = document.querySelector(`[data-tokens="${tokens}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Atualizar valores
    selectedTokens = tokens;
    selectedPrice = tokens; // R$ 1,00 por token
    
    // Atualizar interface
    selectedAmount.textContent = tokens;
    selectedPriceElement.textContent = selectedPrice.toFixed(2).replace('.', ',');
    
    // Habilitar botão
    generatePixBtn.disabled = false;
    
    console.log('✅ [TOKENS] Tokens selecionados:', {
        tokens: selectedTokens,
        price: selectedPrice
    });
}

// Gerar pagamento PIX
async function generatePixPayment() {
    console.log('🔍 [TOKENS] ===== INICIANDO GERAÇÃO DE PIX =====');
    console.log('🔍 [TOKENS] Tokens:', selectedTokens);
    console.log('🔍 [TOKENS] Preço:', selectedPrice);
    
    if (selectedTokens === 0) {
        console.error('❌ [TOKENS] Nenhum token selecionado');
        alert('Selecione uma quantidade de tokens');
        return;
    }
    
    try {
        // Desabilitar botão
        generatePixBtn.disabled = true;
        generatePixBtn.textContent = 'Gerando...';
        
        // Fazer requisição para criar PIX
        const response = await fetch('/api/payments/create-pix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                tokens: selectedTokens
            })
        });
        
        console.log('🔍 [TOKENS] Resposta do servidor:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao gerar PIX');
        }
        
        const data = await response.json();
        console.log('✅ [TOKENS] PIX criado com sucesso:', {
            transactionId: data.transactionId,
            qrCodeLength: data.qrCode ? data.qrCode.length : 0
        });
        
        // Salvar dados da transação
        currentTransaction = data;
        
        // Mostrar modal PIX
        showPixModal(data);
        
        // Iniciar verificação de pagamento
        startPaymentCheck(data.transactionId);
        
    } catch (error) {
        console.error('❌ [TOKENS] Erro ao gerar PIX:', error);
        alert(`Erro ao gerar PIX: ${error.message}`);
        
        // Reabilitar botão
        generatePixBtn.disabled = false;
        generatePixBtn.textContent = 'Gerar QR Code PIX';
    }
}

// Mostrar modal PIX
function showPixModal(data) {
    console.log('🔍 [TOKENS] ===== MOSTRANDO MODAL PIX =====');
    console.log('🔍 [TOKENS] Dados recebidos:', data);
    
    // Atualizar informações do modal
    modalQuantity.textContent = data.tokens;
    modalTotal.textContent = data.amount.toFixed(2).replace('.', ',');
    
    // Gerar QR Code
    generateQRCode(data.qrCode);
    
    // Mostrar código PIX
    pixCode.textContent = data.qrCode;
    
    // Iniciar contador
    startCountdown(data.expiresAt);
    
    // Mostrar modal
    pixModal.style.display = 'block';
    
    console.log('✅ [TOKENS] Modal PIX exibido');
}

// Gerar QR Code
function generateQRCode(qrCodeData) {
    console.log('🔍 [TOKENS] ===== GERANDO QR CODE =====');
    console.log('🔍 [TOKENS] Dados QR:', qrCodeData ? qrCodeData.substring(0, 50) + '...' : 'N/A');
    
    // Limpar container
    qrCodeContainer.innerHTML = '';
    
    // Verificar se a biblioteca QR Code está disponível
    if (typeof QRCode === 'undefined') {
        console.error('❌ [TOKENS] Biblioteca QR Code não carregada');
        qrCodeContainer.innerHTML = '<p style="color: red;">Erro: Biblioteca QR Code não carregada</p>';
        return;
    }
    
    try {
        // Criar canvas
        const canvas = document.createElement('canvas');
        qrCodeContainer.appendChild(canvas);
        
        // Gerar QR Code
        QRCode.toCanvas(canvas, qrCodeData, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function(error) {
            if (error) {
                console.error('❌ [TOKENS] Erro ao gerar QR Code:', error);
                qrCodeContainer.innerHTML = '<p style="color: red;">Erro ao gerar QR Code</p>';
            } else {
                console.log('✅ [TOKENS] QR Code gerado com sucesso');
            }
        });
        
    } catch (error) {
        console.error('❌ [TOKENS] Erro no try/catch:', error);
        qrCodeContainer.innerHTML = '<p style="color: red;">Erro ao gerar QR Code</p>';
    }
}

// Iniciar contador
function startCountdown(expiresAt) {
    console.log('🔍 [TOKENS] ===== INICIANDO CONTADOR =====');
    console.log('🔍 [TOKENS] Expira em:', expiresAt);
    
    // Limpar intervalo anterior
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    const updateCountdown = () => {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const timeLeft = expiry - now;
        
        if (timeLeft <= 0) {
            countdownTime.textContent = '00:00';
            clearInterval(countdownInterval);
            console.log('⚠️ [TOKENS] QR Code expirado');
            return;
        }
        
        const minutes = Math.floor(timeLeft / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        countdownTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    // Atualizar imediatamente
    updateCountdown();
    
    // Atualizar a cada segundo
    countdownInterval = setInterval(updateCountdown, 1000);
    
    console.log('✅ [TOKENS] Contador iniciado');
}

// Iniciar verificação de pagamento
function startPaymentCheck(transactionId) {
    console.log('🔍 [TOKENS] ===== INICIANDO VERIFICAÇÃO DE PAGAMENTO =====');
    console.log('🔍 [TOKENS] Transaction ID:', transactionId);
    
    const checkPayment = async () => {
        try {
            const response = await fetch(`/api/payments/status/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 [TOKENS] Status do pagamento:', data.status);
                
                if (data.status === 'approved') {
                    console.log('✅ [TOKENS] Pagamento aprovado!');
                    showSuccessModal(data);
                    return true; // Parar verificação
                }
            }
            
            return false; // Continuar verificando
            
        } catch (error) {
            console.error('❌ [TOKENS] Erro ao verificar pagamento:', error);
            return false;
        }
    };
    
    // Verificar a cada 3 segundos
    const checkInterval = setInterval(async () => {
        const isApproved = await checkPayment();
        if (isApproved) {
            clearInterval(checkInterval);
        }
    }, 3000);
    
    console.log('✅ [TOKENS] Verificação de pagamento iniciada');
}

// Mostrar modal de sucesso
function showSuccessModal(data) {
    console.log('🔍 [TOKENS] ===== MOSTRANDO MODAL DE SUCESSO =====');
    console.log('🔍 [TOKENS] Dados:', data);
    
    // Atualizar informações
    successTokens.textContent = data.tokens;
    successTotal.textContent = data.amount.toFixed(2).replace('.', ',');
    
    // Fechar modal PIX
    closeModal(pixModal);
    
    // Mostrar modal de sucesso
    successModal.style.display = 'block';
    
    console.log('✅ [TOKENS] Modal de sucesso exibido');
}

// Copiar código PIX
function copyPixCode() {
    console.log('🔍 [TOKENS] Copiando código PIX');
    
    const textToCopy = pixCode.textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log('✅ [TOKENS] Código copiado para clipboard');
            copyPixBtn.textContent = 'Copiado!';
            setTimeout(() => {
                copyPixBtn.textContent = 'Copiar Código';
            }, 2000);
        }).catch(err => {
            console.error('❌ [TOKENS] Erro ao copiar:', err);
            fallbackCopyTextToClipboard(textToCopy);
        });
    } else {
        fallbackCopyTextToClipboard(textToCopy);
    }
}

// Fallback para copiar texto
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('✅ [TOKENS] Código copiado (fallback)');
        copyPixBtn.textContent = 'Copiado!';
        setTimeout(() => {
            copyPixBtn.textContent = 'Copiar Código';
        }, 2000);
    } catch (err) {
        console.error('❌ [TOKENS] Erro no fallback:', err);
        alert('Erro ao copiar código PIX');
    }
    
    document.body.removeChild(textArea);
}

// Fechar modal
function closeModal(modal) {
    console.log('🔍 [TOKENS] Fechando modal');
    
    if (modal) {
        modal.style.display = 'none';
        
        // Limpar contador se for o modal PIX
        if (modal === pixModal && countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }
    
    // Reabilitar botão
    generatePixBtn.disabled = false;
    generatePixBtn.textContent = 'Gerar QR Code PIX';
    
    console.log('✅ [TOKENS] Modal fechado');
}
