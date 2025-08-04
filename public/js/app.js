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

const heroRegisterBtn = document.getElementById('heroRegisterBtn');
const heroDemoBtn = document.getElementById('heroDemoBtn');

// Dashboard elements
const menuItems = document.querySelectorAll('.menu-item');
const tabContents = document.querySelectorAll('.tab-content');

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

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Google Meet Fake SaaS');
    
    // Verificar se já está logado
    if (authToken) {
        checkAuth();
    }
    
    // Inicializar event listeners
    initializeEventListeners();
});

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
    heroRegisterBtn.addEventListener('click', () => showAuthModal('register'));
    heroDemoBtn.addEventListener('click', () => window.location.href = '/meet/demo');
    
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
    
    const email = document.getElementById('forgotEmail').value;
    
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
            }
            hideAuthModal();
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro na recuperação de senha:', error);
        showNotification('Erro ao solicitar recuperação de senha', 'error');
    }
}

// Função para redefinir senha
async function handleResetPassword(e) {
    e.preventDefault();
    
    const token = document.getElementById('resetToken').value;
    const password = document.getElementById('resetPassword').value;
    const passwordConfirm = document.getElementById('resetPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        showNotification('As senhas não coincidem', 'error');
        return;
    }
    
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
            hideAuthModal();
            showAuthModal('login');
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        showNotification('Erro ao redefinir senha', 'error');
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

function switchTab(tabName) {
    // Atualizar menu
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });
    
    // Atualizar conteúdo
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}Tab`) {
            content.classList.add('active');
        }
    });
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
    
    if (videos.length === 0) {
        videosList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #5f6368;">
                <i class="fas fa-video" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>Nenhum vídeo encontrado</p>
                <p>Adicione seu primeiro vídeo para começar</p>
            </div>
        `;
        return;
    }
    
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <i class="fas fa-play" style="font-size: 32px;"></i>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-description">${video.description || 'Sem descrição'}</p>
                <div class="video-meta">
                    <span>${video.type}</span>
                    <span>${video.views} visualizações</span>
                </div>
                <div class="video-actions">
                    <button class="btn btn-outline btn-small" onclick="copyVideoUrl('${video.url}')">
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
        videosList.appendChild(videoCard);
    });
}

async function handleAddVideo(e) {
    e.preventDefault();
    
    const formData = new FormData(addVideoForm);
    const data = {
        title: formData.get('title') || document.getElementById('videoTitle').value,
        description: formData.get('description') || document.getElementById('videoDescription').value,
        type: formData.get('type') || document.getElementById('videoType').value
    };
    
    // Adicionar arquivo se for upload
    if (data.type === 'upload') {
        const fileInput = document.getElementById('videoFile');
        if (fileInput.files.length > 0) {
            formData.append('video', fileInput.files[0]);
        }
    } else if (data.type === 'drive' || data.type === 'url') {
        data.url = formData.get('url') || document.getElementById('videoUrl').value;
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
            const data = await response.json();
            renderMeetings(data.meetings);
            loadVideoOptions();
        }
    } catch (error) {
        console.error('Erro ao carregar reuniões:', error);
    }
}

function renderMeetings(meetings) {
    meetingsList.innerHTML = '';
    
    if (meetings.length === 0) {
        meetingsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #5f6368;">
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
        meetingCard.innerHTML = `
            <h3 class="meeting-title">${meeting.title}</h3>
            <p class="meeting-description">${meeting.description || 'Sem descrição'}</p>
            <div class="meeting-meta">
                <span>${meeting.isActive ? 'Ativa' : 'Inativa'}</span>
                <span>${meeting.views} visualizações</span>
            </div>
            <div class="meeting-link">
                ${window.location.origin}/meet/${meeting.meetingId}
            </div>
            <div class="meeting-actions">
                <button class="btn btn-primary btn-small" onclick="copyMeetingLink('${meeting.meetingId}')">
                    <i class="fas fa-link"></i>
                    Copiar Link
                </button>
                <button class="btn btn-outline btn-small" onclick="deleteMeeting('${meeting._id}')">
                    <i class="fas fa-trash"></i>
                    Deletar
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
            meetingVideo.innerHTML = '<option value="">Selecione um vídeo</option>';
            
            data.videos.forEach(video => {
                const option = document.createElement('option');
                option.value = video._id;
                option.textContent = video.title;
                meetingVideo.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar opções de vídeo:', error);
    }
}

async function handleCreateMeeting(e) {
    e.preventDefault();
    
    const formData = new FormData(createMeetingForm);
    const data = {
        title: formData.get('title') || document.getElementById('meetingTitle').value,
        description: formData.get('description') || document.getElementById('meetingDescription').value,
        videoId: formData.get('videoId') || document.getElementById('meetingVideo').value,
        maxParticipants: formData.get('maxParticipants') || document.getElementById('meetingMaxParticipants').value,
        isPublic: formData.get('isPublic') || document.getElementById('meetingPublic').checked
    };
    
    try {
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
            hideModal(createMeetingModal);
            createMeetingForm.reset();
            loadMeetings();
            showNotification('Reunião criada com sucesso!', 'success');
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao criar reunião:', error);
        showNotification('Erro ao criar reunião', 'error');
    }
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

function copyMeetingLink(meetingId) {
    const link = `${window.location.origin}/meet/${meetingId}`;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Link copiado para a área de transferência!', 'success');
    });
}

// Funções de perfil
async function loadUserData() {
    if (!currentUser) return;
    
    userName.textContent = currentUser.name;
    profileName.value = currentUser.name;
    profileEmail.value = currentUser.email;
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