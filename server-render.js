const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

console.log('🚀 Iniciando servidor...');
console.log(`📊 Porta: ${PORT}`);
console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Sistema de autenticação real
const users = new Map();

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
    host: '0.0.0.0'
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
    host: '0.0.0.0'
  });
});

// API Mock para usuários - CRÍTICA
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

// API de registro
app.post('/api/auth/register', (req, res) => {
  console.log('📝 POST /api/auth/register - Tentativa de registro:', req.body);
  
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Todos os campos são obrigatórios'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Senha deve ter pelo menos 6 caracteres'
    });
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Email inválido'
    });
  }
  
  if (users.has(email)) {
    return res.status(400).json({
      success: false,
      error: 'Usuário já existe'
    });
  }
  
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  };
  
  users.set(email, user);
  console.log('✅ Usuário registrado:', email);
  
  res.json({
    success: true,
    message: 'Usuário registrado com sucesso',
    token: `token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

// API de login
app.post('/api/auth/login', (req, res) => {
  console.log('🔑 POST /api/auth/login - Tentativa de login:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email e senha são obrigatórios'
    });
  }
  
  const user = users.get(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }
  
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Senha incorreta'
    });
  }
  
  console.log('✅ Login bem-sucedido:', email);
  
  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    token: `token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

// API para verificar autenticação
app.get('/api/auth/me', (req, res) => {
  console.log('🔐 GET /api/auth/me - Verificação de autenticação');
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token não fornecido'
    });
  }
  
  const token = authHeader.substring(7);
  
  if (!token.startsWith('token_')) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
  
  let foundUser = null;
  for (const [email, user] of users.entries()) {
    if (token.includes(user.id)) {
      foundUser = user;
      break;
    }
  }
  
  if (!foundUser) {
    return res.status(401).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }
  
  res.json({
    success: true,
    user: {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name
    }
  });
});

// API Mock para vídeos
app.post('/api/videos/upload', (req, res) => {
  console.log('📹 POST /api/videos/upload - Upload de vídeo');
  res.json({
    success: true,
    message: 'Upload mock funcionando',
    videoId: 'mock_video_123',
    url: 'https://example.com/video.mp4'
  });
});

// API Mock para reuniões
app.post('/api/meetings/create', (req, res) => {
  console.log('🎯 POST /api/meetings/create - Criação de reunião');
  res.json({
    success: true,
    message: 'Reunião mock criada',
    meetingId: 'mock_meeting_123',
    joinUrl: 'https://meet.google.com/mock-123'
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
    process.exit(0);
  });
}); 