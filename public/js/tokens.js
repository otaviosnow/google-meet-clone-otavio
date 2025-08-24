// Tokens Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [TOKENS] Iniciando página de tokens');
    
    const tokenQuantity = document.getElementById('tokenQuantity');
    const totalValue = document.getElementById('totalValue');
    const increaseBtn = document.getElementById('increaseBtn');
    const decreaseBtn = document.getElementById('decreaseBtn');
    const tokensForm = document.getElementById('tokensForm');
    const generatePixBtn = document.getElementById('generatePixBtn');
    
    console.log('🔍 [TOKENS] Elementos encontrados:', {
        tokenQuantity: !!tokenQuantity,
        totalValue: !!totalValue,
        increaseBtn: !!increaseBtn,
        decreaseBtn: !!decreaseBtn,
        tokensForm: !!tokensForm,
        generatePixBtn: !!generatePixBtn
    });

    const TOKEN_PRICE = 2.00; // R$ 2,00 por token
    const MIN_QUANTITY = 5;

    // Elementos do modal PIX
    const pixModal = document.getElementById('pixModal');
    const modalQuantity = document.getElementById('modalQuantity');
    const modalTotal = document.getElementById('modalTotal');
    const pixCode = document.getElementById('pixCode');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const successModal = document.getElementById('successModal');
    const successTokens = document.getElementById('successTokens');
    const successTotal = document.getElementById('successTotal');
    const countdownTime = document.getElementById('countdownTime');
    const expirationCounter = document.getElementById('expirationCounter');

    // Função para atualizar o valor total
    function updateTotal() {
        const quantity = parseInt(tokenQuantity.value) || 0;
        const total = quantity * TOKEN_PRICE;
        const formattedTotal = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        if (totalValue) {
            totalValue.textContent = formattedTotal;
            console.log('💰 [TOKENS] Valor total atualizado:', {
                quantity: quantity,
                total: total,
                formatted: formattedTotal
            });
        } else {
            console.error('❌ [TOKENS] Elemento totalValue não encontrado');
        }
    }

    // Função para atualizar estados dos botões
    function updateButtonStates() {
        const currentValue = parseInt(tokenQuantity.value) || 0;
        
        // Desabilitar botão de diminuir se estiver no mínimo
        if (currentValue <= MIN_QUANTITY) {
            decreaseBtn.disabled = true;
        } else {
            decreaseBtn.disabled = false;
        }
    }

    // Event listeners para os botões de quantidade
    if (increaseBtn) {
        increaseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔺 Botão aumentar clicado');
            
            const currentValue = parseInt(tokenQuantity.value) || 0;
            const newValue = currentValue + 1;
            tokenQuantity.value = newValue;
            
            console.log('🔺 [TOKENS] Valor alterado:', { current: currentValue, new: newValue });
            
            updateTotal();
            updateButtonStates();
            
            // Feedback visual
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        console.log('✅ [TOKENS] Event listener do botão aumentar adicionado');
    } else {
        console.error('❌ [TOKENS] Botão increaseBtn não encontrado');
    }

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔻 Botão diminuir clicado');
            
            const currentValue = parseInt(tokenQuantity.value) || 0;
            if (currentValue > MIN_QUANTITY) {
                const newValue = currentValue - 1;
                tokenQuantity.value = newValue;
                
                console.log('🔻 [TOKENS] Valor alterado:', { current: currentValue, new: newValue });
                
                updateTotal();
                updateButtonStates();
                
                // Feedback visual
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            } else {
                console.log('🔻 [TOKENS] Valor mínimo atingido, não pode diminuir');
            }
        });
        console.log('✅ [TOKENS] Event listener do botão diminuir adicionado');
    } else {
        console.error('❌ [TOKENS] Botão decreaseBtn não encontrado');
    }

    // Event listener para mudança no input
    if (tokenQuantity) {
        tokenQuantity.addEventListener('input', function() {
            console.log('📝 [TOKENS] Input alterado:', this.value);
            let value = parseInt(this.value) || 0;
            
            // Garantir valor mínimo
            if (value < MIN_QUANTITY) {
                value = MIN_QUANTITY;
                this.value = value;
            }
            
            updateTotal();
            updateButtonStates();
        });

        // Event listener para mudança no input (evento change)
        tokenQuantity.addEventListener('change', function() {
            console.log('🔄 [TOKENS] Input mudou:', this.value);
            let value = parseInt(this.value) || 0;
            
            // Garantir valor mínimo
            if (value < MIN_QUANTITY) {
                value = MIN_QUANTITY;
                this.value = value;
            }
            
            updateTotal();
            updateButtonStates();
        });
    }

    // Prevenir submissão automática do formulário
    if (tokensForm) {
        tokensForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('🚫 [TOKENS] Submissão do formulário prevenida');
        });
    }

    // Gerar QR Code PIX
    if (generatePixBtn) {
        generatePixBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔍 [TOKENS] Gerando QR Code PIX...');
            console.log('🔍 [TOKENS] Elementos do modal:', {
                pixModal: !!pixModal,
                modalQuantity: !!modalQuantity,
                modalTotal: !!modalTotal,
                pixCode: !!pixCode,
                qrCodeContainer: !!qrCodeContainer
            });
            
            const quantity = parseInt(tokenQuantity.value) || 0;
            const total = quantity * TOKEN_PRICE;
            
            console.log('🔍 [TOKENS] Dados da compra:', { quantity, total });
            
            if (quantity < MIN_QUANTITY) {
                alert(`Quantidade mínima é ${MIN_QUANTITY} tokens`);
                return;
            }
            
            // Mostrar loading
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
            this.disabled = true;
            
            try {
                // Buscar token de autenticação
                const authToken = localStorage.getItem('authToken');
                console.log('🔍 [TOKENS] Auth token:', authToken ? 'PRESENTE' : 'AUSENTE');
                
                if (!authToken) {
                    throw new Error('Usuário não autenticado');
                }
                
                console.log('📡 [TOKENS] Fazendo requisição para /api/payments/create-pix');
                
                // Criar pagamento PIX
                const response = await fetch('/api/payments/create-pix', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        tokens: quantity
                    })
                });
                
                console.log('📡 [TOKENS] Response status:', response.status);
                console.log('📡 [TOKENS] Response ok:', response.ok);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao criar pagamento');
                }
                
                const result = await response.json();
                console.log('📄 [TOKENS] Response data:', result);
                
                console.log('✅ [TOKENS] PIX criado com sucesso:', result);
                console.log('🔍 [TOKENS] Dados do resultado:', result);
                console.log('🔍 [TOKENS] TransactionId:', result.transactionId);
                
                // Mostrar modal PIX
                console.log('🔍 [TOKENS] Chamando showPixModal...');
                showPixModal(result);
                
            } catch (error) {
                console.error('❌ [TOKENS] Erro ao gerar PIX:', error);
                console.error('❌ [TOKENS] Stack trace:', error.stack);
                alert('Erro ao gerar QR Code PIX: ' + error.message);
                
                // Restaurar botão
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    }

    // Inicializar valor total e estados dos botões
    updateTotal();
    updateButtonStates();
});

