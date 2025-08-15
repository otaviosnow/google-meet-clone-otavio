// Configurações da API
const API_BASE_URL = window.location.origin + '/api';

// Estado da aplicação
let currentAdmin = null;
let adminToken = localStorage.getItem('adminToken');
let allUsers = [];
let filteredUsers = [];

// Elementos DOM
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const logoutBtn = document.getElementById('logoutBtn');
const adminName = document.getElementById('adminName');

// Dashboard elements
const totalUsers = document.getElementById('totalUsers');
const totalTokens = document.getElementById('totalTokens');
const totalMeetings = document.getElementById('totalMeetings');
const userSearch = document.getElementById('userSearch');
const statusFilter = document.getElementById('statusFilter');
const tokenFilter = document.getElementById('tokenFilter');
const refreshBtn = document.getElementById('refreshBtn');
const usersTableBody = document.getElementById('usersTableBody');
const usersCount = document.getElementById('usersCount');

// Modals
const manageTokensModal = document.getElementById('manageTokensModal');
const deleteUserModal = document.getElementById('deleteUserModal');
const closeTokensModal = document.getElementById('closeTokensModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');

// Token management
const modalUserAvatar = document.getElementById('modalUserAvatar');
const modalUserName = document.getElementById('modalUserName');
const modalUserEmail = document.getElementById('modalUserEmail');
const modalCurrentTokens = document.getElementById('modalCurrentTokens');
const tokenAmount = document.getElementById('tokenAmount');
const addTokensBtn = document.getElementById('addTokensBtn');
const removeTokensBtn = document.getElementById('removeTokensBtn');
const setTokensBtn = document.getElementById('setTokensBtn');

// Delete user
const deleteUserAvatar = document.getElementById('deleteUserAvatar');
const deleteUserName = document.getElementById('deleteUserName');
const deleteUserEmail = document.getElementById('deleteUserEmail');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Notification
const notification = document.getElementById('notification');

// Emails autorizados para admin
const ADMIN_EMAILS = ['tavinmktdigital@gmail.com', 'teste2@gmail.com', 'teste90@gmail.com', 'admin@callx.com'];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Admin Panel');
    
    // Verificar se já está logado como admin
    if (adminToken) {
        checkAdminAuth();
    }
    
    // Inicializar event listeners
    initializeEventListeners();
});

function initializeEventListeners() {
    // Login
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Search and filters
    userSearch.addEventListener('input', filterUsers);
    statusFilter.addEventListener('change', filterUsers);
    tokenFilter.addEventListener('change', filterUsers);
    refreshBtn.addEventListener('click', loadAdminData);
    
    // Modal close buttons
    closeTokensModal.addEventListener('click', () => closeModal(manageTokensModal));
    closeDeleteModal.addEventListener('click', () => closeModal(deleteUserModal));
    
    // Token management
    addTokensBtn.addEventListener('click', () => handleTokenAction('add'));
    removeTokensBtn.addEventListener('click', () => handleTokenAction('remove'));
    setTokensBtn.addEventListener('click', () => handleTokenAction('set'));
    
    // Delete user
    confirmDeleteBtn.addEventListener('click', handleDeleteUser);
    cancelDeleteBtn.addEventListener('click', () => closeModal(deleteUserModal));
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === manageTokensModal) closeModal(manageTokensModal);
        if (e.target === deleteUserModal) closeModal(deleteUserModal);
    });
}

// Autenticação Admin
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = adminEmail.value.trim();
    const password = adminPassword.value;
    
    if (!email || !password) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    // Verificar se o email está autorizado
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        showNotification('Email não autorizado para acesso administrativo', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Verificar se o usuário é admin
            if (!data.user.isAdmin) {
                showNotification('Usuário não possui privilégios administrativos', 'error');
                return;
            }
            
            // Salvar token e dados do admin
            adminToken = data.token;
            currentAdmin = data.user;
            localStorage.setItem('adminToken', adminToken);
            
            showNotification('Login realizado com sucesso!', 'success');
            
            // Mostrar dashboard
            setTimeout(() => {
                showDashboard();
                loadAdminData();
            }, 1000);
            
        } else {
            showNotification(data.error || 'Erro no login', 'error');
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('Erro de conexão', 'error');
    }
}

