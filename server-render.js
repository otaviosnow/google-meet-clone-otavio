const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Servir arquivos estáticos
app.use(express.static('public'));

// Logs detalhados
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Google Meet Fake SaaS - Servidor funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  });
});

// Rota de teste da API
app.get('/api/test', (req, res) => {
  res.json({
    message: '✅ API funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'online'
  });
});

// Rota para o Google Meet fake
app.get('/meet', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meet.html'));
});

// Rota para a página principal
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para teste de autenticação
app.get('/test-auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-auth.html'));
});

// API Mock para usuários
app.get('/api/users/stats', (req, res) => {
  res.json({
    totalUsers: 1250,
    activeUsers: 89,
    totalMeetings: 567,
    success: true
  });
});

// API Mock para autenticação
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login mock funcionando',
    token: 'mock_jwt_token_123',
    user: {
      id: 'mock_user_123',
      email: req.body.email || 'user@example.com',
      name: 'Usuário Mock'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registro mock funcionando',
    token: 'mock_jwt_token_456',
    user: {
      id: 'mock_user_456',
      email: req.body.email || 'newuser@example.com',
      name: req.body.name || 'Novo Usuário'
    }
  });
});

// API Mock para vídeos
app.post('/api/videos/upload', (req, res) => {
  res.json({
    success: true,
    message: 'Upload mock funcionando',
    videoId: 'mock_video_123',
    url: 'https://example.com/video.mp4'
  });
});

// API Mock para reuniões
app.post('/api/meetings/create', (req, res) => {
  res.json({
    success: true,
    message: 'Reunião mock criada',
    meetingId: 'mock_meeting_123',
    joinUrl: 'https://meet.google.com/mock-123'
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
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'GET /meet',
      'GET /app',
      'GET /test-auth',
      'GET /api/users/stats',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/videos/upload',
      'POST /api/meetings/create'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor Render otimizado iniciado!');
  console.log(`📱 URL: http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api/test`);
  console.log(`🎯 Meet: http://localhost:${PORT}/meet`);
  console.log(`📱 App: http://localhost:${PORT}/app`);
  console.log(`🔐 Test Auth: http://localhost:${PORT}/test-auth`);
  console.log(`⚙️  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Porta: ${PORT}`);
}); 