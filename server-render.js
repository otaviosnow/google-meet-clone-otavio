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
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));

// Middleware para verificar se arquivos existem
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Se for uma requisição para arquivo estático, verificar se existe
  if (req.path.includes('.') && !req.path.includes('api')) {
    const filePath = path.join(__dirname, 'public', req.path);
    if (!require('fs').existsSync(filePath)) {
      console.log(`❌ Arquivo não encontrado: ${req.path}`);
      return res.status(404).json({
        error: 'Arquivo não encontrado',
        path: req.path,
        availableFiles: ['index.html', 'meet.html', 'test-auth.html', 'images/meet-logo.png', 'images/hero-screenshot.png', 'favicon.ico']
      });
    }
  }
  
  next();
});

// Logs detalhados já incluídos no middleware acima

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
  const filePath = path.join(__dirname, 'public', 'meet.html');
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'Arquivo meet.html não encontrado',
      availableFiles: ['index.html', 'meet.html', 'test-auth.html']
    });
  }
});

// Rota para a página principal
app.get('/app', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'Arquivo index.html não encontrado',
      availableFiles: ['index.html', 'meet.html', 'test-auth.html']
    });
  }
});

// Rota para teste de autenticação
app.get('/test-auth', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'test-auth.html');
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'Arquivo test-auth.html não encontrado',
      availableFiles: ['index.html', 'meet.html', 'test-auth.html']
    });
  }
});

// API Mock para usuários
app.get('/api/users/stats', (req, res) => {
  console.log('📊 API /api/users/stats chamada');
  res.json({
    totalUsers: 1250,
    activeUsers: 89,
    totalMeetings: 567,
    success: true,
    timestamp: new Date().toISOString()
  });
});

// Sistema de autenticação real
const users = new Map(); // Simular banco de dados em memória

// API de registro real
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Tentativa de registro:', req.body);
  
  const { name, email, password } = req.body;
  
  // Validações
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
  
  // Verificar se usuário já existe
  if (users.has(email)) {
    return res.status(400).json({
      success: false,
      error: 'Usuário já existe'
    });
  }
  
  // Criar usuário
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password, // Em produção, deve ser hash
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

// API de login real
app.post('/api/auth/login', (req, res) => {
  console.log('🔑 Tentativa de login:', req.body);
  
  const { email, password } = req.body;
  
  // Validações
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email e senha são obrigatórios'
    });
  }
  
  // Verificar se usuário existe
  const user = users.get(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }
  
  // Verificar senha
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
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token não fornecido'
    });
  }
  
  const token = authHeader.substring(7);
  
  // Verificar token (simplificado)
  if (!token.startsWith('token_')) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
  
  // Encontrar usuário pelo token
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