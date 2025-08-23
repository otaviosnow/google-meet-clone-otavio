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
    
    // Elementos do modal PIX
    const pixModal = document.getElementById('pixModal');
    const closePixModal = document.getElementById('closePixModal');
    const modalQuantity = document.getElementById('modalQuantity');
    const modalTotal = document.getElementById('modalTotal');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const pixCode = document.getElementById('pixCode');
    const copyPixCode = document.getElementById('copyPixCode');

    const TOKEN_PRICE = 2.00; // R$ 2,00 por token
    const MIN_QUANTITY = 5;
    let paymentCheckInterval = null;
    let countdownInterval = null;
    let qrExpirationTime = null;

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

    // Função para formatar número brasileiro
    function formatBrazilianCurrency(value) {
        return value.toFixed(2).replace('.', ',');
    }

    // Função para iniciar contador de expiração
    function startExpirationCountdown(expirationTime) {
        const expirationCounter = document.getElementById('expirationCounter');
        const countdownTime = document.getElementById('countdownTime');
        
        if (!expirationCounter || !countdownTime) return;
        
        expirationCounter.style.display = 'flex';
        
        // Se não tiver tempo de expiração, usar 30 minutos padrão
        if (!expirationTime) {
            qrExpirationTime = new Date(Date.now() + (30 * 60 * 1000)); // 30 minutos
        } else {
            qrExpirationTime = new Date(expirationTime);
        }
        
        function updateCountdown() {
            const now = new Date();
            const timeLeft = qrExpirationTime - now;
            
            if (timeLeft <= 0) {
                // QR Code expirou
                countdownTime.textContent = 'EXPIRADO';
                expirationCounter.className = 'expiration-counter expired';
                expirationCounter.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>QR Code expirou. Gere um novo para continuar.</span>
                `;
                clearInterval(countdownInterval);
                return;
            }
            
            // Calcular minutos e segundos
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            // Atualizar display
            countdownTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Mudar cor quando estiver próximo de expirar (menos de 5 minutos)
            if (timeLeft < 300000) { // 5 minutos
                expirationCounter.className = 'expiration-counter warning';
            }
        }
        
        // Atualizar imediatamente e depois a cada segundo
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Função para parar contador de expiração
    function stopExpirationCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        const expirationCounter = document.getElementById('expirationCounter');
        if (expirationCounter) {
            expirationCounter.style.display = 'none';
        }
    }

    // Função para mostrar modal de sucesso
    function showSuccessModal(tokensAdded, totalTokens) {
        const successModal = document.getElementById('successModal');
        const successTokens = document.getElementById('successTokens');
        const successTotal = document.getElementById('successTotal');
        const backToDashboard = document.getElementById('backToDashboard');
        
        if (successModal && successTokens && successTotal) {
            successTokens.textContent = tokensAdded;
            successTotal.textContent = totalTokens;
            
            // Event listener para voltar ao dashboard
            if (backToDashboard) {
                backToDashboard.onclick = function() {
                    window.location.href = '/';
                };
            }
            
            successModal.style.display = 'flex';
        }
    }

    // Função para fechar modal de sucesso
    function closeSuccessModal() {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.style.display = 'none';
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

    // Event listener para mudança no input
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

    // Event listener para o formulário
    tokensForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const quantity = parseInt(tokenQuantity.value) || 0;
        const total = quantity * TOKEN_PRICE;

        if (quantity < MIN_QUANTITY) {
            alert(`Quantidade mínima é ${MIN_QUANTITY} tokens.`);
            return;
        }

        // Mostrar modal PIX com QR Code
        showPixModal(quantity, total);
    });

    // Função para mostrar modal PIX
    async function showPixModal(quantity, total) {
        // Atualizar informações do modal
        modalQuantity.textContent = quantity;
        modalTotal.textContent = formatBrazilianCurrency(total);
        
        // Gerar QR Code PIX
        await generatePixQRCode(quantity, total);
        
        // Mostrar modal
        pixModal.style.display = 'flex';
    }

    // Função para gerar QR Code PIX
    async function generatePixQRCode(quantity, total) {
        try {
            // Mostrar loading
            qrCodeContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #3b82f6; margin-bottom: 16px;"></i>
                    <p style="color: #9ca3af;">Gerando QR Code PIX...</p>
                </div>
            `;

            // Obter token de autenticação
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('Usuário não autenticado');
            }

            console.log('🔄 [TOKENS] Iniciando criação do PIX...');
            console.log('📊 [TOKENS] Dados:', { quantity, amount: quantity * TOKEN_PRICE });
            console.log('🔑 [TOKENS] Token:', authToken ? 'Presente' : 'Ausente');
            
            // Chamar API para criar PIX
            const response = await fetch('/api/payments/create-pix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    quantity: quantity,
                    amount: quantity * TOKEN_PRICE
                })
            });

            console.log('📡 [TOKENS] Response status:', response.status);
            const result = await response.json();
            console.log('📄 [TOKENS] Response data:', result);

            if (response.ok && result.success) {
                console.log('✅ [TOKENS] PIX criado com sucesso:', result);
                console.log('🔍 [TOKENS] Dados do PIX:', {
                    pixQrCodeUrl: result.data?.pixQrCodeUrl,
                    pixQrCode: result.data?.pixQrCode,
                    transactionId: result.data?.transactionId
                });
                
                // Exibir QR Code
                if (result.data?.pixQrCodeUrl) {
                    console.log('🖼️ [TOKENS] Usando pixQrCodeUrl (base64)');
                    qrCodeContainer.innerHTML = `
                        <img src="data:image/png;base64,${result.data.pixQrCodeUrl}" alt="QR Code PIX" style="max-width: 200px; height: auto;">
                    `;
                } else if (result.data?.pixQrCode) {
                    console.log('🖼️ [TOKENS] Usando pixQrCode (URL)');
                    qrCodeContainer.innerHTML = `
                        <img src="${result.data.pixQrCode}" alt="QR Code PIX" style="max-width: 200px; height: auto;">
                    `;
                } else {
                    console.error('❌ [TOKENS] Nenhum QR Code encontrado nos dados');
                    qrCodeContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #f59e0b;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                            <p>QR Code não disponível</p>
                            <p style="font-size: 14px; margin-top: 8px;">Dados: ${JSON.stringify(result.data)}</p>
                        </div>
                    `;
                }
                
                // Preencher código PIX
                const pixCodeValue = result.data?.pixQrCode || 'Código PIX não disponível';
                console.log('📝 [TOKENS] Código PIX:', pixCodeValue);
                pixCode.value = pixCodeValue;
                
                // Iniciar verificação de pagamento
                if (result.data?.transactionId) {
                    console.log('🔄 [TOKENS] Iniciando verificação para:', result.data.transactionId);
                    startPaymentCheck(result.data.transactionId);
                } else {
                    console.error('❌ [TOKENS] TransactionId não encontrado');
                }
            } else {
                throw new Error(result.error || 'Erro ao gerar PIX');
            }
            
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            qrCodeContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <p>Erro ao gerar QR Code PIX</p>
                    <p style="font-size: 14px; margin-top: 8px;">${error.message}</p>
                </div>
            `;
        }
    }

    // Função para verificar status do pagamento
    function startPaymentCheck(transactionId) {
        const checkInterval = setInterval(async () => {
            try {
                const authToken = localStorage.getItem('authToken');
                const response = await fetch(`/api/tokens/transactions/${transactionId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (response.ok) {
                    const transaction = await response.json();
                    
                    if (transaction.status === 'paid') {
                        clearInterval(checkInterval);
                        showPaymentSuccess();
                    } else if (transaction.status === 'failed' || transaction.status === 'cancelled') {
                        clearInterval(checkInterval);
                        showPaymentError();
                    }
                }
            } catch (error) {
                console.error('Erro ao verificar pagamento:', error);
            }
        }, 5000); // Verificar a cada 5 segundos

        // Parar verificação após 30 minutos
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 30 * 60 * 1000);
    }

    // Função para mostrar sucesso do pagamento
    function showPaymentSuccess() {
        qrCodeContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #10b981;">
                <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>Pagamento confirmado!</p>
                <p style="font-size: 14px; margin-top: 8px;">Tokens adicionados à sua conta</p>
            </div>
        `;
        
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }

    // Função para mostrar erro do pagamento
    function showPaymentError() {
        qrCodeContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ef4444;">
                <i class="fas fa-times-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>Pagamento não confirmado</p>
                <p style="font-size: 14px; margin-top: 8px;">Tente novamente</p>
            </div>
        `;
    }

    // Função para verificar status do pagamento
    function startPaymentStatusCheck(transactionId) {
        const checkInterval = setInterval(async () => {
            try {
                const authToken = localStorage.getItem('authToken');
                const response = await fetch(`/api/payments/status/${transactionId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                const result = await response.json();

                if (result.success && result.data.status === 'approved') {
                    // Pagamento confirmado
                    clearInterval(checkInterval);
                    stopExpirationCountdown();
                    
                    // Calcular tokens adicionados
                    const quantity = parseInt(document.getElementById('modalQuantity').textContent) || 0;
                    
                    // Mostrar modal de sucesso
                    showSuccessModal(quantity, 'Verificando...');
                    
                    // Fechar modal PIX
                    pixModal.style.display = 'none';
                    
                    // Atualizar tokens no dashboard (opcional)
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }
            } catch (error) {
                console.error('Erro ao verificar status:', error);
            }
        }, 5000); // Verificar a cada 5 segundos

        // Parar verificação após 1 hora
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 3600000);
    }



    // Event listeners para o modal PIX
    closePixModal.addEventListener('click', function() {
        pixModal.style.display = 'none';
        stopExpirationCountdown();
    });

    // Fechar modal ao clicar fora
    pixModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            stopExpirationCountdown();
        }
    });

    // Copiar código PIX
    copyPixCode.addEventListener('click', function() {
        const pixCodeInput = document.getElementById('pixCode');
        pixCodeInput.select();
        pixCodeInput.setSelectionRange(0, 99999); // Para dispositivos móveis
        
        try {
            document.execCommand('copy');
            
            // Feedback visual
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.style.background = 'rgba(34, 197, 94, 0.2)';
            this.style.borderColor = 'rgba(34, 197, 94, 0.3)';
            this.style.color = '#22c55e';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = 'rgba(59, 130, 246, 0.2)';
                this.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                this.style.color = '#3b82f6';
            }, 2000);
            
        } catch (err) {
            console.error('Erro ao copiar:', err);
            alert('Erro ao copiar código PIX');
        }
    });

    // Inicializar valor total e estados dos botões
    updateTotal();
    updateButtonStates();

    // Gerar QR Code PIX
    generatePixBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        console.log('🔍 [TOKENS] Gerando QR Code PIX...');
        
        const quantity = parseInt(tokenQuantity.value) || 0;
        const total = quantity * TOKEN_PRICE;
        
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
            if (!authToken) {
                throw new Error('Usuário não autenticado');
            }
            
            // Criar pagamento PIX
            const response = await fetch('/api/payments/create-pix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    amount: total,
                    description: `${quantity} tokens CallX`,
                    quantity: quantity
                })
            });
            
            console.log('📡 [TOKENS] Response status:', response.status);
            const result = await response.json();
            console.log('📄 [TOKENS] Response data:', result);
            
            if (response.ok && result.success) {
                console.log('✅ [TOKENS] PIX criado com sucesso:', result);
                console.log('🔍 [TOKENS] Dados do PIX:', {
                    pixQrCodeUrl: result.data?.pixQrCodeUrl,
                    pixQrCode: result.data?.pixQrCode,
                    transactionId: result.data?.transactionId
                });
                
                // Atualizar modal
                modalQuantity.textContent = quantity;
                modalTotal.textContent = formatBrazilianCurrency(total);
                
                // Exibir QR Code
                if (result.data?.pixQrCodeUrl) {
                    console.log('🖼️ [TOKENS] Usando pixQrCodeUrl (base64)');
                    qrCodeContainer.innerHTML = `
                        <img src="data:image/png;base64,${result.data.pixQrCodeUrl}" alt="QR Code PIX" style="max-width: 200px; height: auto;">
                    `;
                } else if (result.data?.pixQrCode) {
                    console.log('🖼️ [TOKENS] Usando pixQrCode (URL)');
                    qrCodeContainer.innerHTML = `
                        <img src="${result.data.pixQrCode}" alt="QR Code PIX" style="max-width: 200px; height: auto;">
                    `;
                } else {
                    console.error('❌ [TOKENS] Nenhum QR Code encontrado nos dados');
                    qrCodeContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #f59e0b;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                            <p>QR Code não disponível</p>
                            <p style="font-size: 14px; margin-top: 8px;">Dados: ${JSON.stringify(result.data)}</p>
                        </div>
                    `;
                }
                
                // Preencher código PIX
                const pixCodeValue = result.data?.pixQrCode || 'Código PIX não disponível';
                console.log('📝 [TOKENS] Código PIX:', pixCodeValue);
                pixCode.value = pixCodeValue;
                
                // Mostrar modal
                pixModal.style.display = 'flex';
                
                // Iniciar contador de expiração (forçar 30 minutos)
                console.log('⏰ [TOKENS] Iniciando contador de expiração (30 minutos)');
                startExpirationCountdown(null); // Força usar 30 minutos padrão
                
                // Iniciar verificação de pagamento
                if (result.data.transactionId) {
                    startPaymentCheck(result.data.transactionId);
                }
                
            } else {
                throw new Error(result.error || 'Erro ao criar pagamento');
            }
            
        } catch (error) {
            console.error('❌ [TOKENS] Erro ao gerar PIX:', error);
            alert('Erro ao gerar QR Code PIX: ' + error.message);
        } finally {
            // Restaurar botão
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });
});