// ===== FUNÇÕES DO MODAL PIX =====

// Variáveis globais para o modal
let paymentCheckInterval;
let countdownInterval;
let qrExpirationTime = 30 * 60 * 1000; // 30 minutos

// Mostrar modal PIX
function showPixModal(paymentData) {
    console.log('🔍 [MODAL] Mostrando modal PIX:', paymentData);
    console.log('🔍 [MODAL] Elementos do modal:', {
        pixModal: !!pixModal,
        modalQuantity: !!modalQuantity,
        modalTotal: !!modalTotal,
        pixCode: !!pixCode,
        qrCodeContainer: !!qrCodeContainer
    });
    
    if (!pixModal) {
        console.error('❌ [MODAL] Elemento pixModal não encontrado!');
        return;
    }
    
    // Preencher dados do modal
    if (modalQuantity) {
        modalQuantity.textContent = `${paymentData.tokens} tokens`;
        console.log('✅ [MODAL] Quantidade definida:', `${paymentData.tokens} tokens`);
    } else {
        console.error('❌ [MODAL] Elemento modalQuantity não encontrado!');
    }
    
    if (modalTotal) {
        modalTotal.textContent = paymentData.amount.toFixed(2).replace('.', ',');
        console.log('✅ [MODAL] Total definido:', paymentData.amount.toFixed(2).replace('.', ','));
    } else {
        console.error('❌ [MODAL] Elemento modalTotal não encontrado!');
    }
    
    if (pixCode) {
        pixCode.value = paymentData.qrCode || '';
        console.log('✅ [MODAL] PIX Code definido:', paymentData.qrCode ? 'PRESENTE' : 'AUSENTE');
    } else {
        console.error('❌ [MODAL] Elemento pixCode não encontrado!');
    }
    
    // Gerar QR Code
    console.log('🔍 [MODAL] Gerando QR Code...');
    generatePixQRCode(paymentData.qrCode);
    
    // Iniciar contador de expiração
    console.log('🔍 [MODAL] Iniciando contador de expiração...');
    startExpirationCountdown();
    
    // Iniciar verificação de status
    console.log('🔍 [MODAL] Iniciando verificação de status...');
    startPaymentCheck(paymentData.transactionId);
    
    // Mostrar modal
    console.log('🔍 [MODAL] Exibindo modal...');
    pixModal.style.display = 'flex';
    console.log('✅ [MODAL] Modal exibido com sucesso!');
}

