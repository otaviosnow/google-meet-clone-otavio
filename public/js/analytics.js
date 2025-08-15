// Analytics Dashboard JavaScript
class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.currentPeriod = 30;
        this.authToken = localStorage.getItem('authToken');
        this.API_BASE_URL = window.location.origin + '/api';
        
        this.init();
    }

    async init() {
        try {
            // Verificar autenticação
            if (!this.authToken) {
                window.location.href = '/';
                return;
            }

            // Configurar event listeners
            this.setupEventListeners();
            
            // Carregar dados
            await this.loadAnalytics();
            
            // Esconder loading
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('analyticsContent').style.display = 'block';
            
        } catch (error) {
            console.error('Erro ao inicializar analytics:', error);
            this.showError('Erro ao carregar analytics');
        }
    }

    setupEventListeners() {
        // Seletor de período
        document.getElementById('periodSelect').addEventListener('change', (e) => {
            this.currentPeriod = parseInt(e.target.value);
            this.loadAnalytics();
        });

        // Botão de atualizar top users
        document.getElementById('refreshTopUsers').addEventListener('click', () => {
            this.loadTopUsers();
        });

        // Botões de tipo de gráfico
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                const dataType = e.target.dataset.type;
                
                // Atualizar botões ativos
                document.querySelectorAll(`[data-chart="${chartType}"]`).forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Atualizar gráfico
                this.updateChart(chartType, dataType);
            });
        });
    }

    async loadAnalytics() {
        try {
            // Carregar estatísticas gerais
            await this.loadStats();
            
            // Carregar gráficos
            await this.loadCharts();
            
            // Carregar top users
            await this.loadTopUsers();
            
            // Carregar métricas de performance
            await this.loadPerformanceMetrics();
            
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
            this.showError('Erro ao carregar dados');
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/analytics/stats?period=${this.currentPeriod}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error('Erro ao carregar estatísticas');

            const stats = await response.json();

            // Atualizar cards de estatísticas
            document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
            document.getElementById('totalMeetings').textContent = stats.totalMeetings.toLocaleString();
            document.getElementById('totalTokens').textContent = stats.totalTokens.toLocaleString();
            document.getElementById('totalRevenue').textContent = `R$ ${stats.totalRevenue.toFixed(2).replace('.', ',')}`;

            // Atualizar mudanças percentuais
            this.updateStatChange('usersChange', stats.usersChange);
            this.updateStatChange('meetingsChange', stats.meetingsChange);
            this.updateStatChange('tokensChange', stats.tokensChange);
            this.updateStatChange('revenueChange', stats.revenueChange);

        } catch (error) {
            console.error('Erro ao carregar stats:', error);
        }
    }

    updateStatChange(elementId, change) {
        const element = document.getElementById(elementId);
        const isPositive = change >= 0;
        
        element.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
        element.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
    }

    async loadCharts() {
        try {
            // Carregar dados para gráficos
            const [revenueData, usersData, meetingsData, tokensData] = await Promise.all([
                this.fetchChartData('revenue', 'daily'),
                this.fetchChartData('users', 'daily'),
                this.fetchChartData('meetings', 'daily'),
                this.fetchChartData('tokens', 'daily')
            ]);

            // Criar gráficos
            this.createRevenueChart(revenueData);
            this.createUsersChart(usersData);
            this.createMeetingsChart(meetingsData);
            this.createTokensChart(tokensData);

        } catch (error) {
            console.error('Erro ao carregar gráficos:', error);
        }
    }

    async fetchChartData(type, period) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/analytics/chart?type=${type}&period=${period}&days=${this.currentPeriod}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error(`Erro ao carregar dados do gráfico ${type}`);

            return await response.json();

        } catch (error) {
            console.error(`Erro ao buscar dados do gráfico ${type}:`, error);
            return { labels: [], datasets: [] };
        }
    }

    createRevenueChart(data) {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Receita (R$)',
                    data: data.values,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    createUsersChart(data) {
        const ctx = document.getElementById('usersChart').getContext('2d');
        
        if (this.charts.users) {
            this.charts.users.destroy();
        }

        this.charts.users = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Usuários',
                    data: data.values,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }

    createMeetingsChart(data) {
        const ctx = document.getElementById('meetingsChart').getContext('2d');
        
        if (this.charts.meetings) {
            this.charts.meetings.destroy();
        }

        this.charts.meetings = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Reuniões',
                    data: data.values,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }

    createTokensChart(data) {
        const ctx = document.getElementById('tokensChart').getContext('2d');
        
        if (this.charts.tokens) {
            this.charts.tokens.destroy();
        }

        this.charts.tokens = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        '#3b82f6',
                        '#1d4ed8',
                        '#1e40af',
                        '#1e3a8a',
                        '#1e293b'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9ca3af',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    async updateChart(chartType, dataType) {
        try {
            const data = await this.fetchChartData(chartType, dataType);
            
            switch (chartType) {
                case 'revenue':
                    this.updateRevenueChart(data);
                    break;
                case 'users':
                    this.updateUsersChart(data);
                    break;
            }
        } catch (error) {
            console.error(`Erro ao atualizar gráfico ${chartType}:`, error);
        }
    }

    updateRevenueChart(data) {
        if (this.charts.revenue) {
            this.charts.revenue.data.labels = data.labels;
            this.charts.revenue.data.datasets[0].data = data.values;
            this.charts.revenue.update();
        }
    }

    updateUsersChart(data) {
        if (this.charts.users) {
            this.charts.users.data.labels = data.labels;
            this.charts.users.data.datasets[0].data = data.values;
            this.charts.users.update();
        }
    }

    async loadTopUsers() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/analytics/top-users`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error('Erro ao carregar top users');

            const data = await response.json();

            // Renderizar top meetings users
            this.renderTopUsers('topMeetingsUsers', data.topMeetings, 'reuniões');
            
            // Renderizar top tokens users
            this.renderTopUsers('topTokensUsers', data.topTokens, 'tokens');
            
            // Renderizar recent users
            this.renderRecentUsers('recentUsers', data.recentUsers);

        } catch (error) {
            console.error('Erro ao carregar top users:', error);
        }
    }

    renderTopUsers(containerId, users, metric) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        users.forEach((user, index) => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            const avatar = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
            
            userItem.innerHTML = `
                <div class="user-avatar">${avatar}</div>
                <div class="user-info">
                    <div class="user-name">${user.name || 'Usuário'}</div>
                    <div class="user-email">${user.email}</div>
                </div>
                <div class="user-value">${user.value} ${metric}</div>
            `;
            
            container.appendChild(userItem);
        });
    }

    renderRecentUsers(containerId, users) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            const avatar = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
            const date = new Date(user.createdAt).toLocaleDateString('pt-BR');
            
            userItem.innerHTML = `
                <div class="user-avatar">${avatar}</div>
                <div class="user-info">
                    <div class="user-name">${user.name || 'Usuário'}</div>
                    <div class="user-email">${user.email}</div>
                </div>
                <div class="user-value">${date}</div>
            `;
            
            container.appendChild(userItem);
        });
    }

    async loadPerformanceMetrics() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/analytics/performance`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error('Erro ao carregar métricas');

            const metrics = await response.json();

            // Atualizar métricas
            this.updateMetric('conversionRate', metrics.conversionRate, '%');
            this.updateMetric('retentionRate', metrics.retentionRate, '%');
            this.updateMetric('avgMeetingsPerUser', metrics.avgMeetingsPerUser, '');
            this.updateMetric('avgRevenuePerUser', metrics.avgRevenuePerUser, 'R$ ');

        } catch (error) {
            console.error('Erro ao carregar métricas:', error);
        }
    }

    updateMetric(elementId, value, prefix) {
        const element = document.getElementById(elementId);
        const barElement = document.getElementById(elementId.replace('Rate', 'Bar').replace('avgMeetingsPerUser', 'avgMeetingsBar').replace('avgRevenuePerUser', 'avgRevenueBar'));
        
        if (element) {
            if (prefix === 'R$ ') {
                element.textContent = `${prefix}${value.toFixed(2).replace('.', ',')}`;
            } else if (prefix === '%') {
                element.textContent = `${value.toFixed(1)}${prefix}`;
            } else {
                element.textContent = value.toFixed(1);
            }
        }
        
        if (barElement) {
            const percentage = Math.min(value, 100);
            barElement.style.width = `${percentage}%`;
        }
    }

    showError(message) {
        // Implementar notificação de erro
        console.error(message);
    }
}

// Inicializar dashboard quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    new AnalyticsDashboard();
});
