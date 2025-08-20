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
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const analyticsRoutes = require('./routes/analytics');
const tokensRoutes = require('./routes/tokens');
const integrationRoutes = require('./routes/integration');
const { runCompleteCleanup } = require('./utils/cleanupExpiredMeetings');

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

    // ===== ROTAS DE API =====
    app.use('/api/auth', authRoutes);
    app.use('/api/videos', videoRoutes);
    app.use('/api/meetings', meetingRoutes);
    app.use('/api/users', userRoutes);

    app.use('/api/financial', financialRoutes);

    app.use('/api/admin', adminRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/webhooks', paymentRoutes); // Webhooks do Pagar.me
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/tokens', tokensRoutes);
app.use('/api/integration', integrationRoutes);

    // ===== ROTAS DE PÁGINAS =====

    // Rota principal - página de login
    app.get('/', (req, res) => {
        console.log('📥 GET / - Página principal (login) acessada');
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Rota para dashboard (mesma página, mas URL diferente)
    app.get('/dashboard', (req, res) => {
        console.log('📊 GET /dashboard - Dashboard acessado');
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Rota para integração
    app.get('/integration', (req, res) => {
        console.log('🔗 GET /integration - Página de integração acessada');
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Rota para vídeos
    app.get('/videos', (req, res) => {
        console.log('🎥 GET /videos - Página de vídeos acessada');
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Rota para reuniões
    app.get('/meetings', (req, res) => {
        console.log('📞 GET /meetings - Página de reuniões acessada');
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Rota para perfil
    app.get('/profile', (req, res) => {
        console.log('👤 GET /profile - Página de perfil acessada');
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Rota para financeiro
    app.get('/financial', (req, res) => {
        console.log('💰 GET /financial - Página financeira acessada');
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

    // Rota para página de termos de uso
    app.get('/termos-uso', (req, res) => {
        console.log('📋 GET /termos-uso - Página de termos de uso acessada');
        res.sendFile(path.join(__dirname, 'public', 'termos-uso.html'));
    });

    // Rota para página de analytics
    app.get('/analytics', (req, res) => {
        console.log('📊 GET /analytics - Página de analytics acessada');
        res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
    });

    // ===== ARQUIVOS ESTÁTICOS =====
    app.use(express.static('public'));

    // Servir arquivos estáticos do admin (ANTES das rotas gerais)
    app.use('/admin', express.static(path.join(__dirname, 'admin')));

    // Rota para painel admin (DEPOIS dos arquivos estáticos)
    app.get('/admin', (req, res) => {
        console.log('⚙️ GET /admin - Painel admin acessado');
        res.sendFile(path.join(__dirname, 'admin', 'index.html'));
    });
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
        
        if (!fs.existsSync(filePath)) {
            console.log('📁 Arquivo existe: false');
            console.log('❌ Rota não encontrada:', req.originalUrl);
            return res.status(404).json({
                error: 'Arquivo não encontrado',
                path: req.originalUrl
            });
        }
        
        console.log('📁 Arquivo existe: true');
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
    console.log(`🧹 Limpeza Automática: Ativa`);
    
    // Iniciar limpeza automática de reuniões expiradas
    startAutomaticCleanup();
});

// Tratamento de erros do servidor
server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
  if (err.code === 'EADDRINUSE') {
    console.error('❌ Porta já está em uso:', PORT);
  }
});

// Função para iniciar limpeza automática
function startAutomaticCleanup() {
    console.log('🧹 Iniciando limpeza automática de reuniões expiradas...');
    
    // Executar limpeza a cada 6 horas
    const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 horas em milissegundos
    
    // Executar limpeza imediatamente na inicialização
    (async () => {
        try {
            const result = await runCompleteCleanup();
            if (result.success) {
                console.log(`✅ Limpeza inicial concluída: ${result.markedAsExpired} marcadas como expiradas, ${result.removedCount} removidas`);
            } else {
                console.error('❌ Erro na limpeza inicial:', result.error);
            }
        } catch (error) {
            console.error('❌ Erro na limpeza inicial:', error);
        }
    })();
    
    // Agendar limpeza periódica
    setInterval(async () => {
        console.log('🔄 Executando limpeza automática periódica...');
        const result = await runCompleteCleanup();
        if (result.success) {
            console.log(`✅ Limpeza periódica concluída: ${result.markedAsExpired} marcadas como expiradas, ${result.removedCount} removidas`);
        } else {
            console.error('❌ Erro na limpeza periódica:', result.error);
        }
    }, CLEANUP_INTERVAL);
    
    console.log(`⏰ Limpeza automática agendada para executar a cada ${CLEANUP_INTERVAL / 1000 / 60 / 60} horas`);
}

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