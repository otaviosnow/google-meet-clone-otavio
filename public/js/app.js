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
            
            // Carregar histórico de modificações se for a aba de modificações
            if (tabName === 'modifications') {
                loadModificationsHistory();
            }
        });
    });
    
    // Inicializar filtros de modificações
    initializeModificationFilters();
    
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
            // Limpar formulário primeiro
            document.getElementById('forgotEmail').value = '';
            
            // Mostrar notificações com delay para garantir que sejam exibidas
            setTimeout(() => {
                showNotification(result.message, 'success');
                
                // Em produção, o usuário receberia um email
                // Por enquanto, vamos mostrar o token para teste
                if (result.resetToken) {
                    setTimeout(() => {
                        showNotification(`Token para teste: ${result.resetToken}`, 'info');
                    }, 500);
                    
                    setTimeout(() => {
                        showNotification('Em produção, este token seria enviado por email', 'info');
                    }, 1000);
                }
            }, 100);
            
            // Voltar para o login após 5 segundos (tempo suficiente para ler as notificações)
            setTimeout(() => {
                hideAuthModal();
                showAuthModal('login');
            }, 5000);
            
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
            case 'analytics':
                window.location.href = '/analytics';
                break;
            case 'admin':
                showAdminTab();
                break;
        }
        
        // Carregar histórico de modificações se estiver na aba de metas
        if (tabName === 'goals') {
            // Aguardar um pouco para garantir que a aba específica seja carregada
            setTimeout(() => {
                const activeTab = document.querySelector('.tab-btn.active[data-tab]');
                if (activeTab && activeTab.dataset.tab === 'modifications') {
                    loadModificationsHistory();
                } else if (activeTab && activeTab.dataset.tab === 'history') {
                    loadFinancialHistory();
                }
            }, 100);
        }
    }
}

// ===== FUNÇÕES DO PAINEL ADMIN =====

// Variável para controlar se o admin está autenticado
let adminAuthenticated = false;

// Função para mostrar aba admin
function showAdminTab() {
    if (!currentUser || !currentUser.isAdmin) {
        showNotification('Acesso negado. Apenas administradores.', 'error');
        return;
    }

    // Se não estiver autenticado, mostrar tela de autenticação
    if (!adminAuthenticated) {
        document.getElementById('adminAuth').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    } else {
        document.getElementById('adminAuth').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadAdminData();
    }
}

// Função para autenticar admin
async function authenticateAdmin(password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (response.ok) {
            adminAuthenticated = true;
            showAdminTab();
            showNotification('Acesso administrativo concedido!', 'success');
        } else {
            showNotification(result.error || 'Senha incorreta', 'error');
        }
    } catch (error) {
        console.error('Erro na autenticação admin:', error);
        showNotification('Erro na autenticação', 'error');
    }
}

// Função para sair do admin
function logoutAdmin() {
    adminAuthenticated = false;
    document.getElementById('adminAuth').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
    showNotification('Sessão administrativa encerrada', 'info');
}

// Função para carregar dados do admin
async function loadAdminData() {
    try {
        // Carregar estatísticas
        const statsResponse = await fetch(`${API_BASE_URL}/analytics/stats?period=30`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            document.getElementById('adminTotalUsers').textContent = stats.totalUsers.toLocaleString();
            document.getElementById('adminTotalMeetings').textContent = stats.totalMeetings.toLocaleString();
            document.getElementById('adminTotalTokens').textContent = stats.totalTokens.toLocaleString();
        }

        // Carregar usuários
        await loadAdminUsers();

    } catch (error) {
        console.error('Erro ao carregar dados admin:', error);
        showNotification('Erro ao carregar dados administrativos', 'error');
    }
}

// Função para carregar usuários
async function loadAdminUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/admin`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            renderAdminUsersTable(data.users);
        } else {
            showNotification('Erro ao carregar usuários', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar usuários', 'error');
    }
}

// Função para renderizar tabela de usuários
function renderAdminUsersTable(users) {
    console.log('📊 [ADMIN] Renderizando tabela de usuários:', users);
    
    const tbody = document.getElementById('adminUsersTable');
    tbody.innerHTML = '';

    users.forEach(user => {
        console.log('👤 [ADMIN] Renderizando usuário:', { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            isBanned: user.isBanned 
        });
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name || 'Sem nome'}</td>
            <td>${user.email}</td>
            <td><span class="user-status ${user.isBanned ? 'banned' : 'active'}">${user.isBanned ? 'Banido' : 'Ativo'}</span></td>
            <td>${user.visionTokens}</td>
            <td><span class="user-admin ${user.isAdmin ? 'yes' : 'no'}">${user.isAdmin ? 'Sim' : 'Não'}</span></td>
            <td class="user-actions">
                <button class="btn-edit" data-user-id="${user.id}" data-action="edit">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-ban" data-user-id="${user.id}" data-action="ban" data-ban-status="${!user.isBanned}">
                    <i class="fas fa-${user.isBanned ? 'unlock' : 'ban'}"></i> ${user.isBanned ? 'Desbanir' : 'Banir'}
                </button>
                <button class="btn-delete" data-user-id="${user.id}" data-action="delete">
                    <i class="fas fa-trash"></i> Deletar
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Adicionar event listeners após renderizar
    addAdminEventListeners();
}

// Função para editar usuário
async function editUser(userId) {
    console.log('✏️ [ADMIN] Editando usuário:', userId);
    
    if (!userId || userId === 'undefined') {
        showNotification('ID do usuário inválido', 'error');
        return;
    }
    
    try {
        // Buscar dados do usuário
        const response = await fetch(`${API_BASE_URL}/users/admin`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const user = data.users.find(u => u.id === userId);
            
            if (user) {
                // Preencher modal com dados do usuário
                document.getElementById('editUserId').value = user.id;
                document.getElementById('editUserName').value = user.name || '';
                document.getElementById('editUserEmail').value = user.email;
                document.getElementById('editUserTokens').value = user.visionTokens;
                document.getElementById('editUserAdmin').value = user.isAdmin.toString();
                document.getElementById('editUserStatus').value = user.isActive.toString();
                
                // Mostrar modal
                document.getElementById('editUserModal').style.display = 'flex';
            } else {
                showNotification('Usuário não encontrado', 'error');
            }
        } else {
            showNotification('Erro ao carregar dados do usuário', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        showNotification('Erro ao carregar dados do usuário', 'error');
    }
}

// Função para banir/desbanir usuário
async function toggleBanUser(userId, ban) {
    console.log('🔧 [ADMIN] Tentando banir/desbanir usuário:', { userId, ban });
    
    if (!userId || userId === 'undefined') {
        showNotification('ID do usuário inválido', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/admin/${userId}/ban`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ isBanned: ban })
        });

        if (response.ok) {
            showNotification(`Usuário ${ban ? 'banido' : 'desbanido'} com sucesso!`, 'success');
            loadAdminUsers();
        } else {
            const result = await response.json();
            showNotification(result.error || 'Erro ao alterar status do usuário', 'error');
        }
    } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        showNotification('Erro ao alterar status do usuário', 'error');
    }
}

