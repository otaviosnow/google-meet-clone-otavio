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
    
    // Financial System
    if (saveGoalBtn) saveGoalBtn.addEventListener('click', saveMonthlyGoal);
    if (addEntryBtn) addEntryBtn.addEventListener('click', addDailyEntry);
    
    // Avatar System
    initializeAvatar();
    
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
        const isEnded = meeting.status === 'ended' || !meeting.isActive;
        const statusText = isEnded ? 'Encerrado' : 'Ativo';
        const statusIcon = isEnded ? 'fa-times' : 'fa-check';
        const statusClass = isEnded ? 'ended' : 'active';
        
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
            hideModal(createMeetingModal);
            createMeetingForm.reset();
            loadMeetings();
            
            // Mostrar o link da reunião
            showNotification('Reunião criada com sucesso! Link copiado para área de transferência.', 'success');
            
            // Copiar link para área de transferência
            navigator.clipboard.writeText(meetLink).then(() => {
                console.log('Link da reunião copiado:', meetLink);
            });
            
            // Abrir link em nova aba
            window.open(meetLink, '_blank');
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
    
    // Carregar dados financeiros
    loadFinancialData();
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
        }
    } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
    }
}

// Atualizar display financeiro
function updateFinancialDisplay(data) {
    if (monthlyGoal) monthlyGoal.value = data.monthlyGoal || 0;
    if (totalRevenue) totalRevenue.textContent = `R$ ${data.totalRevenue.toFixed(2)}`;
    if (totalExpenses) totalExpenses.textContent = `R$ ${data.totalExpenses.toFixed(2)}`;
    if (totalProfit) totalProfit.textContent = `R$ ${data.totalProfit.toFixed(2)}`;
    if (goalProgress) goalProgress.textContent = `${data.goalProgress}%`;
    
    // Definir data atual como padrão
    if (entryDate) {
        const today = new Date().toISOString().split('T')[0];
        entryDate.value = today;
    }
}

// Salvar meta mensal
async function saveMonthlyGoal() {
    const goal = parseFloat(monthlyGoal.value);
    
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
            body: JSON.stringify({ monthlyGoal: goal })
        });
        
        if (response.ok) {
            showNotification('Meta salva com sucesso!', 'success');
            loadFinancialData();
        } else {
            const error = await response.json();
            showNotification(error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar meta:', error);
        showNotification('Erro ao salvar meta', 'error');
    }
}

// Adicionar entrada diária
async function addDailyEntry() {
    const date = entryDate.value;
    const revenue = parseFloat(entryRevenue.value) || 0;
    const expenses = parseFloat(entryExpenses.value) || 0;
    
    if (!date) {
        showNotification('Data é obrigatória', 'error');
        return;
    }
    
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
            body: JSON.stringify({ date, revenue, expenses })
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
function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB
            showNotification('Arquivo muito grande. Máximo 5MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            avatarPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        showNotification('Foto de perfil atualizada!', 'success');
    }
} 