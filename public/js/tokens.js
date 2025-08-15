// Tokens Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const tokenQuantity = document.getElementById('tokenQuantity');
    const totalValue = document.getElementById('totalValue');
    const increaseBtn = document.getElementById('increaseBtn');
    const decreaseBtn = document.getElementById('decreaseBtn');
    const tokensForm = document.getElementById('tokensForm');
    const generatePixBtn = document.getElementById('generatePixBtn');
    
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
        totalValue.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // Função para formatar número brasileiro
    function formatBrazilianCurrency(value) {
        return value.toFixed(2).replace('.', ',');
    }

    // Event listeners para os botões de quantidade
    increaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(tokenQuantity.value) || 0;
        tokenQuantity.value = currentValue + 1;
        updateTotal();
    });

    decreaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(tokenQuantity.value) || 0;
        if (currentValue > MIN_QUANTITY) {
            tokenQuantity.value = currentValue - 1;
            updateTotal();
        }
    });

    // Event listener para mudança no input
    tokenQuantity.addEventListener('input', function() {
        const value = parseInt(this.value) || 0;
        if (value < MIN_QUANTITY) {
            this.value = MIN_QUANTITY;
        }
        updateTotal();
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

            // Chamar API do Pagar.me
            const response = await fetch('/api/payments/pix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    quantity: quantity,
                    amount: total
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Erro ao gerar pagamento');
            }

            // Atualizar campo do código PIX
            document.getElementById('pixCode').value = result.data.pixQrCode;
            
            // Gerar QR Code usando a biblioteca qrcode
            const qrCodeDataURL = await QRCode.toDataURL(result.data.pixQrCode, {
                width: 200,
                height: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            // Exibir QR Code
            qrCodeContainer.innerHTML = `<img src="${qrCodeDataURL}" alt="QR Code PIX" style="width: 200px; height: 200px;">`;
            
            // Iniciar verificação de status
            startPaymentStatusCheck(result.data.transactionId);
            
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            qrCodeContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <p>Erro ao gerar QR Code</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
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

    // Inicializar valor total
    updateTotal();

    // Adicionar animação de loading ao botão
    generatePixBtn.addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
        this.disabled = true;

        // Simular delay de geração
        setTimeout(() => {
            this.innerHTML = originalText;
            this.disabled = false;
        }, 1000);
    });
});
