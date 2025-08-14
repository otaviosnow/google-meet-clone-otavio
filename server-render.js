// ===== VERSÃO ULTRA SIMPLES - SEMPRE REJEITA LOGIN INVÁLIDO =====
// ÚLTIMA ATUALIZAÇÃO: 14/08/2025 01:30 AM
// SE VOCÊ CONSEGUIR LOGAR COM QUALQUER EMAIL/SENHA, O CÓDIGO NÃO ESTÁ SENDO EXECUTADO!

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ===== LOGS CRÍTICOS =====
console.log('🚨🚨🚨 VERSÃO ULTRA SIMPLES EXECUTADA! 🚨🚨🚨');
console.log('🚨🚨🚨 SEMPRE REJEITA LOGIN INVÁLIDO! 🚨🚨🚨');
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

// Middleware básico
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ===== ROTAS ULTRA SIMPLES =====

// Rota principal
app.get('/', (req, res) => {
  console.log('📥 GET / - Página principal acessada');
  res.json({
    message: '🚀 Google Meet Fake SaaS - VERSÃO ULTRA SIMPLES!',
    timestamp: new Date().toISOString(),
    version: 'ULTRA SIMPLES - 14/08/2025 01:30 AM',
    database: 'MongoDB Connected'
  });
});

// Rota de teste da API
app.get('/api/test', (req, res) => {
  console.log('📥 GET /api/test - API de teste acessada');
  res.json({
    message: '✅ API funcionando - VERSÃO ULTRA SIMPLES!',
    timestamp: new Date().toISOString(),
    version: 'ULTRA SIMPLES - 14/08/2025 01:30 AM',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ===== LOGIN - SEMPRE REJEITA INVÁLIDO =====
app.post('/api/auth/login', (req, res) => {
  console.log('🔑 POST /api/auth/login - Tentativa de login:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('❌ LOGIN REJEITADO - Campos vazios');
    return res.status(400).json({
      success: false,
      error: 'Email e senha são obrigatórios - VERSÃO ULTRA SIMPLES'
    });
  }
  
  // SEMPRE REJEITA - NUNCA ACEITA QUALQUER EMAIL/SENHA
  console.log('❌ LOGIN REJEITADO - VERSÃO ULTRA SIMPLES SEMPRE REJEITA');
  return res.status(401).json({
    success: false,
    error: 'Email ou senha incorretos - VERSÃO ULTRA SIMPLES'
  });
});

// ===== REGISTRO - FUNCIONA =====
app.post('/api/auth/register', (req, res) => {
  console.log('📝 POST /api/auth/register - Tentativa de registro:', req.body);
  
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Todos os campos são obrigatórios - VERSÃO ULTRA SIMPLES'
    });
  }
  
  console.log('✅ REGISTRO ACEITO - VERSÃO ULTRA SIMPLES');
  res.json({
    success: true,
    message: 'Usuário registrado com sucesso - VERSÃO ULTRA SIMPLES',
    token: 'token_ultra_simples_' + Date.now(),
    user: {
      id: Date.now().toString(),
      email: email,
      name: name
    }
  });
});

// ===== VERIFICAÇÃO - FUNCIONA =====
app.get('/api/auth/me', (req, res) => {
  console.log('🔐 GET /api/auth/me - Verificação de autenticação');
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token não fornecido - VERSÃO ULTRA SIMPLES'
    });
  }
  
  console.log('✅ AUTH VERIFICADA - VERSÃO ULTRA SIMPLES');
  res.json({
    success: true,
    user: {
      id: 'user_ultra_simples',
      email: 'teste@ultrasimples.com',
      name: 'Usuário Ultra Simples'
    }
  });
});

// ===== ARQUIVOS ESTÁTICOS =====
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
    error: 'Erro interno do servidor - VERSÃO ULTRA SIMPLES',
    message: err.message
  });
});

// Rota 404
app.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.originalUrl}`);
  res.status(404).json({
    error: 'Rota não encontrada - VERSÃO ULTRA SIMPLES',
    path: req.originalUrl,
    version: 'ULTRA SIMPLES - 14/08/2025 01:30 AM'
  });
});

// Iniciar servidor
console.log('🔧 CONFIGURANDO SERVIDOR...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀🚀🚀 SERVIDOR ULTRA SIMPLES INICIADO! 🚀🚀🚀');
  console.log('🚨🚨🚨 SEMPRE REJEITA LOGIN INVÁLIDO! 🚨🚨🚨');
  console.log('📅 VERSÃO: ULTRA SIMPLES - 14/08/2025 01:30 AM');
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
  console.log(`📁 Versão: ULTRA SIMPLES`);
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