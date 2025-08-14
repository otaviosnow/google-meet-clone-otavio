// Tokens Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const tokenQuantity = document.getElementById('tokenQuantity');
    const totalValue = document.getElementById('totalValue');
    const increaseBtn = document.getElementById('increaseBtn');
    const decreaseBtn = document.getElementById('decreaseBtn');
    const tokensForm = document.getElementById('tokensForm');
    const generatePixBtn = document.getElementById('generatePixBtn');

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

        // Aqui você pode adicionar a lógica para gerar o QR Code Pix
        // Por enquanto, vamos mostrar uma mensagem de confirmação
        showPixModal(quantity, total);
    });

    // Função para mostrar modal de confirmação (temporário)
    function showPixModal(quantity, total) {
        const modal = document.createElement('div');
        modal.className = 'pix-modal';
        modal.innerHTML = `
            <div class="pix-modal-content">
                <div class="pix-modal-header">
                    <h3><i class="fas fa-qrcode"></i> QR Code Pix</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="pix-modal-body">
                    <div class="pix-info">
                        <p><strong>Quantidade:</strong> ${quantity} tokens</p>
                        <p><strong>Valor Total:</strong> R$ ${formatBrazilianCurrency(total)}</p>
                    </div>
                    <div class="pix-qr-placeholder">
                        <i class="fas fa-qrcode"></i>
                        <p>QR Code será gerado aqui</p>
                        <small>Integração com API Pix em desenvolvimento</small>
                    </div>
                    <div class="pix-instructions">
                        <h4>Como pagar:</h4>
                        <ol>
                            <li>Escaneie o QR Code com seu app bancário</li>
                            <li>Confirme o pagamento</li>
                            <li>Os tokens serão creditados automaticamente</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos inline para o modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;

        const modalContent = modal.querySelector('.pix-modal-content');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
            border-radius: 24px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;

        const modalHeader = modal.querySelector('.pix-modal-header');
        modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `;

        const modalTitle = modal.querySelector('.pix-modal-header h3');
        modalTitle.style.cssText = `
            color: #e8eaed;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #9ca3af;
            font-size: 20px;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.3s ease;
        `;

        closeBtn.addEventListener('mouseenter', function() {
            this.style.color = '#ef4444';
            this.style.background = 'rgba(239, 68, 68, 0.1)';
        });

        closeBtn.addEventListener('mouseleave', function() {
            this.style.color = '#9ca3af';
            this.style.background = 'none';
        });

        const pixInfo = modal.querySelector('.pix-info');
        pixInfo.style.cssText = `
            background: rgba(59, 130, 246, 0.1);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            border: 1px solid rgba(59, 130, 246, 0.2);
        `;

        const pixInfoParagraphs = modal.querySelectorAll('.pix-info p');
        pixInfoParagraphs.forEach(p => {
            p.style.cssText = `
                color: #e8eaed;
                margin: 8px 0;
                font-size: 16px;
            `;
        });

        const qrPlaceholder = modal.querySelector('.pix-qr-placeholder');
        qrPlaceholder.style.cssText = `
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            margin-bottom: 24px;
            border: 2px dashed rgba(59, 130, 246, 0.3);
        `;

        const qrIcon = modal.querySelector('.pix-qr-placeholder i');
        qrIcon.style.cssText = `
            font-size: 80px;
            color: #3b82f6;
            margin-bottom: 16px;
            display: block;
        `;

        const qrText = modal.querySelector('.pix-qr-placeholder p');
        qrText.style.cssText = `
            color: #e8eaed;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
        `;

        const qrSmall = modal.querySelector('.pix-qr-placeholder small');
        qrSmall.style.cssText = `
            color: #9ca3af;
            font-size: 14px;
        `;

        const instructions = modal.querySelector('.pix-instructions');
        instructions.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        const instructionsTitle = modal.querySelector('.pix-instructions h4');
        instructionsTitle.style.cssText = `
            color: #e8eaed;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
        `;

        const instructionsList = modal.querySelector('.pix-instructions ol');
        instructionsList.style.cssText = `
            color: #9ca3af;
            margin: 0;
            padding-left: 20px;
        `;

        const instructionsItems = modal.querySelectorAll('.pix-instructions li');
        instructionsItems.forEach(li => {
            li.style.cssText = `
                margin-bottom: 8px;
                font-size: 14px;
            `;
        });

        document.body.appendChild(modal);

        // Fechar modal ao clicar fora
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.remove();
            }
        });
    }

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
