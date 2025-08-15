// Configurações da API
const API_BASE_URL = window.location.origin + '/api';

// Estado da aplicação
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Elementos DOM
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const showForgotPassword = document.getElementById('showForgotPassword');
const backToLogin = document.getElementById('backToLogin');
const backToLoginFromReset = document.getElementById('backToLoginFromReset');

const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');

// Dashboard elements
const menuItems = document.querySelectorAll('.menu-item');
const tabContents = document.querySelectorAll('.tab-content');

// Sistema de Abas para Metas
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// Videos
const addVideoBtn = document.getElementById('addVideoBtn');
const videosList = document.getElementById('videosList');
const addVideoModal = document.getElementById('addVideoModal');
const addVideoForm = document.getElementById('addVideoForm');
const closeVideoModal = document.getElementById('closeVideoModal');
const videoType = document.getElementById('videoType');
const uploadGroup = document.getElementById('uploadGroup');
const urlGroup = document.getElementById('urlGroup');

// Meetings
const createMeetingBtn = document.getElementById('createMeetingBtn');
const meetingsList = document.getElementById('meetingsList');
const createMeetingModal = document.getElementById('createMeetingModal');
const createMeetingForm = document.getElementById('createMeetingForm');
const closeMeetingModal = document.getElementById('closeMeetingModal');
const meetingVideo = document.getElementById('meetingVideo');

// Profile
const profileForm = document.getElementById('profileForm');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const totalVideos = document.getElementById('totalVideos');
const totalMeetings = document.getElementById('totalMeetings');
const totalViews = document.getElementById('totalViews');

// Financial System
const monthlyGoal = document.getElementById('monthlyGoal');
const saveGoalBtn = document.getElementById('saveGoalBtn');
const totalRevenue = document.getElementById('totalRevenue');
const totalExpenses = document.getElementById('totalExpenses');
const totalProfit = document.getElementById('totalProfit');
const goalProgress = document.getElementById('goalProgress');
const entryDate = document.getElementById('entryDate');
const entryRevenue = document.getElementById('entryRevenue');
const entryExpenses = document.getElementById('entryExpenses');
const addEntryBtn = document.getElementById('addEntryBtn');

// Avatar
const avatarPreview = document.getElementById('avatarPreview');
const avatarInput = document.getElementById('avatarInput');
const changeAvatarBtn = document.getElementById('changeAvatarBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Google Meet Fake SaaS');
    
    // Verificar se já está logado
    if (authToken) {
        checkAuth();
    }
    
    // Inicializar event listeners
    initializeEventListeners();
    updateTokenButtonState();
});

function updateTokenButtonState() {
    const createMeetingBtn = document.querySelector('#createMeetingForm button[type="submit"]');
    if (createMeetingBtn && currentUser) {
        if (currentUser.visionTokens < 2) {
            createMeetingBtn.disabled = true;
            createMeetingBtn.textContent = 'Tokens insuficientes';
            createMeetingBtn.style.opacity = '0.5';
            createMeetingBtn.style.cursor = 'not-allowed';
        } else {
            createMeetingBtn.disabled = false;
            createMeetingBtn.textContent = 'Criar Reunião';
            createMeetingBtn.style.opacity = '1';
            createMeetingBtn.style.cursor = 'pointer';
        }
    }
}

// Função para verificar autenticação
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showDashboard();
            loadUserData();
        } else {
            // Token inválido, limpar
            localStorage.removeItem('authToken');
            authToken = null;
            showLanding();
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('authToken');
        authToken = null;
        showLanding();
    }
}

// Inicializar event listeners
function initializeEventListeners() {
    // Auth buttons
    loginBtn.addEventListener('click', () => showAuthModal('login'));
    registerBtn.addEventListener('click', () => showAuthModal('register'));
    
    // Modal controls
    closeModal.addEventListener('click', hideAuthModal);
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('register');
    });
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('login');
    });
    showForgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('forgot-password');
    });
    backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('login');
    });
    backToLoginFromReset.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('login');
    });
    
    // Forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    resetPasswordForm.addEventListener('submit', handleResetPassword);
    
    // Dashboard
    logoutBtn.addEventListener('click', handleLogout);
    
    // Menu tabs
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Sistema de Abas para Metas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchGoalsTab(tabName);
        });
    });
    
    // Videos
    addVideoBtn.addEventListener('click', () => showModal(addVideoModal));
    closeVideoModal.addEventListener('click', () => hideModal(addVideoModal));
    addVideoForm.addEventListener('submit', handleAddVideo);
    videoType.addEventListener('change', handleVideoTypeChange);
    
    // Meetings
    createMeetingBtn.addEventListener('click', () => showModal(createMeetingModal));
    closeMeetingModal.addEventListener('click', () => hideModal(createMeetingModal));
    createMeetingForm.addEventListener('submit', handleCreateMeeting);
    
    // Profile
    profileForm.addEventListener('submit', handleUpdateProfile);
    
    // Financial System
    if (saveGoalBtn) saveGoalBtn.addEventListener('click', saveMonthlyGoal);
    if (addEntryBtn) addEntryBtn.addEventListener('click', addDailyEntry);
    
    // Quick Entry System
    const quickEntryBtn = document.getElementById('quickEntryBtn');
    if (quickEntryBtn) {
        quickEntryBtn.addEventListener('click', addQuickEntry);
    }
    
    const manualEntryBtn = document.getElementById('manualEntryBtn');
    if (manualEntryBtn) {
        manualEntryBtn.addEventListener('click', addManualEntry);
    }
    
    // Filtros do histórico
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', loadFinancialHistory);
    }
    
    // Avatar System
    initializeAvatar();
    
    // Botão de compra de tokens
    const buyTokenBtn = document.getElementById('buyTokenBtn');
    if (buyTokenBtn) {
        buyTokenBtn.addEventListener('click', () => {
            window.location.href = '/comprar-tokens';
        });
    }
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });
}

