const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

console.log('🚀 Iniciando servidor simples...');
console.log(`📊 Porta: ${PORT}`);

app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  console.log('📥 GET /');
  res.json({
    message: 'Servidor funcionando!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// API de teste
app.get('/api/test', (req, res) => {
  console.log('📥 GET /api/test');
  res.json({
    message: 'API funcionando!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// API de usuários
app.get('/api/users/stats', (req, res) => {
  console.log('📥 GET /api/users/stats');
  res.json({
    totalUsers: 1000,
    activeUsers: 50,
    success: true,
    port: PORT
  });
});

// API de login
app.post('/api/auth/login', (req, res) => {
  console.log('📥 POST /api/auth/login');
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email e senha são obrigatórios'
    });
  }
  
  // Simular validação
  if (email === 'teste@teste.com' && password === '123456') {
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: { email, name: 'Usuário Teste' }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Credenciais inválidas'
    });
  }
});

// API de registro
app.post('/api/auth/register', (req, res) => {
  console.log('📥 POST /api/auth/register');
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Todos os campos são obrigatórios'
    });
  }
  
  res.json({
    success: true,
    message: 'Usuário registrado com sucesso',
    user: { name, email }
  });
});

// Servir arquivos estáticos
app.use(express.static('public'));

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Servidor iniciado com sucesso!');
  console.log(`📱 Porta: ${PORT}`);
  console.log(`🌍 Host: 0.0.0.0`);
  console.log(`🚀 Pronto para receber conexões!`);
});

// Tratamento de erros
server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
});

process.on('SIGTERM', () => {
  console.log('🛑 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado.');
    process.exit(0);
  });
}); 