async function checkAdminAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.user.isAdmin) {
            currentAdmin = data.user;
            showDashboard();
            loadAdminData();
        } else {
            // Token inválido ou usuário não é admin
            localStorage.removeItem('adminToken');
            showLoginScreen();
        }
        
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('adminToken');
        showLoginScreen();
    }
}

function handleLogout() {
    localStorage.removeItem('adminToken');
    adminToken = null;
    currentAdmin = null;
    showLoginScreen();
    showNotification('Logout realizado com sucesso', 'success');
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
    adminLoginForm.reset();
}

function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    adminName.textContent = currentAdmin.name || currentAdmin.email;
}

// Carregar dados do admin
async function loadAdminData() {
    try {
        const [usersResponse, statsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            }),
            fetch(`${API_BASE_URL}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            })
        ]);
        
        if (usersResponse.ok && statsResponse.ok) {
            const usersData = await usersResponse.json();
            const statsData = await statsResponse.json();
            
            allUsers = usersData.users;
            filteredUsers = [...allUsers];
            
            updateAdminStats(statsData.stats);
            renderUsersTable();
            updateUsersCount();
            
        } else {
            showNotification('Erro ao carregar dados', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro de conexão', 'error');
    }
}

function updateAdminStats(stats) {
    totalUsers.textContent = stats.totalUsers || 0;
    totalTokens.textContent = stats.totalTokens || 0;
    totalMeetings.textContent = stats.totalMeetings || 0;
}

function renderUsersTable() {
    usersTableBody.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #6b7280;">
                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        
        const avatar = user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjNmI3MjgwIi8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNmI3MjgwIi8+Cjwvc3ZnPgo=';
        
        const statusClass = user.isAdmin ? 'status-admin' : 
                           user.isBanned ? 'status-banned' : 'status-active';
        const statusText = user.isAdmin ? 'Admin' : 
                          user.isBanned ? 'Banido' : 'Ativo';
        
        const registrationDate = new Date(user.createdAt).toLocaleDateString('pt-BR');
        
        row.innerHTML = `
            <td>
                <div class="user-info">
                    <img src="${avatar}" alt="Avatar" class="user-avatar">
                    <div class="user-details">
                        <h4>${user.name || 'Sem nome'}</h4>
                        <p>ID: ${user._id}</p>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td><strong>${user.visionTokens || 0}</strong></td>
            <td>${user.meetingsCount || 0}</td>
            <td>${registrationDate}</td>
            <td>
                <div class="actions-dropdown">
                    <button class="dropdown-btn" onclick="toggleDropdown(this)">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu">
                        <div class="dropdown-item" onclick="openManageTokens('${user._id}')">
                            <i class="fas fa-key"></i> Gerenciar Tokens
                        </div>
                        <div class="dropdown-item" onclick="toggleBanUser('${user._id}', ${!user.isBanned})">
                            <i class="fas fa-${user.isBanned ? 'user-check' : 'ban'}"></i>
                            ${user.isBanned ? 'Desbanir' : 'Banir'}
                        </div>
                        <div class="dropdown-item danger" onclick="openDeleteUser('${user._id}')">
                            <i class="fas fa-trash"></i> Excluir Conta
                        </div>
                    </div>
                </div>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
}

function updateUsersCount() {
    const count = filteredUsers.length;
    const total = allUsers.length;
    usersCount.textContent = `${count} de ${total} usuários encontrados`;
}

// Filtros e busca
function filterUsers() {
    const searchTerm = userSearch.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    const tokenFilterValue = tokenFilter.value;
    
    filteredUsers = allUsers.filter(user => {
        // Busca por nome ou email
        const matchesSearch = !searchTerm || 
            user.name?.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        
        // Filtro por status
        let matchesStatus = true;
        if (statusFilterValue) {
            if (statusFilterValue === 'active') {
                matchesStatus = !user.isBanned && !user.isAdmin;
            } else if (statusFilterValue === 'banned') {
                matchesStatus = user.isBanned;
            } else if (statusFilterValue === 'admin') {
                matchesStatus = user.isAdmin;
            }
        }
        
        // Filtro por tokens
        let matchesTokens = true;
        if (tokenFilterValue) {
            const tokens = user.visionTokens || 0;
            if (tokenFilterValue === '0') {
                matchesTokens = tokens === 0;
            } else if (tokenFilterValue === '1-10') {
                matchesTokens = tokens >= 1 && tokens <= 10;
            } else if (tokenFilterValue === '11-50') {
                matchesTokens = tokens >= 11 && tokens <= 50;
            } else if (tokenFilterValue === '51+') {
                matchesTokens = tokens >= 51;
            }
        }
        
        return matchesSearch && matchesStatus && matchesTokens;
    });
    
    renderUsersTable();
    updateUsersCount();
}

// Dropdown actions
function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    const allDropdowns = document.querySelectorAll('.dropdown-menu');
    
    // Fechar outros dropdowns
    allDropdowns.forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
    });
    
    dropdown.classList.toggle('show');
}