// Função para deletar usuário
async function deleteUser(userId) {
    console.log('🗑️ [ADMIN] Tentando deletar usuário:', { userId });
    
    if (!userId || userId === 'undefined') {
        showNotification('ID do usuário inválido', 'error');
        return;
    }
    
    if (!confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            showNotification('Usuário deletado com sucesso!', 'success');
            loadAdminUsers();
        } else {
            const result = await response.json();
            showNotification(result.error || 'Erro ao deletar usuário', 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        showNotification('Erro ao deletar usuário', 'error');
    }
}

// Função para adicionar event listeners do painel admin
function addAdminEventListeners() {
    // Botões de ação dos usuários
    document.querySelectorAll('[data-action="edit"]').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            console.log('✏️ [ADMIN] Editando usuário:', userId);
            editUser(userId);
        });
    });
    
    document.querySelectorAll('[data-action="ban"]').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const banStatus = this.getAttribute('data-ban-status') === 'true';
            console.log('🚫 [ADMIN] Banindo/desbanindo usuário:', { userId, banStatus });
            toggleBanUser(userId, banStatus);
        });
    });
    
    document.querySelectorAll('[data-action="delete"]').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            console.log('🗑️ [ADMIN] Deletando usuário:', userId);
            deleteUser(userId);
        });
    });
}

// Função para salvar alterações do usuário
async function saveUserChanges(e) {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const formData = new FormData(e.target);
    
    const data = {
        name: formData.get('name'),
        visionTokens: parseInt(formData.get('visionTokens')),
        isAdmin: formData.get('isAdmin'),
        isActive: formData.get('isActive')
    };
    
    console.log('💾 [ADMIN] Salvando alterações do usuário:', { userId, data });
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification('Usuário atualizado com sucesso!', 'success');
            document.getElementById('editUserModal').style.display = 'none';
            loadAdminUsers(); // Recarregar tabela
        } else {
            const result = await response.json();
            showNotification(result.error || 'Erro ao atualizar usuário', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        showNotification('Erro ao atualizar usuário', 'error');
    }
}