// Funções de autenticação
function showAuthModal(type) {
    // Esconder todos os formulários
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';
    resetPasswordForm.style.display = 'none';
    
    // Mostrar formulário correto
    switch(type) {
        case 'login':
            modalTitle.textContent = 'Entrar';
            loginForm.style.display = 'block';
            break;
        case 'register':
            modalTitle.textContent = 'Registrar';
            registerForm.style.display = 'block';
            break;
        case 'forgot-password':
            modalTitle.textContent = 'Recuperar Senha';
            forgotPasswordForm.style.display = 'block';
            break;
        case 'reset-password':
            modalTitle.textContent = 'Redefinir Senha';
            resetPasswordForm.style.display = 'block';
            break;
    }
    
    authModal.classList.add('active');
}

function hideAuthModal() {
    authModal.classList.remove('active');
    loginForm.reset();
    registerForm.reset();
    forgotPasswordForm.reset();
    resetPasswordForm.reset();
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const data = {
        email: formData.get('email') || document.getElementById('loginEmail').value,
        password: formData.get('password') || document.getElementById('loginPassword').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            authToken = result.token;
            currentUser = result.user;
            localStorage.setItem('authToken', authToken);
            hideAuthModal();
            showDashboard();
            loadUserData();
            showNotification('Login realizado com sucesso!', 'success');
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('Erro ao fazer login', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const data = {
        name: formData.get('name') || document.getElementById('registerName').value,
        email: formData.get('email') || document.getElementById('registerEmail').value,
        password: formData.get('password') || document.getElementById('registerPassword').value
    };
    
    console.log('🔍 Dados do registro:', data);
    console.log('🔗 API URL:', `${API_BASE_URL}/auth/register`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);
        
        const result = await response.json();
        console.log('📋 Response data:', result);
        
        if (response.ok) {
            authToken = result.token;
            currentUser = result.user;
            localStorage.setItem('authToken', authToken);
            hideAuthModal();
            showDashboard();
            loadUserData();
            showNotification('Conta criada com sucesso!', 'success');
        } else {
            console.error('❌ Erro na resposta:', result);
            // Tratar erros específicos
            let errorMessage = 'Erro desconhecido';
            if (result.error) {
                if (result.error.includes('já está em uso')) {
                    errorMessage = 'Este email já está registrado. Tente fazer login ou use outro email.';
                } else if (result.error.includes('obrigatórios')) {
                    errorMessage = 'Todos os campos são obrigatórios.';
                } else if (result.error.includes('caracteres')) {
                    errorMessage = 'A senha deve ter pelo menos 6 caracteres, uma letra maiúscula, uma minúscula e um número.';
                } else {
                    errorMessage = result.error;
                }
            }
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('❌ Erro no registro:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        showNotification('Erro ao criar conta', 'error');
    }
}

// Função para recuperação de senha
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validação básica
    if (!email) {
        showNotification('Por favor, digite seu email', 'error');
        return;
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showNotification('Por favor, digite um email válido', 'error');
        return;
    }
    
    // Mostrar loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(result.message, 'success');
            
            // Em produção, o usuário receberia um email
            // Por enquanto, vamos mostrar o token para teste
            if (result.resetToken) {
                showNotification(`Token para teste: ${result.resetToken}`, 'info');
                showNotification('Em produção, este token seria enviado por email', 'info');
            }
            
            // Limpar formulário
            document.getElementById('forgotEmail').value = '';
            
            // Voltar para o login após 3 segundos
            setTimeout(() => {
                hideAuthModal();
                showAuthModal('login');
            }, 3000);
            
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro na recuperação de senha:', error);
        showNotification('Erro ao solicitar recuperação de senha. Tente novamente.', 'error');
    } finally {
        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Função para redefinir senha
async function handleResetPassword(e) {
    e.preventDefault();
    
    const token = document.getElementById('resetToken').value.trim();
    const password = document.getElementById('resetPassword').value;
    const passwordConfirm = document.getElementById('resetPasswordConfirm').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validações
    if (!token) {
        showNotification('Por favor, digite o token de recuperação', 'error');
        return;
    }
    
    if (!password) {
        showNotification('Por favor, digite a nova senha', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
        showNotification('A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('As senhas não coincidem', 'error');
        return;
    }
    
    // Mostrar loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redefinindo...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(result.message, 'success');
            
            // Limpar formulário
            document.getElementById('resetToken').value = '';
            document.getElementById('resetPassword').value = '';
            document.getElementById('resetPasswordConfirm').value = '';
            
            // Voltar para o login após 2 segundos
            setTimeout(() => {
                hideAuthModal();
                showAuthModal('login');
            }, 2000);
            
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        showNotification('Erro ao redefinir senha. Tente novamente.', 'error');
    } finally {
        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    showLanding();
    showNotification('Logout realizado com sucesso!', 'success');
}

// Funções de navegação
function showLanding() {
    dashboard.style.display = 'none';
    document.querySelector('.header').style.display = 'block';
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.features').style.display = 'block';
}

function showDashboard() {
    dashboard.style.display = 'block';
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    
    // Carregar dados iniciais
    loadVideos();
    loadMeetings();
    loadProfileStats();
}

// Função para alternar entre abas do dashboard
function switchTab(tabName) {
    // Remover classe active de todos os itens do menu e conteúdos
    menuItems.forEach(item => item.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Adicionar classe active ao item selecionado
    const selectedMenuItem = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedTabContent = document.getElementById(`${tabName}Tab`);
    
    if (selectedMenuItem && selectedTabContent) {
        selectedMenuItem.classList.add('active');
        selectedTabContent.classList.add('active');
        
        // Carregar dados específicos da aba
        switch(tabName) {
            case 'videos':
                loadVideos();
                break;
            case 'meetings':
                loadMeetings();
                break;
            case 'goals':
                loadFinancialData();
                break;
            case 'profile':
                loadProfileStats();
                break;
        }
    }
}

// Função para alternar entre abas do sistema de metas
function switchGoalsTab(tabName) {
    // Remover classe active de todos os botões e painéis
    tabButtons.forEach(button => button.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
    // Adicionar classe active ao botão e painel selecionados
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedPanel = document.getElementById(`${tabName}-tab`);
    
    if (selectedButton && selectedPanel) {
        selectedButton.classList.add('active');
        selectedPanel.classList.add('active');
        
        // Carregar dados específicos da aba
        switch(tabName) {
            case 'config':
                // Carregar dados da meta configurada
                loadGoalConfig();
                break;
            case 'summary':
                // Carregar resumo geral
                loadFinancialData();
                break;
            case 'dashboard':
                // Carregar dashboard financeiro
                loadFinancialData();
                break;
            case 'data':
                // Definir data atual no formulário manual
                const manualDate = document.getElementById('manualDate');
                if (manualDate) {
                    const today = new Date().toISOString().split('T')[0];
                    manualDate.value = today;
                }
                break;
            case 'history':
                // Carregar histórico financeiro
                loadFinancialHistory();
                break;
        }
    }
}

// Funções de vídeos
async function loadVideos() {
    try {
        const response = await fetch(`${API_BASE_URL}/videos`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderVideos(data.videos);
        }
    } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
    }
}

function renderVideos(videos) {
    videosList.innerHTML = '';
    
    // Atualizar contador de vídeos
    const videoCount = document.getElementById('videoCount');
    if (videoCount) {
        videoCount.textContent = `(${videos.length}/5)`;
    }
    
    // Verificar se atingiu o limite
    if (videos.length >= 5) {
        const addVideoBtn = document.getElementById('addVideoBtn');
        if (addVideoBtn) {
            addVideoBtn.disabled = true;
            addVideoBtn.innerHTML = '<i class="fas fa-ban"></i> Limite Atingido';
            addVideoBtn.style.opacity = '0.5';
            addVideoBtn.style.cursor = 'not-allowed';
        }
    } else {
        const addVideoBtn = document.getElementById('addVideoBtn');
        if (addVideoBtn) {
            addVideoBtn.disabled = false;
            addVideoBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Vídeo';
            addVideoBtn.style.opacity = '1';
            addVideoBtn.style.cursor = 'pointer';
        }
    }
    
    if (videos.length === 0) {
        videosList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <i class="fas fa-video" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>Nenhum vídeo encontrado</p>
                <p>Adicione seu primeiro vídeo para começar</p>
            </div>
        `;
        return;
    }
    
    videos.forEach(video => {
        // Construir URL completa do vídeo
        let videoUrl = video.url;
        if (videoUrl.startsWith('/uploads/')) {
            videoUrl = window.location.origin + videoUrl;
        }
        
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <video src="${videoUrl}" preload="metadata" muted style="width: 100%; height: 100%; object-fit: cover;">
                    <i class="fas fa-play" style="font-size: 32px;"></i>
                </video>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-description">${video.description || 'Sem descrição'}</p>
                <div class="video-meta">
                    <span><i class="fas fa-tag"></i> ${video.type}</span>
                    <span><i class="fas fa-eye"></i> ${video.views} visualizações</span>
                </div>
                <div class="video-actions">
                    <button class="btn btn-outline btn-small" onclick="copyVideoUrl('${videoUrl}')">
                        <i class="fas fa-link"></i>
                        Copiar URL
                    </button>
                    <button class="btn btn-outline btn-small" onclick="deleteVideo('${video._id}')">
                        <i class="fas fa-trash"></i>
                        Deletar
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar funcionalidade de preview automático
        const videoElement = videoCard.querySelector('video');
        const thumbnail = videoCard.querySelector('.video-thumbnail');
        
        let previewTimeout;
        let isPlaying = false;
        
        thumbnail.addEventListener('mouseenter', () => {
            if (!isPlaying) {
                previewTimeout = setTimeout(() => {
                    videoElement.currentTime = 0;
                    videoElement.play().then(() => {
                        isPlaying = true;
                    }).catch(err => {
                        console.log('Erro ao reproduzir preview:', err);
                    });
                }, 300); // Pequeno delay para evitar reprodução acidental
            }
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            clearTimeout(previewTimeout);
            if (isPlaying) {
                videoElement.pause();
                videoElement.currentTime = 0;
                isPlaying = false;
            }
        });
        
        // Parar preview após 5 segundos
        videoElement.addEventListener('timeupdate', () => {
            if (videoElement.currentTime >= 5) {
                videoElement.pause();
                videoElement.currentTime = 0;
                isPlaying = false;
            }
        });
        
        videosList.appendChild(videoCard);
    });
}

async function handleAddVideo(e) {
    e.preventDefault();
    
    const formData = new FormData(addVideoForm);
    const type = formData.get('type') || document.getElementById('videoType').value;
    
    // Verificar se é upload e se tem arquivo
    if (type === 'upload') {
        const fileInput = document.getElementById('videoFile');
        if (fileInput.files.length === 0) {
            showNotification('Arquivo de vídeo é obrigatório para upload', 'error');
            return;
        }
        // O arquivo já está no FormData do formulário, não precisa adicionar novamente
    } else if (type === 'drive' || type === 'url') {
        const url = formData.get('url') || document.getElementById('videoUrl').value;
        if (!url) {
            showNotification('URL é obrigatória para este tipo', 'error');
            return;
        }
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            hideModal(addVideoModal);
            addVideoForm.reset();
            loadVideos();
            showNotification('Vídeo adicionado com sucesso!', 'success');
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao adicionar vídeo:', error);
        showNotification('Erro ao adicionar vídeo', 'error');
    }
}

function handleVideoTypeChange() {
    const type = videoType.value;
    uploadGroup.style.display = type === 'upload' ? 'block' : 'none';
    urlGroup.style.display = (type === 'drive' || type === 'url') ? 'block' : 'none';
}

async function deleteVideo(videoId) {
    if (!confirm('Tem certeza que deseja deletar este vídeo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadVideos();
            showNotification('Vídeo deletado com sucesso!', 'success');
        } else {
            const result = await response.json();
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar vídeo:', error);
        showNotification('Erro ao deletar vídeo', 'error');
    }
}

function copyVideoUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        showNotification('URL copiada para a área de transferência!', 'success');
    });
}

// Funções de reuniões
async function loadMeetings() {
    try {
        const response = await fetch(`${API_BASE_URL}/meetings`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const meetings = await response.json();
            renderMeetings(meetings);
            loadVideoOptions();
        }
    } catch (error) {
        console.error('Erro ao carregar reuniões:', error);
    }
}

function renderMeetings(meetings) {
    if (!meetingsList) {
        console.warn('Elemento meetingsList não encontrado');
        return;
    }
    
    meetingsList.innerHTML = '';
    
    // Verificar se meetings é válido
    if (!meetings || !Array.isArray(meetings)) {
        console.warn('Dados de reuniões inválidos:', meetings);
        meetings = [];
    }
    
    if (meetings.length === 0) {
        meetingsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>Nenhuma reunião encontrada</p>
                <p>Crie sua primeira reunião para começar</p>
            </div>
        `;
        return;
    }
    
    meetings.forEach(meeting => {
        const meetingCard = document.createElement('div');
        meetingCard.className = 'meeting-card';
        
        // Verificar se a reunião foi criada há menos de 1 minuto
        const createdAt = new Date(meeting.createdAt);
        const now = new Date();
        const timeDiff = now - createdAt;
        const oneMinute = 60 * 1000; // 1 minuto em milissegundos
        const canDelete = timeDiff < oneMinute;
        
        // Truncar o link para mostrar apenas parte + "..."
        const link = meeting.meetLink || 'Link não disponível';
        const truncatedLink = link.length > 50 ? link.substring(0, 50) + '...' : link;
        
        // Determinar status da reunião
        const statusText = meeting.status === 'ended' ? 'Encerrado' : 'Ativo';
        const statusIcon = meeting.status === 'ended' ? 'fa-times-circle' : 'fa-check-circle';
        const statusClass = meeting.status === 'ended' ? 'ended' : 'active';
        
        meetingCard.innerHTML = `
            <div class="meeting-title">${meeting.title}</div>
            <div class="meeting-status ${statusClass}">
                <i class="fas ${statusIcon}"></i>
                ${statusText}
            </div>
            <div class="meeting-date">${createdAt.toLocaleDateString('pt-BR')}</div>
            <div class="meeting-time">${createdAt.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</div>
            <a href="${meeting.meetLink || '#'}" target="_blank" class="meeting-link" title="${meeting.meetLink || 'Link não disponível'}">
                ${truncatedLink}
            </a>
            <div class="meeting-actions">
                <button class="meeting-action-btn" onclick="copyMeetingLink('${meeting.meetLink || ''}')" title="Copiar Link">
                    <i class="fas fa-link"></i>
                </button>
                <button class="meeting-action-btn delete ${canDelete ? '' : 'hidden'}" onclick="deleteMeeting('${meeting._id}')" title="Deletar (disponível por 1 minuto)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        meetingsList.appendChild(meetingCard);
    });
}

async function loadVideoOptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/videos`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (!meetingVideo) {
                console.warn('Elemento meetingVideo não encontrado');
                return;
            }
            
            meetingVideo.innerHTML = '<option value="">Selecione um vídeo</option>';
            
            if (data.videos.length === 0) {
                meetingVideo.innerHTML = '<option value="">Nenhum vídeo encontrado</option>';
                return;
            }
            
            data.videos.forEach(video => {
                const option = document.createElement('option');
                option.value = video._id;
                option.textContent = video.title;
                option.dataset.videoUrl = video.url;
                meetingVideo.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar opções de vídeo:', error);
        meetingVideo.innerHTML = '<option value="">Erro ao carregar vídeos</option>';
    }
}

async function handleCreateMeeting(e) {
    e.preventDefault();
    
    const formData = new FormData(createMeetingForm);
    const title = formData.get('title') || document.getElementById('meetingTitle').value;
    const videoId = formData.get('video') || document.getElementById('meetingVideo').value;
    
    if (!videoId) {
        showNotification('Selecione um vídeo para a reunião', 'error');
        return;
    }
    
    // Gerar link do Google Meet com o vídeo selecionado
    const selectedOption = meetingVideo.options[meetingVideo.selectedIndex];
    const videoUrl = selectedOption.dataset.videoUrl;
    
    // Criar link da nossa página de reunião fake
    const meetingId = generateMeetingId();
    const meetLink = `${window.location.origin}/meet/${meetingId}?video=${encodeURIComponent(videoUrl)}`;
    
    try {
        // Salvar reunião no banco de dados
        const data = {
            title: title,
            videoId: videoId,
            meetingId: meetingId,
            meetLink: meetLink,
            createdBy: currentUser._id
        };
        
        const response = await fetch(`${API_BASE_URL}/meetings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            
            // Atualizar o contador de tokens
            if (result.tokensRemaining !== undefined) {
                tokenCount.textContent = result.tokensRemaining;
                currentUser.visionTokens = result.tokensRemaining;
            }
            
            showNotification(result.message, 'success');
            createMeetingModal.style.display = 'none';
            createMeetingForm.reset();
            
            // Copiar link para clipboard
            copyMeetingLink(meetLink);
            
            // Abrir reunião em nova aba
            window.open(meetLink, '_blank');
            
            // Recarregar reuniões
            loadMeetings();
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao criar reunião:', error);
        showNotification('Erro ao criar reunião', 'error');
    }
}

// Função para gerar ID único da reunião
function generateMeetingId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function deleteMeeting(meetingId) {
    if (!confirm('Tem certeza que deseja deletar esta reunião?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadMeetings();
            showNotification('Reunião deletada com sucesso!', 'success');
        } else {
            const result = await response.json();
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar reunião:', error);
        showNotification('Erro ao deletar reunião', 'error');
    }
}

function copyMeetingLink(meetLink) {
    if (!meetLink) {
        showNotification('Link não disponível', 'error');
        return;
    }
    
    navigator.clipboard.writeText(meetLink).then(() => {
        showNotification('Link da reunião copiado para a área de transferência!', 'success');
    });
}

// Funções de perfil
async function loadUserData() {
    if (!currentUser) return;
    
    userName.textContent = currentUser.name;
    profileName.value = currentUser.name;
    profileEmail.value = currentUser.email;
    
    // Atualizar contador de tokens
    const tokenCount = document.getElementById('tokenCount');
    if (tokenCount) {
        tokenCount.textContent = currentUser.visionTokens;
    }
    
    // Carregar dados financeiros
    loadFinancialData();
    
    // Carregar avatar salvo
    if (currentUser.avatar && avatarPreview) {
        avatarPreview.src = currentUser.avatar;
    }
    
    // Atualizar estado do botão de criar reunião
    updateTokenButtonState();
    
    // Mostrar dashboard
    showDashboard();
}

async function loadProfileStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            totalVideos.textContent = data.stats.videos.total;
            totalMeetings.textContent = data.stats.meetings.total;
            totalViews.textContent = data.stats.views.total;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function loadProfileStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            totalVideos.textContent = data.stats.videos.total;
            totalMeetings.textContent = data.stats.meetings.total;
            totalViews.textContent = data.stats.views.total;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const data = {
        name: profileName.value,
        email: profileEmail.value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            userName.textContent = currentUser.name;
            showNotification('Perfil atualizado com sucesso!', 'success');
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showNotification('Erro ao atualizar perfil', 'error');
    }
}

// Funções utilitárias
function showModal(modal) {
    modal.classList.add('active');
}

function hideModal(modal) {
    modal.classList.remove('active');
}

function showNotification(message, type = 'info') {
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#34a853';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ea4335';
    } else {
        notification.style.backgroundColor = '#1a73e8';
    }
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== SISTEMA FINANCEIRO =====

// Carregar dados financeiros
async function loadFinancialData() {
    try {
        const response = await fetch(`${API_BASE_URL}/financial/summary`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateFinancialDisplay(data);
            calculateMonthlyProjection(data);
        }
    } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
    }
}

// Função para calcular projeção mensal considerando diminuição nos últimos 10 dias
function calculateMonthlyProjection(data) {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDay;
    
    // Calcular média diária atual
    const currentRevenue = data.totalRevenue || 0;
    const currentDays = Math.max(currentDay, 1); // Evitar divisão por zero
    const currentDailyAverage = currentRevenue / currentDays;
    
    // Calcular projeção considerando diminuição nos últimos 10 dias
    let projectedRevenue = currentRevenue;
    
    if (daysRemaining > 0) {
        const last10DaysStart = daysInMonth - 9; // Últimos 10 dias do mês
        
        if (currentDay < last10DaysStart) {
            // Ainda não chegou nos últimos 10 dias
            const normalDays = last10DaysStart - currentDay;
            const last10Days = Math.min(daysRemaining, 10);
            
            // Projeção normal + projeção com diminuição
            projectedRevenue += (currentDailyAverage * normalDays);
            projectedRevenue += (currentDailyAverage * last10Days * 0.75); // 25% de diminuição média
        } else {
            // Já está nos últimos 10 dias
            const remainingLast10Days = Math.min(daysRemaining, daysInMonth - currentDay + 1);
            projectedRevenue += (currentDailyAverage * remainingLast10Days * 0.75);
        }
    }
    
    // Atualizar display da projeção
    const projectionElement = document.getElementById('monthlyProjection');
    if (projectionElement) {
        projectionElement.textContent = `R$ ${projectedRevenue.toFixed(2).replace('.', ',')}`;
    }
    
    // Calcular e atualizar dias restantes
    const daysRemainingElement = document.getElementById('daysRemaining');
    if (daysRemainingElement) {
        daysRemainingElement.textContent = `${daysRemaining} dias`;
    }
    
    // Atualizar média diária necessária para atingir a meta
    const monthlyGoal = parseFloat(document.getElementById('monthlyGoal')?.value || 0);
    if (monthlyGoal > 0) {
        const remainingToGoal = monthlyGoal - currentRevenue;
        const dailyNeeded = remainingToGoal / daysRemaining;
        
        const dailyNeededElement = document.getElementById('dailyNeeded');
        if (dailyNeededElement) {
            dailyNeededElement.textContent = `R$ ${dailyNeeded.toFixed(2).replace('.', ',')}`;
        }
    }
    
    return projectedRevenue;
}

// Adicionar entrada rápida (hoje)
async function addQuickEntry(e) {
    e.preventDefault();
    
    // Usar data atual automaticamente
    const today = new Date().toISOString().split('T')[0];
    const grossRevenue = parseFloat(document.getElementById('quickGrossRevenue').value) || 0;
    const chipCost = parseFloat(document.getElementById('quickChipCost').value) || 0;
    const additionalCost = parseFloat(document.getElementById('quickAdditionalCost').value) || 0;
    const adsCost = parseFloat(document.getElementById('quickAdsCost').value) || 0;
    const notes = document.getElementById('quickNotes').value;
    
    if (grossRevenue < 0 || chipCost < 0 || additionalCost < 0 || adsCost < 0) {
        showNotification('Valores não podem ser negativos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/financial/entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                date: today,
                grossRevenue,
                chipCost,
                additionalCost,
                adsCost,
                notes
            })
        });
        
        if (response.ok) {
            showNotification('Entrada rápida adicionada com sucesso!', 'success');
            // Limpar campos
            document.getElementById('quickGrossRevenue').value = '';
            document.getElementById('quickChipCost').value = '';
            document.getElementById('quickAdditionalCost').value = '';
            document.getElementById('quickAdsCost').value = '';
            document.getElementById('quickNotes').value = '';
            
            // Sincronizar todas as abas
            await syncAllFinancialData();
        } else {
            const error = await response.json();
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao adicionar entrada rápida:', error);
        showNotification('Erro ao adicionar entrada rápida', 'error');
    }
}

// Adicionar entrada manual
async function addManualEntry(e) {
    e.preventDefault();
    
    const date = document.getElementById('manualDate').value;
    const grossRevenue = parseFloat(document.getElementById('manualGrossRevenue').value) || 0;
    const chipCost = parseFloat(document.getElementById('manualChipCost').value) || 0;
    const additionalCost = parseFloat(document.getElementById('manualAdditionalCost').value) || 0;
    const adsCost = parseFloat(document.getElementById('manualAdsCost').value) || 0;
    const notes = document.getElementById('manualNotes').value;
    
    if (!date) {
        showNotification('Data é obrigatória', 'error');
        return;
    }
    
    if (grossRevenue < 0 || chipCost < 0 || additionalCost < 0 || adsCost < 0) {
        showNotification('Valores não podem ser negativos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/financial/entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                date,
                grossRevenue,
                chipCost,
                additionalCost,
                adsCost,
                notes
            })
        });
        
        if (response.ok) {
            showNotification('Entrada manual adicionada com sucesso!', 'success');
            // Limpar campos
            document.getElementById('manualDate').value = '';
            document.getElementById('manualGrossRevenue').value = '';
            document.getElementById('manualChipCost').value = '';
            document.getElementById('manualAdditionalCost').value = '';
            document.getElementById('manualAdsCost').value = '';
            document.getElementById('manualNotes').value = '';
            
            // Sincronizar todas as abas
            await syncAllFinancialData();
        } else {
            const error = await response.json();
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao adicionar entrada manual:', error);
        showNotification('Erro ao adicionar entrada manual', 'error');
    }
}

// Atualizar display financeiro
function updateFinancialDisplay(data) {
    // Atualizar meta mensal
    const monthlyGoalDisplay = document.getElementById('monthlyGoalDisplay');
    if (monthlyGoalDisplay) {
        monthlyGoalDisplay.textContent = `R$ ${(data.monthlyGoal || 0).toFixed(2).replace('.', ',')}`;
    }
    
    // Atualizar progresso da meta
    const goalProgressDisplay = document.getElementById('goalProgressDisplay');
    if (goalProgressDisplay && data.monthlyGoal > 0) {
        const progress = (data.totalRevenue / data.monthlyGoal) * 100;
        goalProgressDisplay.textContent = `${Math.min(progress, 100).toFixed(1)}%`;
        
        // Atualizar anel de progresso
        const progressRing = document.querySelector('.ring-progress');
        if (progressRing) {
            const circumference = 2 * Math.PI * 45; // r = 45
            const offset = circumference - (progress / 100) * circumference;
            progressRing.style.strokeDasharray = circumference;
            progressRing.style.strokeDashoffset = offset;
        }
    }
    
    // Atualizar faturamento total
    const totalRevenueElement = document.getElementById('totalRevenue');
    if (totalRevenueElement) {
        totalRevenueElement.textContent = `R$ ${(data.totalRevenue || 0).toFixed(2).replace('.', ',')}`;
    }
    
    // Atualizar média diária
    const dailyAverageElement = document.getElementById('dailyAverage');
    if (dailyAverageElement) {
        const today = new Date();
        const currentDay = today.getDate();
        const dailyAverage = currentDay > 0 ? (data.totalRevenue || 0) / currentDay : 0;
        dailyAverageElement.textContent = `R$ ${dailyAverage.toFixed(2).replace('.', ',')}`;
    }
    
    // Atualizar melhor e pior dia
    if (data.entries && data.entries.length > 0) {
        const bestDay = Math.max(...data.entries.map(entry => entry.netProfit));
        const worstDay = Math.min(...data.entries.map(entry => entry.netProfit));
        
        const bestDayElement = document.getElementById('bestDay');
        if (bestDayElement) {
            bestDayElement.textContent = `R$ ${bestDay.toFixed(2).replace('.', ',')}`;
        }
        
        const worstDayElement = document.getElementById('worstDay');
        if (worstDayElement) {
            worstDayElement.textContent = `R$ ${worstDay.toFixed(2).replace('.', ',')}`;
        }
    }
    
    // Atualizar barra de progresso
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    if (progressFill && progressText && data.monthlyGoal > 0) {
        const progress = (data.totalRevenue / data.monthlyGoal) * 100;
        progressFill.style.width = `${Math.min(progress, 100)}%`;
        progressText.textContent = `${Math.min(progress, 100).toFixed(1)}% da meta atingida`;
    }
    
    // Atualizar tendências
    updateTrends(data);
}

// Atualizar tendências
function updateTrends(data) {
    // Crescimento
    const growthRate = document.getElementById('growthRate');
    if (growthRate) {
        // Simular crescimento baseado nos dados
        const growth = data.totalRevenue > 0 ? '+15%' : '0%';
        growthRate.textContent = growth;
    }
    
    // Frequência
    const frequencyRate = document.getElementById('frequencyRate');
    if (frequencyRate) {
        const today = new Date();
        const currentDay = today.getDate();
        const frequency = data.entries ? (data.entries.length / currentDay) * 100 : 0;
        frequencyRate.textContent = `${Math.min(frequency, 100).toFixed(0)}%`;
    }
    
    // Eficiência
    const efficiencyRate = document.getElementById('efficiencyRate');
    if (efficiencyRate && data.monthlyGoal > 0) {
        const efficiency = (data.totalRevenue / data.monthlyGoal) * 100;
        efficiencyRate.textContent = `${Math.min(efficiency, 100).toFixed(0)}%`;
    }
    
    // Projeção
    const projectionRate = document.getElementById('projectionRate');
    if (projectionRate) {
        projectionRate.textContent = '+25%';
    }
}

// Salvar meta mensal
async function saveMonthlyGoal() {
    const goal = parseFloat(document.getElementById('monthlyGoal').value);
    const goalType = document.getElementById('goalType').value;
    const goalDeadline = document.getElementById('goalDeadline').value;
    const goalPriority = document.getElementById('goalPriority').value;
    const goalDescription = document.getElementById('goalDescription').value;
    
    if (isNaN(goal) || goal < 0) {
        showNotification('Meta deve ser um número positivo', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/financial/goal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                monthlyGoal: goal,
                goalType,
                goalDeadline,
                goalPriority,
                goalDescription
            })
        });
        
        if (response.ok) {
            showNotification('Meta salva com sucesso!', 'success');
            // Sincronizar dados em todas as abas
            await syncAllFinancialData();
        } else {
            const error = await response.json();
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar meta:', error);
        showNotification('Erro ao salvar meta', 'error');
    }
}

// Função para sincronizar todos os dados financeiros entre abas
async function syncAllFinancialData() {
    try {
        const response = await fetch(`${API_BASE_URL}/financial/summary`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Atualizar todas as abas com os dados sincronizados
            updateAllTabsWithData(data);
            
            // Calcular projeções e métricas
            calculateAllMetrics(data);
            
        } else {
            console.error('Erro ao carregar dados para sincronização');
        }
    } catch (error) {
        console.error('Erro na sincronização:', error);
    }
}

// Atualizar todas as abas com dados sincronizados
function updateAllTabsWithData(data) {
    // Aba Configurar Metas
    updateConfigTab(data);
    
    // Aba Resumo Geral
    updateSummaryTab(data);
    
    // Aba Dashboard Financeiro
    updateDashboardTab(data);
    
    // Aba Histórico
    updateHistoryTab(data);
}

// Atualizar aba de configuração
function updateConfigTab(data) {
    const monthlyGoalInput = document.getElementById('monthlyGoal');
    if (monthlyGoalInput) {
        monthlyGoalInput.value = data.monthlyGoal || 0;
    }
    
    // Carregar dados salvos da meta se existirem
    if (data.goalData) {
        const goalType = document.getElementById('goalType');
        const goalDeadline = document.getElementById('goalDeadline');
        const goalPriority = document.getElementById('goalPriority');
        const goalDescription = document.getElementById('goalDescription');
        
        if (goalType) goalType.value = data.goalData.goalType || 'revenue';
        if (goalDeadline) goalDeadline.value = data.goalData.goalDeadline || '';
        if (goalPriority) goalPriority.value = data.goalData.goalPriority || 'medium';
        if (goalDescription) goalDescription.value = data.goalData.goalDescription || '';
    }
}

// Atualizar aba de resumo geral
function updateSummaryTab(data) {
    // Meta mensal
    const monthlyGoalDisplay = document.getElementById('monthlyGoalDisplay');
    if (monthlyGoalDisplay) {
        monthlyGoalDisplay.textContent = `R$ ${(data.monthlyGoal || 0).toFixed(2).replace('.', ',')}`;
    }
    
    // Progresso da meta
    const goalProgressDisplay = document.getElementById('goalProgressDisplay');
    if (goalProgressDisplay && data.monthlyGoal > 0) {
        const progress = (data.totalRevenue / data.monthlyGoal) * 100;
        goalProgressDisplay.textContent = `${Math.min(progress, 100).toFixed(1)}%`;
        
        // Atualizar anel de progresso
        updateProgressRing(progress);
    }
    
    // Dias restantes
    const daysRemaining = document.getElementById('daysRemaining');
    if (daysRemaining) {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const remaining = daysInMonth - today.getDate();
        daysRemaining.textContent = `${remaining} dias`;
    }
    
    // Projeção mensal
    const monthlyProjection = document.getElementById('monthlyProjection');
    if (monthlyProjection) {
        const projection = calculateMonthlyProjection(data);
        monthlyProjection.textContent = `R$ ${projection.toFixed(2).replace('.', ',')}`;
    }
}

// Atualizar aba dashboard financeiro
function updateDashboardTab(data) {
    // Faturamento total
    const totalRevenue = document.getElementById('totalRevenue');
    if (totalRevenue) {
        totalRevenue.textContent = `R$ ${(data.totalRevenue || 0).toFixed(2).replace('.', ',')}`;
    }
    
    // Média diária
    const dailyAverage = document.getElementById('dailyAverage');
    if (dailyAverage) {
        const today = new Date();
        const currentDay = today.getDate();
        const average = currentDay > 0 ? (data.totalRevenue || 0) / currentDay : 0;
        dailyAverage.textContent = `R$ ${average.toFixed(2).replace('.', ',')}`;
    }
    
    // Melhor e pior dia
    if (data.entries && data.entries.length > 0) {
        const profits = data.entries.map(entry => entry.netProfit || 0);
        const bestDay = Math.max(...profits);
        const worstDay = Math.min(...profits);
        
        const bestDayElement = document.getElementById('bestDay');
        const worstDayElement = document.getElementById('worstDay');
        
        if (bestDayElement) bestDayElement.textContent = `R$ ${bestDay.toFixed(2).replace('.', ',')}`;
        if (worstDayElement) worstDayElement.textContent = `R$ ${worstDay.toFixed(2).replace('.', ',')}`;
    }
    
    // Barra de progresso
    updateProgressBar(data);
    
    // Tendências
    updateTrendsWithRealData(data);
}

// Atualizar aba histórico
function updateHistoryTab(data) {
    if (data.entries && data.entries.length > 0) {
        renderFinancialHistory(data.entries);
    }
}

// Calcular todas as métricas
function calculateAllMetrics(data) {
    // Calcular projeção mensal
    const projection = calculateMonthlyProjection(data);
    
    // Calcular média diária necessária
    if (data.monthlyGoal > 0) {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - today.getDate();
        const remainingToGoal = data.monthlyGoal - data.totalRevenue;
        const dailyNeeded = daysRemaining > 0 ? remainingToGoal / daysRemaining : 0;
        
        const dailyNeededElement = document.getElementById('dailyNeeded');
        if (dailyNeededElement) {
            dailyNeededElement.textContent = `R$ ${dailyNeeded.toFixed(2).replace('.', ',')}`;
        }
    }
}

// Atualizar anel de progresso
function updateProgressRing(progress) {
    const progressRing = document.querySelector('.ring-progress');
    if (progressRing) {
        const circumference = 2 * Math.PI * 45; // r = 45
        const offset = circumference - (progress / 100) * circumference;
        progressRing.style.strokeDasharray = circumference;
        progressRing.style.strokeDashoffset = offset;
    }
}

// Atualizar barra de progresso
function updateProgressBar(data) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText && data.monthlyGoal > 0) {
        const progress = (data.totalRevenue / data.monthlyGoal) * 100;
        progressFill.style.width = `${Math.min(progress, 100)}%`;
        progressText.textContent = `${Math.min(progress, 100).toFixed(1)}% da meta atingida`;
    }
}

// Atualizar tendências com dados reais
function updateTrendsWithRealData(data) {
    // Crescimento baseado em dados reais
    const growthRate = document.getElementById('growthRate');
    if (growthRate && data.entries && data.entries.length > 1) {
        const recentEntries = data.entries.slice(-7); // Últimos 7 dias
        const olderEntries = data.entries.slice(-14, -7); // 7 dias antes
        
        if (olderEntries.length > 0) {
            const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.netProfit || 0), 0) / recentEntries.length;
            const olderAvg = olderEntries.reduce((sum, entry) => sum + (entry.netProfit || 0), 0) / olderEntries.length;
            
            const growth = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
            growthRate.textContent = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        }
    }
    
    // Frequência baseada em dados reais
    const frequencyRate = document.getElementById('frequencyRate');
    if (frequencyRate && data.entries) {
        const today = new Date();
        const currentDay = today.getDate();
        const frequency = currentDay > 0 ? (data.entries.length / currentDay) * 100 : 0;
        frequencyRate.textContent = `${Math.min(frequency, 100).toFixed(0)}%`;
    }
    
    // Eficiência baseada na meta real
    const efficiencyRate = document.getElementById('efficiencyRate');
    if (efficiencyRate && data.monthlyGoal > 0) {
        const efficiency = (data.totalRevenue / data.monthlyGoal) * 100;
        efficiencyRate.textContent = `${Math.min(efficiency, 100).toFixed(0)}%`;
    }
    
    // Projeção baseada em dados reais
    const projectionRate = document.getElementById('projectionRate');
    if (projectionRate) {
        const projection = calculateMonthlyProjection(data);
        const currentRevenue = data.totalRevenue || 0;
        const growth = currentRevenue > 0 ? ((projection - currentRevenue) / currentRevenue) * 100 : 0;
        projectionRate.textContent = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    }
}

// Adicionar entrada diária
async function addDailyEntry() {
    // Usar data atual automaticamente
    const today = new Date().toISOString().split('T')[0];
    const revenue = parseFloat(entryRevenue.value) || 0;
    const expenses = parseFloat(entryExpenses.value) || 0;
    
    if (revenue < 0 || expenses < 0) {
        showNotification('Valores não podem ser negativos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/financial/entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ date: today, revenue, expenses })
        });
        
        if (response.ok) {
            showNotification('Entrada adicionada com sucesso!', 'success');
            entryRevenue.value = '';
            entryExpenses.value = '';
            loadFinancialData();
        } else {
            const error = await response.json();
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao adicionar entrada:', error);
        showNotification('Erro ao adicionar entrada', 'error');
    }
}

// Funções de histórico financeiro
async function loadFinancialHistory() {
    const startDateElement = document.getElementById('startDate');
    const endDateElement = document.getElementById('endDate');
    const typeElement = document.getElementById('historyType');
    
    // Verificar se os elementos existem antes de acessar
    if (!startDateElement || !endDateElement || !typeElement) {
        console.warn('Elementos de histórico financeiro não encontrados');
        return;
    }
    
    const startDate = startDateElement.value;
    const endDate = endDateElement.value;
    const type = typeElement.value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/financial/history?startDate=${startDate}&endDate=${endDate}&type=${type}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderFinancialHistory(data.entries);
        } else {
            const error = await response.json();
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar histórico financeiro:', error);
        showNotification('Erro ao carregar histórico financeiro', 'error');
    }
}

function renderFinancialHistory(entries) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    historyList.innerHTML = '';

    if (entries.length === 0) {
        historyList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <i class="fas fa-history" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>Nenhum histórico financeiro encontrado</p>
            </div>
        `;
        return;
    }

    entries.forEach(entry => {
        const entryCard = document.createElement('div');
        entryCard.className = 'entry-card';
        entryCard.innerHTML = `
            <div class="entry-date">${entry.date}</div>
            <div class="entry-type">${entry.type}</div>
            <div class="entry-gross-revenue">R$ ${entry.grossRevenue.toFixed(2)}</div>
            <div class="entry-chip-cost">R$ ${entry.chipCost.toFixed(2)}</div>
            <div class="entry-additional-cost">R$ ${entry.additionalCost.toFixed(2)}</div>
            <div class="entry-ads-cost">R$ ${entry.adsCost.toFixed(2)}</div>
            <div class="entry-notes">${entry.notes || ''}</div>
        `;
        historyList.appendChild(entryCard);
    });
}

// Carregar configuração da meta
async function loadGoalConfig() {
    try {
        const response = await fetch(`${API_BASE_URL}/financial/goal`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Preencher campos com dados salvos
            const monthlyGoalInput = document.getElementById('monthlyGoal');
            const goalType = document.getElementById('goalType');
            const goalDeadline = document.getElementById('goalDeadline');
            const goalPriority = document.getElementById('goalPriority');
            const goalDescription = document.getElementById('goalDescription');
            
            // Verificar se os elementos existem antes de acessar
            if (monthlyGoalInput) monthlyGoalInput.value = data.monthlyGoal || 0;
            if (goalType) goalType.value = data.goalType || 'revenue';
            if (goalDeadline) goalDeadline.value = data.goalDeadline || '';
            if (goalPriority) goalPriority.value = data.goalPriority || 'medium';
            if (goalDescription) goalDescription.value = data.goalDescription || '';
        }
    } catch (error) {
        console.error('Erro ao carregar configuração da meta:', error);
    }
}

// ===== SISTEMA DE AVATAR =====

// Inicializar sistema de avatar
function initializeAvatar() {
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            avatarInput.click();
        });
    }
    
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarChange);
    }
    
    if (avatarPreview) {
        avatarPreview.addEventListener('click', () => {
            avatarInput.click();
        });
    }
}

// Manipular mudança de avatar
async function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB
            showNotification('Arquivo muito grande. Máximo 5MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            const avatarData = e.target.result;
            avatarPreview.src = avatarData;
            
            // Salvar avatar no banco de dados
            try {
                const response = await fetch(`${API_BASE_URL}/users/avatar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ avatar: avatarData })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    currentUser.avatar = avatarData;
                    showNotification('Foto de perfil salva com sucesso!', 'success');
                } else {
                    const error = await response.json();
                    showNotification(error.error || 'Erro ao salvar foto', 'error');
                }
            } catch (error) {
                console.error('Erro ao salvar avatar:', error);
                showNotification('Erro ao salvar foto de perfil', 'error');
            }
        };
        reader.readAsDataURL(file);
    }
} 