// Fechar dropdowns quando clicar fora
document.addEventListener('click', (e) => {
    if (!e.target.closest('.actions-dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(d => {
            d.classList.remove('show');
        });
    }
});

// Gerenciar tokens
function openManageTokens(userId) {
    const user = allUsers.find(u => u._id === userId);
    if (!user) return;
    
    const avatar = user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjNmI3MjgwIi8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNmI3MjgwIi8+Cjwvc3ZnPgo=';
    
    modalUserAvatar.src = avatar;
    modalUserName.textContent = user.name || 'Sem nome';
    modalUserEmail.textContent = user.email;
    modalCurrentTokens.textContent = user.visionTokens || 0;
    tokenAmount.value = '';
    
    // Armazenar ID do usuário para uso posterior
    manageTokensModal.dataset.userId = userId;
    
    showModal(manageTokensModal);
}

async function handleTokenAction(action) {
    const userId = manageTokensModal.dataset.userId;
    const amount = parseInt(tokenAmount.value);
    
    if (!userId || isNaN(amount) || amount < 0) {
        showNotification('Quantidade inválida', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/${userId}/tokens`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                action,
                amount
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Tokens ${action === 'add' ? 'adicionados' : action === 'remove' ? 'removidos' : 'definidos'} com sucesso`, 'success');
            
            // Atualizar dados
            await loadAdminData();
            closeModal(manageTokensModal);
            
        } else {
            showNotification(data.error || 'Erro ao gerenciar tokens', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao gerenciar tokens:', error);
        showNotification('Erro de conexão', 'error');
    }
}

// Banir/Desbanir usuário
async function toggleBanUser(userId, ban) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/${userId}/ban`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                isBanned: ban
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Usuário ${ban ? 'banido' : 'desbanido'} com sucesso`, 'success');
            await loadAdminData();
        } else {
            showNotification(data.error || 'Erro ao alterar status do usuário', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        showNotification('Erro de conexão', 'error');
    }
}

// Deletar usuário
function openDeleteUser(userId) {
    const user = allUsers.find(u => u._id === userId);
    if (!user) return;
    
    const avatar = user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjNmI3MjgwIi8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNmI3MjgwIi8+Cjwvc3ZnPgo=';
    
    deleteUserAvatar.src = avatar;
    deleteUserName.textContent = user.name || 'Sem nome';
    deleteUserEmail.textContent = user.email;
    
    // Armazenar ID do usuário para uso posterior
    deleteUserModal.dataset.userId = userId;
    
    showModal(deleteUserModal);
}

async function handleDeleteUser() {
    const userId = deleteUserModal.dataset.userId;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Usuário excluído com sucesso', 'success');
            await loadAdminData();
            closeModal(deleteUserModal);
        } else {
            showNotification(data.error || 'Erro ao excluir usuário', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showNotification('Erro de conexão', 'error');
    }
}

// Utilitários
function showModal(modal) {
    modal.classList.add('show');
}

function closeModal(modal) {
    modal.classList.remove('show');
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}
