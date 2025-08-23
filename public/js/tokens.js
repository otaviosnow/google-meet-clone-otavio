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

    // Gerar QR Code PIX - REDIRECIONAMENTO
    if (generatePixBtn) {
        generatePixBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
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
                    
                    // REDIRECIONAR para página de pagamento
                    const transactionId = result.data?.transactionId || result.transactionId;
                    const paymentUrl = `/pix-payment.html?quantity=${quantity}&transactionId=${transactionId}`;
                    
                    console.log('🔄 [TOKENS] Redirecionando para:', paymentUrl);
                    window.location.href = paymentUrl;
                    
                } else {
                    throw new Error(result.error || 'Erro ao criar pagamento');
                }
                
            } catch (error) {
                console.error('❌ [TOKENS] Erro ao gerar PIX:', error);
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