// Event listeners para o painel admin
document.addEventListener('DOMContentLoaded', function() {
    // Form de autenticação admin
    const adminAuthForm = document.getElementById('adminAuthForm');
    if (adminAuthForm) {
        adminAuthForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('adminPassword').value;
            authenticateAdmin(password);
        });
    }

    // Form de edição de usuário
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', saveUserChanges);
    }

    // Fechar modal de edição
    const closeEditUserModal = document.getElementById('closeEditUserModal');
    if (closeEditUserModal) {
        closeEditUserModal.addEventListener('click', function() {
            document.getElementById('editUserModal').style.display = 'none';
        });
    }

    // Busca de usuários
    const adminUserSearch = document.getElementById('adminUserSearch');
    if (adminUserSearch) {
        adminUserSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#adminUsersTable tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});

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
                <div class="video-preview-container">
                    <video src="${videoUrl}" preload="metadata" muted class="video-preview">
                        <i class="fas fa-play" style="font-size: 32px;"></i>
                    </video>
                    <div class="video-preview-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="video-preview-loading">
                        <i class="fas fa-spinner fa-spin"></i> Carregando...
                    </div>
                    <div class="video-preview-error">
                        <i class="fas fa-exclamation-triangle"></i><br>
                        Erro ao carregar vídeo
                    </div>
                </div>
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
        const videoElement = videoCard.querySelector('.video-preview');
        const thumbnail = videoCard.querySelector('.video-thumbnail');
        const overlay = videoCard.querySelector('.video-preview-overlay');
        const loading = videoCard.querySelector('.video-preview-loading');
        const error = videoCard.querySelector('.video-preview-error');
        
        let previewTimeout;
        let isPlaying = false;
        let hasError = false;
        
        // Configurar eventos do vídeo
        videoElement.addEventListener('loadstart', () => {
            loading.classList.add('show');
            overlay.classList.remove('show');
            error.classList.remove('show');
        });
        
        videoElement.addEventListener('canplay', () => {
            loading.classList.remove('show');
            overlay.classList.add('show');
        });
        
        videoElement.addEventListener('error', () => {
            loading.classList.remove('show');
            overlay.classList.remove('show');
            error.classList.add('show');
            hasError = true;
        });
        
        thumbnail.addEventListener('mouseenter', () => {
            if (!isPlaying && !hasError) {
                previewTimeout = setTimeout(() => {
                    videoElement.currentTime = 0;
                    videoElement.play().then(() => {
                        isPlaying = true;
                        overlay.classList.remove('show');
                    }).catch(err => {
                        console.log('Erro ao reproduzir preview:', err);
                        error.classList.add('show');
                        hasError = true;
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
                overlay.classList.add('show');
            }
        });
        
        // Parar preview após 5 segundos
        videoElement.addEventListener('timeupdate', () => {
            if (videoElement.currentTime >= 5) {
                videoElement.pause();
                videoElement.currentTime = 0;
                isPlaying = false;
                overlay.classList.add('show');
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
                
                console.log('📹 Opção de vídeo criada:', {
                    id: video._id,
                    title: video.title,
                    url: video.url,
                    datasetUrl: option.dataset.videoUrl
                });
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
    
    console.log('🎬 Criando reunião com vídeo:', {
        selectedOption: selectedOption,
        videoUrl: videoUrl,
        videoId: videoId,
        title: title
    });
    
    // Criar link da nossa página de reunião fake
    const meetingId = generateMeetingId();
    const meetLink = `${window.location.origin}/meet/${meetingId}?video=${encodeURIComponent(videoUrl)}`;
    
    console.log('🔗 Link da reunião criado:', meetLink);
    
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
    
    // Mostrar botão de analytics se for admin
    if (currentUser.isAdmin) {
        const analyticsMenuItem = document.getElementById('analyticsMenuItem');
        if (analyticsMenuItem) {
            analyticsMenuItem.style.display = 'block';
        }
        
        // Mostrar botão de admin
        const adminMenuItem = document.getElementById('adminMenuItem');
        if (adminMenuItem) {
            adminMenuItem.style.display = 'block';
        }
    }
    
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
        z-index: 99999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        min-width: 300px;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#34a853';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ea4335';
    } else {
        notification.style.backgroundColor = '#1a73e8';
    }
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
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
    
    // Calcular média diária atual (usando lucro em vez de receita)
    const currentProfit = data.totalProfit || 0;
    const currentDays = Math.max(currentDay, 1); // Evitar divisão por zero
    const currentDailyAverage = currentProfit / currentDays;
    
    // Calcular projeção considerando diminuição nos últimos 10 dias
    let projectedProfit = currentProfit;
    
    if (daysRemaining > 0) {
        const last10DaysStart = daysInMonth - 9; // Últimos 10 dias do mês
        
        if (currentDay < last10DaysStart) {
            // Ainda não chegou nos últimos 10 dias
            const normalDays = last10DaysStart - currentDay;
            const last10Days = Math.min(daysRemaining, 10);
            
            // Projeção normal + projeção com diminuição
            projectedProfit += (currentDailyAverage * normalDays);
            projectedProfit += (currentDailyAverage * last10Days * 0.75); // 25% de diminuição média
        } else {
            // Já está nos últimos 10 dias
            const remainingLast10Days = Math.min(daysRemaining, daysInMonth - currentDay + 1);
            projectedProfit += (currentDailyAverage * remainingLast10Days * 0.75);
        }
    }
    
    // Atualizar display da projeção
    const projectionElement = document.getElementById('monthlyProjection');
    if (projectionElement) {
        projectionElement.textContent = `R$ ${projectedProfit.toFixed(2).replace('.', ',')}`;
    }
    
    // Calcular e atualizar dias restantes
    const daysRemainingElement = document.getElementById('daysRemaining');
    if (daysRemainingElement) {
        daysRemainingElement.textContent = `${daysRemaining} dias`;
    }
    
    // Atualizar média diária necessária para atingir a meta
    const monthlyGoal = parseFloat(document.getElementById('monthlyGoal')?.value || 0);
    if (monthlyGoal > 0) {
        const remainingToGoal = monthlyGoal - currentProfit;
        const dailyNeeded = remainingToGoal / daysRemaining;
        
        const dailyNeededElement = document.getElementById('dailyNeeded');
        if (dailyNeededElement) {
            dailyNeededElement.textContent = `R$ ${dailyNeeded.toFixed(2).replace('.', ',')}`;
        }
    }
    
    return projectedProfit;
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
            
            // Atualizar histórico se estiver na aba de histórico
            const activeTab = document.querySelector('.tab-btn.active[data-tab]');
            if (activeTab && activeTab.dataset.tab === 'history') {
                loadFinancialHistory();
            }
        } else {
            const error = await response.json();
            
            // Se já existe uma entrada para esta data, oferecer opção de atualizar
            if (error.error === 'Já existe uma entrada para esta data' && error.existingEntry) {
                const shouldUpdate = confirm(`Já existe uma entrada para hoje. Deseja atualizar a entrada existente?\n\nEntrada atual:\n- Faturamento: R$ ${error.existingEntry.grossRevenue.toFixed(2)}\n- Custo com Chip: R$ ${error.existingEntry.chipCost.toFixed(2)}\n- Custo Adicional: R$ ${error.existingEntry.additionalCost.toFixed(2)}\n- Custo com Ads: R$ ${error.existingEntry.adsCost.toFixed(2)}`);
                
                if (shouldUpdate) {
                    await updateExistingQuickEntry(error.existingEntry.id);
                }
            } else {
                showNotification(error.error, 'error');
            }
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
            
            // Atualizar histórico se estiver na aba de histórico
            const activeTab = document.querySelector('.tab-btn.active[data-tab]');
            if (activeTab && activeTab.dataset.tab === 'history') {
                loadFinancialHistory();
            }
        } else {
            const error = await response.json();
            
            // Se já existe uma entrada para esta data, oferecer opção de atualizar
            if (error.error === 'Já existe uma entrada para esta data' && error.existingEntry) {
                const shouldUpdate = confirm(`Já existe uma entrada para esta data. Deseja atualizar a entrada existente?\n\nEntrada atual:\n- Faturamento: R$ ${error.existingEntry.grossRevenue.toFixed(2)}\n- Custo com Chip: R$ ${error.existingEntry.chipCost.toFixed(2)}\n- Custo Adicional: R$ ${error.existingEntry.additionalCost.toFixed(2)}\n- Custo com Ads: R$ ${error.existingEntry.adsCost.toFixed(2)}`);
                
                if (shouldUpdate) {
                    await updateExistingEntry(error.existingEntry.id);
                }
            } else {
                showNotification(error.error, 'error');
            }
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
        const progress = (data.totalProfit / data.monthlyGoal) * 100;
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
    
    // Atualizar lucro total
    const totalProfitElement = document.getElementById('totalProfit');
    if (totalProfitElement) {
        totalProfitElement.textContent = `R$ ${(data.totalProfit || 0).toFixed(2).replace('.', ',')}`;
    }
    
    // Atualizar lucro de hoje
    const todayProfitElement = document.getElementById('todayProfit');
    if (todayProfitElement && data.entries && data.entries.length > 0) {
        const today = new Date();
        const todayEntry = data.entries.find(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.toDateString() === today.toDateString();
        });
        
        const todayProfit = todayEntry ? todayEntry.netProfit : 0;
        todayProfitElement.textContent = `R$ ${todayProfit.toFixed(2).replace('.', ',')}`;
    }
    
    // Atualizar gráfico de progresso da meta
    updateGoalProgressChart(data);
    
    // Atualizar tendências
    updateTrends(data);
}

// Atualizar gráfico de progresso da meta
function updateGoalProgressChart(data) {
    const canvas = document.getElementById('goalProgressChart');
    const progressText = document.getElementById('progressText');
    
    if (!canvas) return;
    
    // Calcular progresso
    const progress = data.monthlyGoal > 0 ? (data.totalProfit / data.monthlyGoal) * 100 : 0;
    const progressPercent = Math.min(progress, 100);
    
    // Atualizar texto
    if (progressText) {
        progressText.textContent = `${progressPercent.toFixed(1)}% da meta atingida`;
    }
    
    // Destruir gráfico existente se houver
    if (window.goalProgressChart && typeof window.goalProgressChart.destroy === 'function') {
        window.goalProgressChart.destroy();
    }
    
    // Criar dados para o gráfico
    const chartData = {
        labels: ['Meta', 'Atual'],
        datasets: [{
            data: [data.monthlyGoal || 0, data.totalProfit || 0],
            backgroundColor: [
                'rgba(59, 130, 246, 0.2)', // Azul claro para meta
                'rgba(34, 197, 94, 0.8)'   // Verde para atual
            ],
            borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(34, 197, 94, 1)'
            ],
            borderWidth: 2
        }]
    };
    
    // Configurações do gráfico
    const config = {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: R$ ${context.parsed.toFixed(2)}`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    };
    
    // Criar gráfico
    window.goalProgressChart = new Chart(canvas, config);
}

// Atualizar tendências
function updateTrends(data) {
    // Crescimento
    const growthRate = document.getElementById('growthRate');
    if (growthRate) {
        // Calcular crescimento real baseado nos dados
        if (data.entries && data.entries.length > 1) {
            const sortedEntries = data.entries.sort((a, b) => new Date(a.date) - new Date(b.date));
            const firstHalf = sortedEntries.slice(0, Math.ceil(sortedEntries.length / 2));
            const secondHalf = sortedEntries.slice(Math.ceil(sortedEntries.length / 2));
            
            const firstHalfTotal = firstHalf.reduce((sum, entry) => sum + entry.netProfit, 0);
            const secondHalfTotal = secondHalf.reduce((sum, entry) => sum + entry.netProfit, 0);
            
            if (firstHalfTotal > 0) {
                const growth = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
                growthRate.textContent = `${growth >= 0 ? '+' : ''}${growth.toFixed(0)}%`;
            } else {
                growthRate.textContent = '0%';
            }
        } else {
            growthRate.textContent = '0%';
        }
    }
    
    // Frequência
    const frequencyRate = document.getElementById('frequencyRate');
    if (frequencyRate) {
        const today = new Date();
        const currentDay = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const frequency = data.entries ? (data.entries.length / Math.min(currentDay, daysInMonth)) * 100 : 0;
        frequencyRate.textContent = `${Math.min(frequency, 100).toFixed(0)}%`;
    }
    
    // Eficiência
    const efficiencyRate = document.getElementById('efficiencyRate');
    if (efficiencyRate && data.monthlyGoal > 0) {
        const efficiency = (data.totalProfit / data.monthlyGoal) * 100;
        efficiencyRate.textContent = `${Math.min(efficiency, 100).toFixed(0)}%`;
    }
    
    // Projeção
    const projectionRate = document.getElementById('projectionRate');
    if (projectionRate) {
        if (data.entries && data.entries.length > 0) {
            const today = new Date();
            const currentDay = today.getDate();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const remainingDays = daysInMonth - currentDay;
            
            if (currentDay > 0) {
                const dailyAverage = data.totalProfit / currentDay;
                const projectedTotal = data.totalProfit + (dailyAverage * remainingDays);
                const projection = data.monthlyGoal > 0 ? ((projectedTotal - data.monthlyGoal) / data.monthlyGoal) * 100 : 0;
                projectionRate.textContent = `${projection >= 0 ? '+' : ''}${projection.toFixed(0)}%`;
            } else {
                projectionRate.textContent = '0%';
            }
        } else {
            projectionRate.textContent = '0%';
        }
    }
}

// Salvar meta mensal
async function saveMonthlyGoal() {
    console.log('🎯 [FRONTEND-META] Iniciando salvamento de meta');
    
    const goal = parseFloat(document.getElementById('monthlyGoal').value);
    const goalType = document.getElementById('goalType')?.value;
    const goalDeadline = document.getElementById('goalDeadline')?.value;
    const goalPriority = document.getElementById('goalPriority')?.value;
    const goalDescription = document.getElementById('goalDescription')?.value;
    
    console.log('📝 [FRONTEND-META] Valores capturados:', {
        goal,
        goalType,
        goalDeadline,
        goalPriority,
        goalDescription
    });
    
    if (isNaN(goal) || goal < 0) {
        console.log('❌ [FRONTEND-META] Meta inválida:', goal);
        showNotification('Meta deve ser um número positivo', 'error');
        return;
    }
    
    const deadlineDate = goalDeadline || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();
    
    console.log('📅 [FRONTEND-META] Data limite calculada:', deadlineDate);
    
    const requestBody = { 
        monthlyGoal: goal,
        deadlineDate: deadlineDate
    };
    
    console.log('📤 [FRONTEND-META] Dados a serem enviados:', requestBody);
    
    try {
        console.log('🌐 [FRONTEND-META] Enviando requisição para:', `${API_BASE_URL}/financial/goal`);
        
        const response = await fetch(`${API_BASE_URL}/financial/goal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 [FRONTEND-META] Resposta recebida - Status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ [FRONTEND-META] Meta salva com sucesso:', result);
            showNotification('Meta salva com sucesso!', 'success');
            
            console.log('🔄 [FRONTEND-META] Iniciando sincronização de dados');
            // Sincronizar dados em todas as abas
            await syncAllFinancialData();
            console.log('✅ [FRONTEND-META] Sincronização concluída');
        } else {
            const error = await response.json();
            console.log('❌ [FRONTEND-META] Erro na resposta:', error);
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('❌ [FRONTEND-META] Erro ao salvar meta:', error);
        showNotification('Erro ao salvar meta', 'error');
    }
}

// Função para sincronizar todos os dados financeiros entre abas
async function syncAllFinancialData() {
    console.log('🔄 [FRONTEND-SYNC] Iniciando sincronização de dados financeiros');
    
    try {
        console.log('🌐 [FRONTEND-SYNC] Buscando dados do resumo financeiro');
        const response = await fetch(`${API_BASE_URL}/financial/summary`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('📥 [FRONTEND-SYNC] Resposta recebida - Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 [FRONTEND-SYNC] Dados recebidos:', {
                monthlyGoal: data.monthlyGoal,
                totalProfit: data.totalProfit,
                totalRevenue: data.totalRevenue,
                totalExpenses: data.totalExpenses,
                daysRemaining: data.daysRemaining,
                entriesCount: data.entries?.length || 0
            });
            
            // Atualizar todas as abas com os dados sincronizados
            console.log('🔄 [FRONTEND-SYNC] Atualizando todas as abas');
            updateAllTabsWithData(data);
            
            // Calcular projeções e métricas
            console.log('📈 [FRONTEND-SYNC] Calculando projeções e métricas');
            calculateAllMetrics(data);
            
            console.log('✅ [FRONTEND-SYNC] Sincronização concluída com sucesso');
        } else {
            console.error('❌ [FRONTEND-SYNC] Erro ao carregar dados para sincronização - Status:', response.status);
            const error = await response.json();
            console.error('❌ [FRONTEND-SYNC] Detalhes do erro:', error);
        }
    } catch (error) {
        console.error('❌ [FRONTEND-SYNC] Erro na sincronização:', error);
    }
}

// Atualizar todas as abas com dados sincronizados
function updateAllTabsWithData(data) {
    console.log('🔄 [FRONTEND-TABS] Iniciando atualização de todas as abas');
    
    // Aba Configurar Metas
    console.log('⚙️ [FRONTEND-TABS] Atualizando aba Configurar Metas');
    updateConfigTab(data);
    
    // Aba Resumo Geral
    console.log('📊 [FRONTEND-TABS] Atualizando aba Resumo Geral');
    updateSummaryTab(data);
    
    // Aba Dashboard Financeiro
    console.log('📈 [FRONTEND-TABS] Atualizando aba Dashboard Financeiro');
    updateDashboardTab(data);
    
    // Aba Histórico
    console.log('📝 [FRONTEND-TABS] Atualizando aba Histórico');
    updateHistoryTab(data);
    
    console.log('✅ [FRONTEND-TABS] Atualização de todas as abas concluída');
}

// Atualizar aba de configuração
function updateConfigTab(data) {
    console.log('⚙️ [FRONTEND-CONFIG] Iniciando atualização da aba configuração');
    console.log('⚙️ [FRONTEND-CONFIG] Dados recebidos:', {
        monthlyGoal: data.monthlyGoal,
        deadlineDate: data.deadlineDate
    });
    
    const monthlyGoalInput = document.getElementById('monthlyGoal');
    if (monthlyGoalInput) {
        const monthlyGoalValue = data.monthlyGoal || 0;
        monthlyGoalInput.value = monthlyGoalValue;
        console.log('💰 [FRONTEND-CONFIG] Meta mensal atualizada no input:', monthlyGoalValue);
    } else {
        console.log('⚠️ [FRONTEND-CONFIG] Elemento monthlyGoal não encontrado');
    }
    
    // Carregar dados salvos da meta se existirem
    const goalDeadline = document.getElementById('goalDeadline');
    if (goalDeadline && data.deadlineDate) {
        const deadlineDate = new Date(data.deadlineDate).toISOString().split('T')[0];
        goalDeadline.value = deadlineDate;
        console.log('📅 [FRONTEND-CONFIG] Data limite atualizada:', deadlineDate);
    } else {
        console.log('⚠️ [FRONTEND-CONFIG] Elemento goalDeadline não encontrado ou data não disponível');
    }
    
    console.log('✅ [FRONTEND-CONFIG] Atualização da aba configuração concluída');
}

// Atualizar aba de resumo geral
function updateSummaryTab(data) {
    console.log('📊 [FRONTEND-RESUMO] Iniciando atualização do resumo geral');
    console.log('📊 [FRONTEND-RESUMO] Dados recebidos:', {
        monthlyGoal: data.monthlyGoal,
        totalProfit: data.totalProfit,
        totalRevenue: data.totalRevenue,
        totalExpenses: data.totalExpenses,
        daysRemaining: data.daysRemaining,
        entriesCount: data.entries?.length || 0
    });
    
    // Meta mensal
    const monthlyGoalDisplay = document.getElementById('monthlyGoalDisplay');
    if (monthlyGoalDisplay) {
        const monthlyGoalValue = data.monthlyGoal || 0;
        monthlyGoalDisplay.textContent = `R$ ${monthlyGoalValue.toFixed(2).replace('.', ',')}`;
        console.log('💰 [FRONTEND-RESUMO] Meta mensal atualizada:', monthlyGoalValue);
    } else {
        console.log('⚠️ [FRONTEND-RESUMO] Elemento monthlyGoalDisplay não encontrado');
    }
    
    // Progresso da meta
    const goalProgressDisplay = document.getElementById('goalProgressDisplay');
    if (goalProgressDisplay && data.monthlyGoal > 0) {
        const progress = (data.totalProfit / data.monthlyGoal) * 100;
        const progressPercent = Math.min(progress, 100);
        goalProgressDisplay.textContent = `${progressPercent.toFixed(1)}%`;
        
        console.log('📈 [FRONTEND-RESUMO] Progresso calculado:', {
            totalProfit: data.totalProfit,
            monthlyGoal: data.monthlyGoal,
            progress: progress,
            progressPercent: progressPercent
        });
        
        // Atualizar anel de progresso
        console.log('🔄 [FRONTEND-RESUMO] Atualizando anel de progresso');
        updateProgressRing(progress);
    } else {
        console.log('⚠️ [FRONTEND-RESUMO] Elemento goalProgressDisplay não encontrado ou meta zero');
    }
    
    // Dias restantes
    const daysRemaining = document.getElementById('daysRemaining');
    if (daysRemaining) {
        if (data.daysRemaining !== undefined) {
            // Usar dados do backend se disponíveis
            daysRemaining.textContent = `${data.daysRemaining} dias`;
            console.log('📅 [FRONTEND-RESUMO] Dias restantes (backend):', data.daysRemaining);
        } else {
            // Fallback para cálculo local
            const today = new Date();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const remaining = daysInMonth - today.getDate();
            daysRemaining.textContent = `${remaining} dias`;
            console.log('📅 [FRONTEND-RESUMO] Dias restantes (cálculo local):', {
                today: today.getDate(),
                daysInMonth,
                remaining
            });
        }
    } else {
        console.log('⚠️ [FRONTEND-RESUMO] Elemento daysRemaining não encontrado');
    }
    
    // Projeção mensal
    const monthlyProjection = document.getElementById('monthlyProjection');
    if (monthlyProjection) {
        console.log('📊 [FRONTEND-RESUMO] Calculando projeção mensal');
        const projection = calculateMonthlyProjection(data);
        monthlyProjection.textContent = `R$ ${projection.toFixed(2).replace('.', ',')}`;
        console.log('📈 [FRONTEND-RESUMO] Projeção mensal calculada:', projection);
    } else {
        console.log('⚠️ [FRONTEND-RESUMO] Elemento monthlyProjection não encontrado');
    }
    
    console.log('✅ [FRONTEND-RESUMO] Atualização do resumo geral concluída');
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
        const remainingToGoal = data.monthlyGoal - data.totalProfit;
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
        const progress = (data.totalProfit / data.monthlyGoal) * 100;
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
        const efficiency = (data.totalProfit / data.monthlyGoal) * 100;
        efficiencyRate.textContent = `${Math.min(efficiency, 100).toFixed(0)}%`;
    }
    
    // Projeção baseada em dados reais
    const projectionRate = document.getElementById('projectionRate');
    if (projectionRate) {
        const projection = calculateMonthlyProjection(data);
        const currentProfit = data.totalProfit || 0;
        const growth = currentProfit > 0 ? ((projection - currentProfit) / currentProfit) * 100 : 0;
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
    const historyTableBody = document.getElementById('historyTableBody');
    if (!historyTableBody) return;

    historyTableBody.innerHTML = '';

    if (entries.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #9ca3af;">
                    <i class="fas fa-history" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5; display: block;"></i>
                    <p>Nenhum histórico financeiro encontrado</p>
                </td>
            </tr>
        `;
        return;
    }

    entries.forEach(entry => {
        const row = document.createElement('tr');
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString('pt-BR');
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>R$ ${entry.grossRevenue.toFixed(2)}</td>
            <td>R$ ${entry.totalExpenses.toFixed(2)}</td>
            <td>R$ ${entry.netProfit.toFixed(2)}</td>
            <td>${entry.notes || '-'}</td>
            <td>
                <button class="btn btn-small btn-outline" onclick="deleteEntry('${entry.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        historyTableBody.appendChild(row);
    });
}

// Função para atualizar entrada rápida existente
async function updateExistingQuickEntry(entryId) {
    const grossRevenue = parseFloat(document.getElementById('quickGrossRevenue').value) || 0;
    const chipCost = parseFloat(document.getElementById('quickChipCost').value) || 0;
    const additionalCost = parseFloat(document.getElementById('quickAdditionalCost').value) || 0;
    const adsCost = parseFloat(document.getElementById('quickAdsCost').value) || 0;
    const notes = document.getElementById('quickNotes').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/financial/entry/${entryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                grossRevenue,
                chipCost,
                additionalCost,
                adsCost,
                notes
            })
        });
        
        if (response.ok) {
            showNotification('Entrada rápida atualizada com sucesso!', 'success');
            // Limpar campos
            document.getElementById('quickGrossRevenue').value = '';
            document.getElementById('quickChipCost').value = '';
            document.getElementById('quickAdditionalCost').value = '';
            document.getElementById('quickAdsCost').value = '';
            document.getElementById('quickNotes').value = '';
            
            // Sincronizar todas as abas
            await syncAllFinancialData();
            
            // Atualizar histórico se estiver na aba de histórico
            const activeTab = document.querySelector('.tab-btn.active[data-tab]');
            if (activeTab && activeTab.dataset.tab === 'history') {
                loadFinancialHistory();
            }
        } else {
            const error = await response.json();
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar entrada rápida:', error);
        showNotification('Erro ao atualizar entrada rápida', 'error');
    }
}

// Função para atualizar entrada existente
async function updateExistingEntry(entryId) {
    const grossRevenue = parseFloat(document.getElementById('manualGrossRevenue').value) || 0;
    const chipCost = parseFloat(document.getElementById('manualChipCost').value) || 0;
    const additionalCost = parseFloat(document.getElementById('manualAdditionalCost').value) || 0;
    const adsCost = parseFloat(document.getElementById('manualAdsCost').value) || 0;
    const notes = document.getElementById('manualNotes').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/financial/entry/${entryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                grossRevenue,
                chipCost,
                additionalCost,
                adsCost,
                notes
            })
        });
        
        if (response.ok) {
            showNotification('Entrada atualizada com sucesso!', 'success');
            // Limpar campos
            document.getElementById('manualDate').value = '';
            document.getElementById('manualGrossRevenue').value = '';
            document.getElementById('manualChipCost').value = '';
            document.getElementById('manualAdditionalCost').value = '';
            document.getElementById('manualAdsCost').value = '';
            document.getElementById('manualNotes').value = '';
            
            // Sincronizar todas as abas
            await syncAllFinancialData();
            
            // Atualizar histórico se estiver na aba de histórico
            const activeTab = document.querySelector('.tab-btn.active[data-tab]');
            if (activeTab && activeTab.dataset.tab === 'history') {
                loadFinancialHistory();
            }
        } else {
            const error = await response.json();
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar entrada:', error);
        showNotification('Erro ao atualizar entrada', 'error');
    }
}

// Função para deletar entrada
async function deleteEntry(entryId) {
    if (!confirm('Tem certeza que deseja deletar esta entrada?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/financial/entry/${entryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showNotification('Entrada deletada com sucesso!', 'success');
            // Recarregar histórico
            loadFinancialHistory();
            // Sincronizar outras abas
            await syncAllFinancialData();
        } else {
            const error = await response.json();
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar entrada:', error);
        showNotification('Erro ao deletar entrada', 'error');
    }
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
            const goalDeadline = document.getElementById('goalDeadline');
            
            // Verificar se os elementos existem antes de acessar
            if (monthlyGoalInput) monthlyGoalInput.value = data.monthlyGoal || 0;
            if (goalDeadline && data.deadlineDate) {
                goalDeadline.value = new Date(data.deadlineDate).toISOString().split('T')[0];
            }
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

// ===== SISTEMA DE HISTÓRICO DE MODIFICAÇÕES =====

// Carregar histórico de modificações
async function loadModificationsHistory(page = 1, type = 'all', action = 'all') {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            type: type,
            action: action
        });
        
        const response = await fetch(`${API_BASE_URL}/financial/modifications?${params}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderModificationsList(data.modifications);
            renderModificationsPagination(data.pagination);
        } else {
            console.error('Erro ao carregar histórico de modificações');
        }
    } catch (error) {
        console.error('Erro ao carregar histórico de modificações:', error);
    }
}

// Renderizar lista de modificações
function renderModificationsList(modifications) {
    const modificationsList = document.getElementById('modificationsList');
    if (!modificationsList) return;
    
    if (modifications.length === 0) {
        modificationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-edit" style="font-size: 48px; color: #9ca3af; margin-bottom: 16px;"></i>
                <h4>Nenhuma modificação encontrada</h4>
                <p>As modificações aparecerão aqui conforme você adicionar dados financeiros ou configurar metas.</p>
            </div>
        `;
        return;
    }
    
    modificationsList.innerHTML = modifications.map(modification => `
        <div class="modification-item">
            <div class="modification-header">
                <div>
                    <div class="modification-title">${modification.description}</div>
                    <span class="modification-type ${modification.type}">${getModificationTypeLabel(modification.type)}</span>
                </div>
                <div class="modification-time">${formatDate(modification.createdAt)}</div>
            </div>
            
            <div class="modification-description">
                ${getModificationDetails(modification)}
            </div>
            
            ${modification.entryData ? `
                <div class="modification-details">
                    <div class="modification-detail">
                        <h5>Receita Bruta</h5>
                        <p>R$ ${(modification.entryData.grossRevenue || 0).toFixed(2)}</p>
                    </div>
                    <div class="modification-detail">
                        <h5>Despesas Totais</h5>
                        <p>R$ ${(modification.entryData.totalExpenses || 0).toFixed(2)}</p>
                    </div>
                    <div class="modification-detail">
                        <h5>Lucro Líquido</h5>
                        <p>R$ ${(modification.entryData.netProfit || 0).toFixed(2)}</p>
                    </div>
                </div>
            ` : ''}
            
            ${modification.goalData ? `
                <div class="modification-details">
                    <div class="modification-detail">
                        <h5>Meta Definida</h5>
                        <p>R$ ${(modification.goalData.targetAmount || 0).toFixed(2)}</p>
                    </div>
                    <div class="modification-detail">
                        <h5>Data Limite</h5>
                        <p>${modification.goalData.deadlineDate ? formatDate(modification.goalData.deadlineDate) : 'Não definida'}</p>
                    </div>
                </div>
            ` : ''}
            
            <div class="modification-values">
                <div class="value-group">
                    <div class="value-label">Antes</div>
                    <div class="value-amount">R$ ${modification.previousValues.totalProfit.toFixed(2)}</div>
                </div>
                <div class="value-group">
                    <div class="value-label">Depois</div>
                    <div class="value-amount">R$ ${modification.newValues.totalProfit.toFixed(2)}</div>
                </div>
                <div class="value-group">
                    <div class="value-label">Mudança</div>
                    <div class="value-change ${modification.newValues.totalProfit >= modification.previousValues.totalProfit ? '' : 'negative'}">
                        ${modification.newValues.totalProfit >= modification.previousValues.totalProfit ? '+' : ''}R$ ${(modification.newValues.totalProfit - modification.previousValues.totalProfit).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Renderizar paginação das modificações
function renderModificationsPagination(pagination) {
    const paginationContainer = document.getElementById('modificationsPagination');
    if (!paginationContainer) return;
    
    if (pagination.pages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Botão anterior
    if (pagination.page > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="loadModificationsHistory(${pagination.page - 1})">Anterior</button>`;
    }
    
    // Páginas
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="pagination-btn ${i === pagination.page ? 'active' : ''}" onclick="loadModificationsHistory(${i})">${i}</button>`;
    }
    
    // Botão próximo
    if (pagination.page < pagination.pages) {
        paginationHTML += `<button class="pagination-btn" onclick="loadModificationsHistory(${pagination.page + 1})">Próximo</button>`;
    }
    
    // Informações
    paginationHTML += `<div class="pagination-info">Página ${pagination.page} de ${pagination.pages} (${pagination.total} itens)</div>`;
    
    paginationContainer.innerHTML = paginationHTML;
}

// Obter label do tipo de modificação
function getModificationTypeLabel(type) {
    const labels = {
        'entry': 'Entrada',
        'goal_created': 'Meta Criada',
        'goal_update': 'Meta Atualizada',
        'goal_deleted': 'Meta Deletada'
    };
    return labels[type] || type;
}

// Obter detalhes da modificação
function getModificationDetails(modification) {
    if (modification.type === 'entry') {
        return `Adicionada entrada financeira para ${formatDate(modification.entryData.date)}`;
    } else if (modification.type.startsWith('goal_')) {
        return `Meta ${modification.action === 'create' ? 'criada' : modification.action === 'update' ? 'atualizada' : 'deletada'} para o período`;
    }
    return '';
}

// Inicializar filtros de modificações
function initializeModificationFilters() {
    const applyFiltersBtn = document.getElementById('applyModificationFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const type = document.getElementById('modificationTypeFilter').value;
            const action = document.getElementById('modificationActionFilter').value;
            loadModificationsHistory(1, type, action);
        });
    }
} 