// Fechar modal PIX
function closePixModal() {
    console.log('🔍 [MODAL] Fechando modal PIX');
    
    // Parar verificações
    stopPaymentCheck();
    stopExpirationCountdown();
    
    // Esconder modal
    pixModal.style.display = 'none';
    
    // Limpar dados
    qrCodeContainer.innerHTML = '';
    pixCode.value = '';
}

// Gerar QR Code
function generatePixQRCode(qrCodeData) {
    console.log('🔍 [QR] ===== INICIANDO GERAÇÃO DO QR CODE =====');
    console.log('🔍 [QR] Dados recebidos:', qrCodeData);
    console.log('🔍 [QR] Tipo dos dados:', typeof qrCodeData);
    console.log('🔍 [QR] Tamanho dos dados:', qrCodeData ? qrCodeData.length : 'N/A');
    console.log('🔍 [QR] Dados são string válida?', typeof qrCodeData === 'string' && qrCodeData.length > 0);
    
    if (!qrCodeData) {
        console.error('❌ [QR] Dados do QR Code não fornecidos');
        return;
    }
    
    // Verificar container
    console.log('🔍 [QR] Verificando container...');
    console.log('🔍 [QR] qrCodeContainer existe?', !!qrCodeContainer);
    console.log('🔍 [QR] qrCodeContainer:', qrCodeContainer);
    
    if (qrCodeContainer) {
        console.log('🔍 [QR] Limpando container...');
        qrCodeContainer.innerHTML = '';
        console.log('✅ [QR] Container limpo');
        console.log('🔍 [QR] Container após limpeza:', qrCodeContainer.innerHTML);
    } else {
        console.error('❌ [QR] Elemento qrCodeContainer não encontrado!');
        return;
    }
    
    // Verificar biblioteca QR Code
    console.log('🔍 [QR] ===== VERIFICANDO BIBLIOTECA QR CODE =====');
    console.log('🔍 [QR] typeof QRCode:', typeof QRCode);
    console.log('🔍 [QR] QRCode disponível?', typeof QRCode !== 'undefined');
    console.log('🔍 [QR] QRCode.toCanvas existe?', typeof QRCode.toCanvas === 'function');
    console.log('🔍 [QR] QRCode.toCanvas:', QRCode.toCanvas);
    
    if (typeof QRCode === 'undefined') {
        console.error('❌ [QR] Biblioteca QR Code não carregada');
        qrCodeContainer.innerHTML = '<p style="color: red;">Erro: Biblioteca QR Code não carregada</p>';
        return;
    }
    
    if (typeof QRCode.toCanvas !== 'function') {
        console.error('❌ [QR] QRCode.toCanvas não é uma função');
        console.log('🔍 [QR] Métodos disponíveis em QRCode:', Object.getOwnPropertyNames(QRCode));
        qrCodeContainer.innerHTML = '<p style="color: red;">Erro: QRCode.toCanvas não disponível</p>';
        return;
    }
    
    try {
        console.log('🔍 [QR] ===== CRIANDO CANVAS =====');
        
        // Criar canvas
        const canvas = document.createElement('canvas');
        console.log('🔍 [QR] Canvas criado:', canvas);
        console.log('🔍 [QR] Canvas width:', canvas.width);
        console.log('🔍 [QR] Canvas height:', canvas.height);
        
        // Adicionar canvas ao container
        console.log('🔍 [QR] Adicionando canvas ao container...');
        qrCodeContainer.appendChild(canvas);
        console.log('✅ [QR] Canvas adicionado ao container');
        console.log('🔍 [QR] Container após adicionar canvas:', qrCodeContainer.innerHTML);
        
        // Preparar opções
        const options = {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        };
        console.log('🔍 [QR] Opções preparadas:', options);
        
        console.log('🔍 [QR] ===== CHAMANDO QRCode.toCanvas =====');
        console.log('🔍 [QR] Parâmetros:', {
            canvas: canvas,
            text: qrCodeData,
            options: options
        });
        
        // Gerar QR Code
        QRCode.toCanvas(canvas, qrCodeData, options, function (error) {
            console.log('🔍 [QR] ===== CALLBACK EXECUTADO =====');
            console.log('🔍 [QR] Error recebido:', error);
            console.log('🔍 [QR] Error é null?', error === null);
            console.log('🔍 [QR] Error é undefined?', error === undefined);
            
            if (error) {
                console.error('❌ [QR] Erro no callback:', error);
                console.error('❌ [QR] Tipo do erro:', typeof error);
                console.error('❌ [QR] Mensagem do erro:', error.message);
                console.error('❌ [QR] Stack trace do erro:', error.stack);
                qrCodeContainer.innerHTML = '<p style="color: red;">Erro ao gerar QR Code: ' + error.message + '</p>';
            } else {
                console.log('✅ [QR] QR Code gerado com sucesso no callback');
                console.log('🔍 [QR] Canvas após geração:', canvas);
                console.log('🔍 [QR] Canvas width após geração:', canvas.width);
                console.log('🔍 [QR] Canvas height após geração:', canvas.height);
                console.log('🔍 [QR] Container final:', qrCodeContainer.innerHTML);
            }
        });
        
        console.log('🔍 [QR] ===== QRCode.toCanvas CHAMADO =====');
        console.log('🔍 [QR] Função executada, aguardando callback...');
        
    } catch (error) {
        console.error('❌ [QR] ===== ERRO NO TRY/CATCH =====');
        console.error('❌ [QR] Erro capturado:', error);
        console.error('❌ [QR] Tipo do erro:', typeof error);
        console.error('❌ [QR] Mensagem do erro:', error.message);
        console.error('❌ [QR] Stack trace completo:', error.stack);
        qrCodeContainer.innerHTML = '<p style="color: red;">Erro ao gerar QR Code: ' + error.message + '</p>';
    }
    
    console.log('🔍 [QR] ===== FIM DA FUNÇÃO generatePixQRCode =====');
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
function startPaymentCheck(transactionId) {
    console.log('🔍 [PAYMENT] Iniciando verificação para:', transactionId);
    console.log('🔍 [PAYMENT] URL da requisição:', `/api/payments/status/${transactionId}`);
    
    paymentCheckInterval = setInterval(async () => {
        try {
            console.log('🔄 [PAYMENT] Verificando status...');
            const authToken = localStorage.getItem('authToken');
            console.log('🔍 [PAYMENT] Auth token:', authToken ? 'PRESENTE' : 'AUSENTE');
            
            const response = await fetch(`/api/payments/status/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            console.log('🔍 [PAYMENT] Response status:', response.status);
            console.log('🔍 [PAYMENT] Response ok:', response.ok);
            
            if (response.ok) {
                const result = await response.json();
                console.log('📊 [PAYMENT] Status completo:', result);
                console.log('🔍 [PAYMENT] Status da transação:', result.status);
                
                if (result.status === 'approved') {
                    console.log('✅ [PAYMENT] Pagamento confirmado!');
                    stopPaymentCheck();
                    stopExpirationCountdown();
                    showPaymentSuccess(result);
                }
            } else {
                console.error('❌ [PAYMENT] Response não ok:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ [PAYMENT] Erro ao verificar status:', error);
            console.error('❌ [PAYMENT] Stack trace:', error.stack);
        }
    }, 5000); // Verificar a cada 5 segundos
}

// Parar verificação de status
function stopPaymentCheck() {
    if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
        paymentCheckInterval = null;
    }
}

// Mostrar sucesso do pagamento
function showPaymentSuccess(transaction) {
    console.log('🎉 [SUCCESS] Mostrando sucesso:', transaction);
    
    // Preencher dados de sucesso
    successTokens.textContent = transaction.tokens;
    successTotal.textContent = transaction.tokens;
    
    // Esconder modal PIX e mostrar sucesso
    pixModal.style.display = 'none';
    successModal.style.display = 'flex';
}

// Fechar modal de sucesso
function closeSuccessModal() {
    successModal.style.display = 'none';
    window.location.href = '/'; // Voltar ao dashboard
}

// Event listeners para os modais
document.addEventListener('DOMContentLoaded', function() {
    // Copiar código PIX
    const copyPixCodeBtn = document.getElementById('copyPixCode');
    if (copyPixCodeBtn) {
        copyPixCodeBtn.addEventListener('click', function() {
            pixCode.select();
            pixCode.setSelectionRange(0, 99999);
            
            try {
                document.execCommand('copy');
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.background = 'rgba(16, 185, 129, 0.2)';
                this.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                this.style.color = '#10b981';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i>';
                    this.style.background = 'rgba(59, 130, 246, 0.2)';
                    this.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    this.style.color = '#3b82f6';
                }, 2000);
            } catch (err) {
                console.error('❌ Erro ao copiar:', err);
            }
        });
    }
    
    // Voltar ao dashboard
    const backToDashboardBtn = document.getElementById('backToDashboard');
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', closeSuccessModal);
    }
    
    // Fechar modal ao clicar fora
    pixModal.addEventListener('click', function(e) {
        if (e.target === pixModal) {
            closePixModal();
        }
    });
});
