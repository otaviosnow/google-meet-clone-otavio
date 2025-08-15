const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const FinancialEntry = require('../models/FinancialEntry');

const router = express.Router();

// Middleware para verificar se é admin
const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Estatísticas gerais
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const period = parseInt(req.query.period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        // Estatísticas atuais
        const totalUsers = await User.countDocuments();
        const totalMeetings = await Meeting.countDocuments();
        const totalTokens = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$visionTokens' } } }
        ]);

        // Estatísticas do período anterior para comparação
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - period);

        const previousUsers = await User.countDocuments({ createdAt: { $lt: startDate } });
        const previousMeetings = await Meeting.countDocuments({ createdAt: { $lt: startDate } });

        // Calcular mudanças percentuais
        const usersChange = previousUsers > 0 ? ((totalUsers - previousUsers) / previousUsers) * 100 : 0;
        const meetingsChange = previousMeetings > 0 ? ((totalMeetings - previousMeetings) / previousMeetings) * 100 : 0;

        // Receita (estimativa baseada em tokens consumidos)
        const totalRevenue = (totalTokens[0]?.total || 0) * 2; // R$ 2,00 por token
        const previousRevenue = 0; // Implementar cálculo real quando PIX estiver ativo
        const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        // Tokens consumidos (estimativa)
        const tokensConsumed = totalTokens[0]?.total || 0;
        const previousTokens = 0; // Implementar cálculo real
        const tokensChange = previousTokens > 0 ? ((tokensConsumed - previousTokens) / previousTokens) * 100 : 0;

        res.json({
            totalUsers,
            totalMeetings,
            totalTokens: tokensConsumed,
            totalRevenue,
            usersChange,
            meetingsChange,
            tokensChange,
            revenueChange
        });

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Dados para gráficos
router.get('/chart', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { type, period, days } = req.query;
        const daysCount = parseInt(days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysCount);

        let labels = [];
        let values = [];

        // Gerar labels baseado no período
        for (let i = daysCount - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            if (period === 'daily') {
                labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            } else if (period === 'weekly') {
                if (i % 7 === 0) {
                    labels.push(`Semana ${Math.floor(i / 7) + 1}`);
                }
            } else if (period === 'monthly') {
                if (i % 30 === 0) {
                    labels.push(date.toLocaleDateString('pt-BR', { month: 'short' }));
                }
            }
        }

        // Carregar dados baseado no tipo
        switch (type) {
            case 'revenue':
                values = await generateRevenueData(startDate, daysCount, period);
                break;
            case 'users':
                values = await generateUsersData(startDate, daysCount, period);
                break;
            case 'meetings':
                values = await generateMeetingsData(startDate, daysCount, period);
                break;
            case 'tokens':
                values = await generateTokensData(startDate, daysCount, period);
                break;
            default:
                values = new Array(labels.length).fill(0);
        }

        res.json({
            labels,
            values
        });

    } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Top usuários
router.get('/top-users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Top usuários por reuniões
        const topMeetings = await User.aggregate([
            {
                $lookup: {
                    from: 'meetings',
                    localField: '_id',
                    foreignField: 'creator',
                    as: 'meetings'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    value: { $size: '$meetings' }
                }
            },
            { $sort: { value: -1 } },
            { $limit: 5 }
        ]);

        // Top usuários por tokens
        const topTokens = await User.find({}, 'name email visionTokens')
            .sort({ visionTokens: -1 })
            .limit(5)
            .lean();

        // Usuários recentes
        const recentUsers = await User.find({}, 'name email createdAt')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.json({
            topMeetings,
            topTokens: topTokens.map(user => ({ ...user, value: user.visionTokens })),
            recentUsers
        });

    } catch (error) {
        console.error('Erro ao carregar top users:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Métricas de performance
router.get('/performance', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const usersWithMeetings = await User.aggregate([
            {
                $lookup: {
                    from: 'meetings',
                    localField: '_id',
                    foreignField: 'creator',
                    as: 'meetings'
                }
            },
            {
                $match: {
                    'meetings.0': { $exists: true }
                }
            },
            {
                $count: 'count'
            }
        ]);

        const totalMeetings = await Meeting.countDocuments();
        const totalRevenue = (await User.aggregate([
            { $group: { _id: null, total: { $sum: '$visionTokens' } } }
        ]))[0]?.total || 0;

        // Calcular métricas
        const conversionRate = totalUsers > 0 ? (usersWithMeetings[0]?.count || 0) / totalUsers * 100 : 0;
        const avgMeetingsPerUser = totalUsers > 0 ? totalMeetings / totalUsers : 0;
        const avgRevenuePerUser = totalUsers > 0 ? (totalRevenue * 2) / totalUsers : 0;

        // Retenção (usuários que criaram reunião nos últimos 7 dias)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const recentActiveUsers = await User.aggregate([
            {
                $lookup: {
                    from: 'meetings',
                    localField: '_id',
                    foreignField: 'creator',
                    as: 'meetings'
                }
            },
            {
                $match: {
                    'meetings.createdAt': { $gte: lastWeek }
                }
            },
            {
                $count: 'count'
            }
        ]);

        const retentionRate = totalUsers > 0 ? (recentActiveUsers[0]?.count || 0) / totalUsers * 100 : 0;

        res.json({
            conversionRate,
            retentionRate,
            avgMeetingsPerUser,
            avgRevenuePerUser
        });

    } catch (error) {
        console.error('Erro ao carregar métricas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Funções auxiliares para gerar dados dos gráficos
async function generateRevenueData(startDate, daysCount, period) {
    // Implementar cálculo real quando PIX estiver ativo
    // Por enquanto, retorna dados simulados
    const values = [];
    for (let i = 0; i < daysCount; i++) {
        values.push(Math.random() * 100 + 50); // R$ 50-150 por dia
    }
    return values;
}

async function generateUsersData(startDate, daysCount, period) {
    const values = [];
    for (let i = 0; i < daysCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const count = await User.countDocuments({
            createdAt: { $gte: date, $lt: nextDate }
        });
        
        values.push(count);
    }
    return values;
}

async function generateMeetingsData(startDate, daysCount, period) {
    const values = [];
    for (let i = 0; i < daysCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const count = await Meeting.countDocuments({
            createdAt: { $gte: date, $lt: nextDate }
        });
        
        values.push(count);
    }
    return values;
}

async function generateTokensData(startDate, daysCount, period) {
    // Implementar cálculo real quando PIX estiver ativo
    // Por enquanto, retorna dados simulados
    const values = [];
    for (let i = 0; i < daysCount; i++) {
        values.push(Math.floor(Math.random() * 20) + 5); // 5-25 tokens por dia
    }
    return values;
}

module.exports = router;
