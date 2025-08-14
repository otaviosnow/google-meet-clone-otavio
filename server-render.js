const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

console.log('🚀 Iniciando servidor...');
console.log(`📊 Porta: ${PORT}`);
console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Conectado ao MongoDB com sucesso!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🔗 Host:', mongoose.connection.host);
})
.catch((error) => {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Importar rotas com tratamento de erro detalhado
console.log('📁 Carregando rotas...');
console.log('📂 Diretório atual:', __dirname);
console.log('📂 Verificando arquivos de rotas...');

const fs = require('fs');
const routesDir = path.join(__dirname, 'routes');
console.log('📂 Diretório de rotas:', routesDir);

if (fs.existsSync(routesDir)) {
    console.log('✅ Diretório routes existe');
    const files = fs.readdirSync(routesDir);
    console.log('📄 Arquivos encontrados:', files);
} else {
    console.error('❌ Diretório routes não existe!');
}

let authRoutes, userRoutes, videoRoutes, meetingRoutes;

try {
    console.log('🔄 Tentando carregar auth.js...');
    authRoutes = require('./routes/auth');
    console.log('✅ Rota auth carregada com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar rota auth:', error.message);
    console.error('❌ Stack trace:', error.stack);
    authRoutes = express.Router();
    // Adicionar rota de fallback para auth
    authRoutes.post('/login', (req, res) => {
        console.log('🔑 FALLBACK: Tentativa de login detectada');
        res.status(500).json({ error: 'Sistema de autenticação não disponível' });
    });
    authRoutes.post('/register', (req, res) => {
        console.log('📝 FALLBACK: Tentativa de registro detectada');
        res.status(500).json({ error: 'Sistema de registro não disponível' });
    });
    authRoutes.get('/me', (req, res) => {
        console.log('🔐 FALLBACK: Verificação de auth detectada');
        res.status(500).json({ error: 'Sistema de verificação não disponível' });
    });
}

try {
    console.log('🔄 Tentando carregar users.js...');
    userRoutes = require('./routes/users');
    console.log('✅ Rota users carregada com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar rota users:', error.message);
    userRoutes = express.Router();
}

try {
    console.log('🔄 Tentando carregar videos.js...');
    videoRoutes = require('./routes/videos');
    console.log('✅ Rota videos carregada com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar rota videos:', error.message);
    videoRoutes = express.Router();
}

try {
    console.log('🔄 Tentando carregar meetings.js...');
    meetingRoutes = require('./routes/meetings');
    console.log('✅ Rota meetings carregada com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar rota meetings:', error.message);
    meetingRoutes = express.Router();
}

// ===== ROTAS API =====

// Rota principal
app.get('/', (req, res) => {
  console.log('📥 GET / - Página principal acessada');
  res.json({
    message: '🚀 Google Meet Fake SaaS - Servidor funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.1',
    port: PORT,
    host: '0.0.0.0',
    database: 'MongoDB Connected'
  });
});

// Rota de teste da API
app.get('/api/test', (req, res) => {
  console.log('📥 GET /api/test - API de teste acessada');
  res.json({
    message: '✅ API funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'online',
    port: PORT,
    host: '0.0.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Usar rotas de autenticação reais
console.log('🔗 Configurando rotas da API...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/meetings', meetingRoutes);

// API Mock para estatísticas (mantida para compatibilidade)
app.get('/api/users/stats', (req, res) => {
  console.log('📊 GET /api/users/stats - API de estatísticas acessada');
  res.json({
    totalUsers: 1250,
    activeUsers: 89,
    totalMeetings: 567,
    success: true,
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Rota para verificar arquivos estáticos
app.get('/api/files/check', (req, res) => {
  console.log('📁 GET /api/files/check - Verificando arquivos estáticos');
  const fs = require('fs');
  
  const files = {
    'meet-logo.png': fs.existsSync(path.join(__dirname, 'public', 'images', 'meet-logo.png')),
    'hero-screenshot.png': fs.existsSync(path.join(__dirname, 'public', 'images', 'hero-screenshot.png')),
    'favicon.ico': fs.existsSync(path.join(__dirname, 'public', 'favicon.ico')),
    'index.html': fs.existsSync(path.join(__dirname, 'public', 'index.html')),
    'meet.html': fs.existsSync(path.join(__dirname, 'public', 'meet.html')),
    'test-auth.html': fs.existsSync(path.join(__dirname, 'public', 'test-auth.html'))
  };
  
  res.json({
    success: true,
    files,
    publicDir: path.join(__dirname, 'public'),
    imagesDir: path.join(__dirname, 'public', 'images')
  });
});

// ===== ARQUIVOS ESTÁTICOS =====

// Servir arquivos estáticos
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// Rota para o Google Meet fake
app.get('/meet', (req, res) => {
  console.log('🎯 GET /meet - Página do Meet acessada');
  res.sendFile(path.join(__dirname, 'public', 'meet.html'));
});

// Rota para a página principal
app.get('/app', (req, res) => {
  console.log('📱 GET /app - Página do App acessada');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para teste de autenticação
app.get('/test-auth', (req, res) => {
  console.log('🔐 GET /test-auth - Página de teste de auth acessada');
  res.sendFile(path.join(__dirname, 'public', 'test-auth.html'));
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
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'GET /api/users/stats',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me',
      'POST /api/videos/upload',
      'POST /api/meetings/create',
      'GET /meet',
      'GET /app',
      'GET /test-auth'
    ]
  });
});

// Iniciar servidor
console.log('🔧 Configurando servidor...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor Render otimizado iniciado!');
  console.log(`📱 URL: http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api/test`);
  console.log(`🎯 Meet: http://localhost:${PORT}/meet`);
  console.log(`📱 App: http://localhost:${PORT}/app`);
  console.log(`🔐 Test Auth: http://localhost:${PORT}/test-auth`);
  console.log(`⚙️  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Porta: ${PORT}`);
  console.log(`🔍 Host: 0.0.0.0`);
  console.log(`✅ Servidor pronto para receber conexões!`);
  console.log(`🎉 Deploy bem-sucedido!`);
  console.log(`🗄️  Banco de dados: MongoDB`);
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