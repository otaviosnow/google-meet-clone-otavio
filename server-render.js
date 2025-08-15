// ===== VERSÃO COMPLETA - GOOGLE MEET FAKE SAAS =====
// ÚLTIMA ATUALIZAÇÃO: 14/08/2025 01:35 AM
// VERSÃO COMPLETA COM INTERFACE DE LOGIN

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ===== LOGS INICIAIS =====
console.log('🚀 VERSÃO COMPLETA - GOOGLE MEET FAKE SAAS');
console.log('📅 Data/Hora:', new Date().toISOString());
console.log('📂 Diretório atual:', __dirname);
console.log('📊 Porta:', PORT);

// Conectar ao MongoDB
console.log('🔗 Conectando ao MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Conectado ao MongoDB com sucesso!');
})
.catch((error) => {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ===== MODELOS =====
const User = require('./models/User');
const Meeting = require('./models/Meeting');

// Job de limpeza automática para encerrar reuniões expiradas
async function cleanupExpiredMeetings() {
    try {
        const now = new Date();
        const twentyMinutesAgo = new Date(now.getTime() - (20 * 60 * 1000));
        
        // Encontrar reuniões ativas que começaram há mais de 20 minutos
        const expiredMeetings = await Meeting.find({
            status: 'active',
            startedAt: { $lt: twentyMinutesAgo }
        });
        
        if (expiredMeetings.length > 0) {
            console.log(`🕐 Encontradas ${expiredMeetings.length} reuniões expiradas por tempo`);
            
            for (const meeting of expiredMeetings) {
                await meeting.endMeeting();
                console.log(`⏰ Reunião ${meeting.meetingId} encerrada automaticamente por timeout`);
            }
        }
    } catch (error) {
        console.error('❌ Erro no job de limpeza de reuniões:', error);
    }
}

// Executar limpeza a cada 5 minutos
setInterval(cleanupExpiredMeetings, 5 * 60 * 1000);

// Executar limpeza inicial após 1 minuto
setTimeout(cleanupExpiredMeetings, 60 * 1000);

// ===== ROTAS =====
const videoRoutes = require('./routes/videos');
const meetingRoutes = require('./routes/meetings');
const userRoutes = require('./routes/users');
const financialRoutes = require('./routes/financial');
const authRoutes = require('./routes/auth');

// ===== FUNÇÕES DE AUTENTICAÇÃO =====
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// ===== ROTAS DE AUTENTICAÇÃO =====
// As rotas de autenticação estão no arquivo routes/auth.js

// Verificar usuário autenticado
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ===== ROTAS DE API =====
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/financial', financialRoutes);

// ===== ROTAS DE PÁGINAS =====

// Rota principal - página de login
app.get('/', (req, res) => {
    console.log('📥 GET / - Página principal (login) acessada');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para o Google Meet
app.get('/meet', (req, res) => {
    console.log('🎯 GET /meet - Página do Meet acessada');
    res.sendFile(path.join(__dirname, 'public', 'meet.html'));
});

// Rota para reunião específica
app.get('/meet/:meetingId', (req, res) => {
    console.log(`🎯 GET /meet/${req.params.meetingId} - Reunião específica acessada`);
    res.sendFile(path.join(__dirname, 'public', 'meet.html'));
});

// Rota para teste de autenticação
app.get('/test-auth', (req, res) => {
    console.log('🔐 GET /test-auth - Página de teste de auth acessada');
    res.sendFile(path.join(__dirname, 'public', 'test-auth.html'));
});

// Rota para página de compra de tokens
app.get('/comprar-tokens', (req, res) => {
    console.log('💰 GET /comprar-tokens - Página de compra de tokens acessada');
    res.sendFile(path.join(__dirname, 'public', 'comprar-tokens.html'));
});

// Rota para página de reset de senha
app.get('/reset-password', (req, res) => {
    console.log('🔑 GET /reset-password - Página de reset de senha acessada');
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// ===== ARQUIVOS ESTÁTICOS =====
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para verificar se arquivo existe
app.use('/uploads/*', (req, res, next) => {
    const fs = require('fs');
    const filePath = path.join(__dirname, 'uploads', req.params[0]);
    console.log('📁 Verificando arquivo:', filePath);
    console.log('📁 Arquivo existe:', fs.existsSync(filePath));
    next();
});

// ===== ROTA DE TESTE DA API =====
app.get('/api/test', (req, res) => {
    console.log('📥 GET /api/test - API de teste acessada');
    res.json({
        message: '✅ API funcionando - VERSÃO COMPLETA!',
        timestamp: new Date().toISOString(),
        version: 'COMPLETA - 14/08/2025 01:35 AM',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

// Rota 404
app.use('*', (req, res) => {
    console.log(`❌ Rota não encontrada: ${req.originalUrl}`);
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        version: 'COMPLETA - 14/08/2025 01:35 AM'
    });
});

// Iniciar servidor
console.log('🔧 CONFIGURANDO SERVIDOR...');
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀🚀🚀 SERVIDOR COMPLETO INICIADO! 🚀🚀🚀');
    console.log('📅 VERSÃO: COMPLETA - 14/08/2025 01:35 AM');
    console.log(`📱 URL: http://localhost:${PORT}`);
    console.log(`📋 API: http://localhost:${PORT}/api/test`);
    console.log(`🎯 Meet: http://localhost:${PORT}/meet`);
    console.log(`🔐 Test Auth: http://localhost:${PORT}/test-auth`);
    console.log(`⚙️  Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Porta: ${PORT}`);
    console.log(`🔍 Host: 0.0.0.0`);
    console.log(`✅ Servidor pronto para receber conexões!`);
    console.log(`🎉 Deploy bem-sucedido!`);
    console.log(`🗄️  Banco de dados: MongoDB`);
    console.log(`📁 Versão: COMPLETA COM INTERFACE`);
});

// Tratamento de erros do servidor
server.on('error', (err) => {
    console.error('❌ Erro no servidor:', err);
    if (err.code === 'EADDRINUSE') {
        console.error('❌ Porta já está em uso:', PORT);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado.');
        mongoose.connection.close()
            .then(() => {
                console.log('✅ Conexão com MongoDB fechada.');
                process.exit(0);
            })
            .catch((error) => {
                console.log('⚠️ Erro ao fechar conexão MongoDB:', error.message);
                process.exit(0);
            });
    });
}); 