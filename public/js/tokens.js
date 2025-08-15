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
            // Dados do PIX (exemplo - você pode integrar com API real)
            const pixData = {
                merchantName: 'CallX',
                merchantCity: 'SAO PAULO',
                amount: total,
                transactionId: generateTransactionId(),
                description: `${quantity} tokens CallX`
            };

            // Gerar código PIX (formato EMV QR Code)
            const pixCode = generatePixCode(pixData);
            
            // Atualizar campo do código PIX
            document.getElementById('pixCode').value = pixCode;
            
            // Gerar QR Code usando a biblioteca qrcode
            const qrCodeDataURL = await QRCode.toDataURL(pixCode, {
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
            
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            qrCodeContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <p>Erro ao gerar QR Code</p>
                    <small>Use o código PIX abaixo</small>
                </div>
            `;
        }
    }

    // Função para gerar código PIX (formato EMV)
    function generatePixCode(data) {
        // Este é um exemplo simplificado
        // Em produção, você deve usar uma API real de PIX
        const pixCode = `00020126580014br.gov.bcb.pix0136${data.transactionId}520400005303986540${data.amount.toFixed(2)}5802BR5913${data.merchantName}6008${data.merchantCity}62070503***6304${generateCRC16(data.transactionId)}`;
        return pixCode;
    }

    // Função para gerar ID de transação
    function generateTransactionId() {
        return 'CALLX' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Função para gerar CRC16 (simplificado)
    function generateCRC16(data) {
        // Implementação simplificada do CRC16
        return 'ABCD'; // Em produção, implemente o cálculo real
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
