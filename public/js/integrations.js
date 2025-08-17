// Integrations Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔗 [INTEGRATIONS] Iniciando página de integrações');
    
    // Verificar autenticação
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = '/';
        return;
    }
    
    // Carregar dados do usuário
    loadUserData();
    
    // Carregar tokens de integração
    loadIntegrationTokens();
    
    // Event listeners
    setupEventListeners();
});

// Carregar dados do usuário
async function loadUserData() {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            
            // Atualizar nome do usuário
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = userData.name || userData.email;
            }
            
            // Atualizar contador de tokens
            const tokenCountElement = document.getElementById('tokenCount');
            if (tokenCountElement) {
                tokenCountElement.textContent = userData.tokens || 0;
            }
            
            console.log('✅ [INTEGRATIONS] Dados do usuário carregados');
        }
    } catch (error) {
        console.error('❌ [INTEGRATIONS] Erro ao carregar dados do usuário:', error);
    }
}

// Carregar tokens de integração
async function loadIntegrationTokens() {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/integrations/tokens', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderIntegrationTokens(data.tokens || []);
            updateIntegrationStats(data);
        } else {
            console.error('❌ [INTEGRATIONS] Erro ao carregar tokens');
            showEmptyState();
        }
    } catch (error) {
        console.error('❌ [INTEGRATIONS] Erro ao carregar tokens:', error);
        showEmptyState();
    }
}

// Renderizar tokens de integração
function renderIntegrationTokens(tokens) {
    const tokensList = document.getElementById('tokensList');
    if (!tokensList) return;
    
    if (tokens.length === 0) {
        showEmptyState();
        return;
    }
    
    tokensList.innerHTML = tokens.map(token => `
        <div class="token-card">
            <div class="token-header">
                <div class="token-info">
                    <h3>${token.name}</h3>
                    <p>${token.description || 'Sem descrição'}</p>
                </div>
                <div class="token-status ${token.active ? 'active' : 'inactive'}">
                    <i class="fas fa-${token.active ? 'check' : 'pause'}"></i>
                    ${token.active ? 'Ativo' : 'Inativo'}
                </div>
            </div>
            
            <div class="token-details">
                <div class="token-detail">
                    <span class="label">Website:</span>
                    <span class="value">${token.website}</span>
                </div>
                <div class="token-detail">
                    <span class="label">Vídeos Configurados:</span>
                    <span class="value">${token.videos?.length || 0}</span>
                </div>
                <div class="token-detail">
                    <span class="label">Usos:</span>
                    <span class="value">${token.usageCount || 0}</span>
                </div>
                <div class="token-detail">
                    <span class="label">Último Uso:</span>
                    <span class="value">${token.lastUsed ? new Date(token.lastUsed).toLocaleString('pt-BR') : 'Nunca'}</span>
                </div>
            </div>
            
            <div class="token-actions">
                <button class="btn btn-small btn-outline" onclick="copyToken('${token.token}')">
                    <i class="fas fa-copy"></i> Copiar Token
                </button>
                <button class="btn btn-small btn-outline" onclick="toggleToken('${token._id}', ${token.active})">
                    <i class="fas fa-${token.active ? 'pause' : 'play'}"></i> ${token.active ? 'Desativar' : 'Ativar'}
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteToken('${token._id}')">
                    <i class="fas fa-trash"></i> Deletar
                </button>
            </div>
        </div>
    `).join('');
    
    console.log('✅ [INTEGRATIONS] Tokens renderizados:', tokens.length);
}

