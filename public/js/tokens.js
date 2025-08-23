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
                
                // Exibir QR Code
                if (result.data.pixQrCodeUrl) {
                    qrCodeContainer.innerHTML = `
                        <img src="data:image/png;base64,${result.data.pixQrCodeUrl}" alt="QR Code PIX" style="max-width: 200px; height: auto;">
                    `;
                } else if (result.data.pixQrCode) {
                    qrCodeContainer.innerHTML = `
                        <img src="${result.data.pixQrCode}" alt="QR Code PIX" style="max-width: 200px; height: auto;">
                    `;
                }
                
                // Preencher código PIX
                pixCode.value = result.data.pixQrCode || 'Código PIX não disponível';
                
                // Iniciar verificação de pagamento
                startPaymentCheck(result.data.transactionId);
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

                if (result.success && result.data.status === 'paid') {
                    // Pagamento confirmado
                    clearInterval(checkInterval);
                    
                    // Mostrar sucesso
                    qrCodeContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #22c55e;">
                            <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
                            <p style="color: #22c55e; font-weight: 600;">Pagamento Confirmado!</p>
                            <small style="color: #9ca3af;">Tokens creditados automaticamente</small>
                        </div>
                    `;

                    // Fechar modal após 3 segundos
                    setTimeout(() => {
                        pixModal.style.display = 'none';
                        // Recarregar página para atualizar tokens
                        window.location.reload();
                    }, 3000);
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
    });

    // Fechar modal ao clicar fora
    pixModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
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
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ [TOKENS] Pagamento PIX criado:', result.data);
                
                // Atualizar modal
                modalQuantity.textContent = quantity;
                modalTotal.textContent = formatBrazilianCurrency(total);
                pixCode.value = result.data.pixCode || 'Código PIX não disponível';
                
                // Gerar QR Code
                if (typeof QRCode !== 'undefined' && result.data.pixQrCode) {
                    qrCodeContainer.innerHTML = '';
                    QRCode.toCanvas(result.data.pixQrCode, qrCodeContainer, {
                        width: 200,
                        height: 200,
                        margin: 2
                    });
                    console.log('✅ [TOKENS] QR Code gerado com sucesso');
                } else {
                    qrCodeContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #ef4444;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                            <p>Erro ao gerar QR Code</p>
                            <small>Use o código PIX abaixo</small>
                        </div>
                    `;
                    console.error('❌ [TOKENS] QR Code não pôde ser gerado');
                }
                
                // Mostrar modal
                pixModal.style.display = 'flex';
                
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
