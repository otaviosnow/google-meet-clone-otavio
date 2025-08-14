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

// ===== ROTAS =====
const videoRoutes = require('./routes/videos');

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

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('🔑 Tentativa de login:', req.body.email);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário no banco
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('❌ Login rejeitado - Usuário não encontrado:', email);
            return res.status(401).json({
                success: false,
                error: 'Email ou senha incorretos'
            });
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            console.log('❌ Login rejeitado - Senha incorreta:', email);
            return res.status(401).json({
                success: false,
                error: 'Email ou senha incorretos'
            });
        }

        // Atualizar último login
        user.lastLogin = new Date();
        await user.save();

        // Gerar token
        const token = generateToken(user._id);
        
        console.log('✅ Login bem-sucedido:', email);
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Registro
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('📝 Tentativa de registro:', req.body.email);
        
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Todos os campos são obrigatórios'
            });
        }

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email já cadastrado'
            });
        }

        // Criar novo usuário
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();
        
        // Gerar token
        const token = generateToken(user._id);
        
        console.log('✅ Registro bem-sucedido:', email);
        
        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('❌ Erro no registro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

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
app.use('/api/videos', videoRoutes);

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

// Rota para teste de autenticação
app.get('/test-auth', (req, res) => {
    console.log('🔐 GET /test-auth - Página de teste de auth acessada');
    res.sendFile(path.join(__dirname, 'public', 'test-auth.html'));
});

// ===== ARQUIVOS ESTÁTICOS =====
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
        mongoose.connection.close(() => {
            console.log('✅ Conexão com MongoDB fechada.');
            process.exit(0);
        });
    });
}); 