// Mostrar estado vazio
function showEmptyState() {
    const tokensList = document.getElementById('tokensList');
    if (tokensList) {
        tokensList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-link" style="font-size: 64px; margin-bottom: 24px; color: #6b7280; opacity: 0.5;"></i>
                <h3>Nenhum token de integração encontrado</h3>
                <p>Crie seu primeiro token para começar a integrar o CallX aos seus sites externos</p>
                <button class="btn btn-primary" onclick="showCreateTokenModal()">
                    <i class="fas fa-plus"></i> Criar Primeiro Token
                </button>
            </div>
        `;
    }
}

// Atualizar estatísticas
function updateIntegrationStats(data) {
    const totalTokens = document.getElementById('totalTokens');
    const totalIntegrations = document.getElementById('totalIntegrations');
    const activeWebsites = document.getElementById('activeWebsites');
    
    if (totalTokens) totalTokens.textContent = data.totalTokens || 0;
    if (totalIntegrations) totalIntegrations.textContent = data.totalIntegrations || 0;
    if (activeWebsites) activeWebsites.textContent = data.activeWebsites || 0;
}

// Configurar event listeners
function setupEventListeners() {
    // Botão criar token
    const createTokenBtn = document.getElementById('createTokenBtn');
    if (createTokenBtn) {
        createTokenBtn.addEventListener('click', showCreateTokenModal);
    }
    
    // Botão atualizar
    const refreshTokensBtn = document.getElementById('refreshTokensBtn');
    if (refreshTokensBtn) {
        refreshTokensBtn.addEventListener('click', loadIntegrationTokens);
    }
    
    // Botão comprar token
    const buyTokenBtn = document.getElementById('buyTokenBtn');
    if (buyTokenBtn) {
        buyTokenBtn.addEventListener('click', () => {
            window.location.href = '/comprar-tokens.html';
        });
    }
    
    // Botão logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = '/';
        });
    }
    
    // Modal de criar token
    const createTokenModal = document.getElementById('createTokenModal');
    const closeTokenModal = document.getElementById('closeTokenModal');
    
    if (closeTokenModal) {
        closeTokenModal.addEventListener('click', () => {
            createTokenModal.style.display = 'none';
        });
    }
    
    // Fechar modal ao clicar fora
    if (createTokenModal) {
        createTokenModal.addEventListener('click', (e) => {
            if (e.target === createTokenModal) {
                createTokenModal.style.display = 'none';
            }
        });
    }
    
    // Formulário de criar token
    const createTokenForm = document.getElementById('createTokenForm');
    if (createTokenForm) {
        createTokenForm.addEventListener('submit', handleCreateToken);
    }
    
    console.log('✅ [INTEGRATIONS] Event listeners configurados');
}

// Mostrar modal de criar token
function showCreateTokenModal() {
    const modal = document.getElementById('createTokenModal');
    if (modal) {
        modal.style.display = 'flex';
        loadVideosForToken();
    }
}

// Carregar vídeos para o token
async function loadVideosForToken() {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/videos', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const videosList = document.getElementById('tokenVideosList');
            const defaultVideoSelect = document.getElementById('tokenDefaultVideo');
            
            if (videosList) {
                videosList.innerHTML = data.videos.map(video => `
                    <label class="video-checkbox">
                        <input type="checkbox" name="videos" value="${video._id}">
                        <span>${video.title}</span>
                    </label>
                `).join('');
            }
            
            if (defaultVideoSelect) {
                defaultVideoSelect.innerHTML = '<option value="">Selecione um vídeo padrão</option>' +
                    data.videos.map(video => `<option value="${video._id}">${video.title}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('❌ [INTEGRATIONS] Erro ao carregar vídeos:', error);
    }
}

// Manipular criação de token
async function handleCreateToken(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const tokenData = {
        name: formData.get('name'),
        description: formData.get('description'),
        website: formData.get('website'),
        videos: Array.from(formData.getAll('videos')),
        defaultVideo: formData.get('defaultVideo')
    };
    
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/integrations/tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(tokenData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ [INTEGRATIONS] Token criado:', result);
            
            // Fechar modal
            const modal = document.getElementById('createTokenModal');
            if (modal) modal.style.display = 'none';
            
            // Recarregar tokens
            loadIntegrationTokens();
            
            // Limpar formulário
            e.target.reset();
            
            // Mostrar notificação
            showNotification('Token criado com sucesso!', 'success');
        } else {
            const error = await response.json();
            showNotification(error.error || 'Erro ao criar token', 'error');
        }
    } catch (error) {
        console.error('❌ [INTEGRATIONS] Erro ao criar token:', error);
        showNotification('Erro ao criar token', 'error');
    }
}

// Copiar token
function copyToken(token) {
    navigator.clipboard.writeText(token).then(() => {
        showNotification('Token copiado para a área de transferência!', 'success');
    }).catch(() => {
        showNotification('Erro ao copiar token', 'error');
    });
}

// Alternar status do token
async function toggleToken(tokenId, currentStatus) {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`/api/integrations/tokens/${tokenId}/toggle`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadIntegrationTokens();
            showNotification(`Token ${currentStatus ? 'desativado' : 'ativado'} com sucesso!`, 'success');
        } else {
            showNotification('Erro ao alterar status do token', 'error');
        }
    } catch (error) {
        console.error('❌ [INTEGRATIONS] Erro ao alternar token:', error);
        showNotification('Erro ao alterar status do token', 'error');
    }
}

// Deletar token
async function deleteToken(tokenId) {
    if (!confirm('Tem certeza que deseja deletar este token? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`/api/integrations/tokens/${tokenId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadIntegrationTokens();
            showNotification('Token deletado com sucesso!', 'success');
        } else {
            showNotification('Erro ao deletar token', 'error');
        }
    } catch (error) {
        console.error('❌ [INTEGRATIONS] Erro ao deletar token:', error);
        showNotification('Erro ao deletar token', 'error');
    }
}

// Função de notificação
function showNotification(message, type = 'info') {
    // Implementar sistema de notificação
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message);
}
