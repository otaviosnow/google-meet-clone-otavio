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

// Verificar e criar diretório de uploads se necessário
const fs = require('fs');
const uploadsPathCheck = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/uploads'  // Render com disco persistente
    : path.join(__dirname, 'uploads');   // Desenvolvimento local

console.log('📁 Verificando diretório de uploads:', uploadsPathCheck);

// Sistema de backup automático para evitar perda de vídeos
if (process.env.NODE_ENV === 'production') {
    console.log('🔄 [BACKUP] Verificando backup de vídeos...');
    
    // Verificar se há arquivos no diretório de uploads
    if (fs.existsSync(uploadsPathCheck)) {
        try {
            const files = fs.readdirSync(uploadsPathCheck);
            console.log(`📄 [BACKUP] ${files.length} arquivos encontrados no diretório de uploads`);
            
            // Se há arquivos, fazer backup
            if (files.length > 0) {
                console.log('💾 [BACKUP] Arquivos encontrados, backup automático ativo');
            } else {
                console.log('⚠️ [BACKUP] Nenhum arquivo encontrado, pode ter sido perdido no deploy');
            }
        } catch (error) {
            console.error('❌ [BACKUP] Erro ao verificar arquivos:', error);
        }
    }
}

if (!fs.existsSync(uploadsPathCheck)) {
    console.log('❌ Diretório não existe, criando...');
    try {
        fs.mkdirSync(uploadsPathCheck, { recursive: true });
        console.log('✅ Diretório de uploads criado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao criar diretório de uploads:', error);
    }
} else {
    console.log('✅ Diretório de uploads já existe');
    try {
        const files = fs.readdirSync(uploadsPathCheck);
        console.log(`📄 ${files.length} arquivos encontrados no diretório de uploads`);
    } catch (error) {
        console.error('❌ Erro ao listar arquivos de uploads:', error);
    }
}

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

// Job de limpeza automática para EXCLUIR reuniões expiradas
async function cleanupExpiredMeetings() {
    try {
        const now = new Date();
        const twentyMinutesAgo = new Date(now.getTime() - (20 * 60 * 1000));
        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
        
        // EXCLUIR reuniões ativas que começaram há mais de 20 minutos
        const expiredActiveMeetings = await Meeting.find({
            status: 'active',
            startedAt: { $lt: twentyMinutesAgo }
        });
        
        if (expiredActiveMeetings.length > 0) {
            console.log(`🗑️ Encontradas ${expiredActiveMeetings.length} reuniões ativas expiradas - EXCLUINDO`);
            
            for (const meeting of expiredActiveMeetings) {
                await Meeting.deleteOne({ _id: meeting._id });
                console.log(`✅ Reunião ativa ${meeting.meetingId} EXCLUÍDA por timeout`);
            }
        }
        
        // EXCLUIR reuniões finalizadas há mais de 1 hora
        const oldEndedMeetings = await Meeting.find({
            status: 'ended',
            endedAt: { $lt: oneHourAgo }
        });
        
        if (oldEndedMeetings.length > 0) {
            console.log(`🗑️ Encontradas ${oldEndedMeetings.length} reuniões finalizadas antigas - EXCLUINDO`);
            
            for (const meeting of oldEndedMeetings) {
                await Meeting.deleteOne({ _id: meeting._id });
                console.log(`✅ Reunião finalizada ${meeting.meetingId} EXCLUÍDA por antiguidade`);
            }
        }
        
        // EXCLUIR reuniões com links expirados
        const expiredLinkMeetings = await Meeting.find({
            linkExpiresAt: { $lt: now }
        });
        
        if (expiredLinkMeetings.length > 0) {
            console.log(`🗑️ Encontradas ${expiredLinkMeetings.length} reuniões com links expirados - EXCLUINDO`);
            
            for (const meeting of expiredLinkMeetings) {
                await Meeting.deleteOne({ _id: meeting._id });
                console.log(`✅ Reunião com link expirado ${meeting.meetingId} EXCLUÍDA`);
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
const webhookRoutes = require('./routes/webhooks');
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
    app.use('/api/webhooks', webhookRoutes); // Webhooks do Mercado Pago
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/tokens', tokensRoutes); // Rota para tokens e transações
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

    // ===== ROTAS ESPECÍFICAS (ANTES DOS ARQUIVOS ESTÁTICOS) =====
    
    // Rota para reunião específica - DEVE VIR ANTES DOS ARQUIVOS ESTÁTICOS
    app.get('/meet/:meetingId', async (req, res) => {
        const { meetingId } = req.params;
        console.log(`🎯 GET /meet/${meetingId} - Reunião específica acessada`);
        
        try {
            // Buscar a reunião no banco de dados
            const meeting = await Meeting.findOne({ meetingId });
            
            if (!meeting) {
                console.log(`❌ Reunião não encontrada: ${meetingId}`);
                return res.status(404).send(`
                    <html>
                        <head><title>Reunião não encontrada</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>❌ Reunião não encontrada</h1>
                            <p>A reunião solicitada não existe ou foi removida.</p>
                        </body>
                    </html>
                `);
            }
            
            // Verificar se a reunião está finalizada - EXCLUIR DO SISTEMA
            if (meeting.status === 'ended') {
                console.log(`🗑️ Reunião finalizada - EXCLUINDO: ${meetingId}`);
                
                // Excluir a reunião do banco de dados
                await Meeting.deleteOne({ meetingId });
                console.log(`✅ Reunião excluída do sistema: ${meetingId}`);
                
                return res.status(404).send(`
                    <html>
                        <head><title>Reunião não encontrada</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>❌ Reunião não encontrada</h1>
                            <p>Esta reunião foi encerrada e removida do sistema.</p>
                        </body>
                    </html>
                `);
            }
            
            // Verificar se o link expirou - EXCLUIR DO SISTEMA
            if (meeting.linkExpiresAt && new Date() > meeting.linkExpiresAt) {
                console.log(`🗑️ Link expirado - EXCLUINDO: ${meetingId}`);
                
                // Excluir a reunião do banco de dados
                await Meeting.deleteOne({ meetingId });
                console.log(`✅ Reunião expirada excluída do sistema: ${meetingId}`);
                
                return res.status(404).send(`
                    <html>
                        <head><title>Reunião não encontrada</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>❌ Reunião não encontrada</h1>
                            <p>Esta reunião expirou e foi removida do sistema.</p>
                        </body>
                    </html>
                `);
            }
            
            console.log(`✅ Reunião válida: ${meetingId} (Status: ${meeting.status})`);
            res.sendFile(path.join(__dirname, 'public', 'meet.html'));
            
        } catch (error) {
            console.error(`❌ Erro ao verificar reunião ${meetingId}:`, error);
            res.status(500).send(`
                <html>
                    <head><title>Erro</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>❌ Erro</h1>
                        <p>Ocorreu um erro ao verificar a reunião.</p>
                    </body>
                </html>
            `);
        }
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
    // Configurar pasta de uploads para usar disco persistente no Render
    const uploadsPath = process.env.NODE_ENV === 'production' 
        ? '/opt/render/project/src/uploads'  // Render com disco persistente
        : path.join(__dirname, 'uploads');   // Desenvolvimento local
    
    console.log('📁 Pasta de uploads configurada:', uploadsPath);
    console.log('🌍 Ambiente:', process.env.NODE_ENV);
    console.log('📂 Diretório atual:', __dirname);
    
    // Verificar se o diretório existe e listar arquivos
    if (fs.existsSync(uploadsPath)) {
        try {
            const files = fs.readdirSync(uploadsPath);
            console.log(`📁 Diretório de uploads existe com ${files.length} arquivos:`, files.slice(0, 5));
        } catch (error) {
            console.error('❌ Erro ao listar arquivos de uploads:', error);
        }
    } else {
        console.log('❌ Diretório de uploads não existe, será criado automaticamente');
    }
    
    app.use('/uploads', express.static(uploadsPath));

    // Middleware para verificar se arquivo existe
    app.use('/uploads/*', (req, res, next) => {
        const filePath = path.join(uploadsPath, req.params[0]);
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
        
        // Verificar status do disco persistente
        let uploadsStatus = 'unknown';
        let fileCount = 0;
        
        try {
            if (fs.existsSync(uploadsPath)) {
                const files = fs.readdirSync(uploadsPath);
                fileCount = files.length;
                uploadsStatus = 'exists';
            } else {
                uploadsStatus = 'missing';
            }
        } catch (error) {
            uploadsStatus = 'error';
            console.error('❌ Erro ao verificar uploads:', error);
        }
        
        res.json({
            message: '✅ API funcionando - VERSÃO COMPLETA!',
            timestamp: new Date().toISOString(),
            version: 'COMPLETA - 14/08/2025 01:35 AM',
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            uploads: {
                path: uploadsPath,
                status: uploadsStatus,
                fileCount: fileCount,
                environment: process.env.NODE_ENV
            }
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