const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Middleware de autenticação compatível com o servidor principal
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Token inválido' });
        }
        req.user = { _id: decoded.userId };
        next();
    });
};

// Função para gerar token JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
};

const router = express.Router();

// Validações para registro
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
];

// Validações para login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Validações para recuperação de senha
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
];

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// POST /api/auth/register - Registrar novo usuário
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    console.log('📝 === INÍCIO DO REGISTRO ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🌐 IP:', req.ip || req.connection.remoteAddress);
    console.log('👤 User-Agent:', req.get('User-Agent'));
    
    const { name, email, password } = req.body;
    
    console.log('📋 Dados recebidos:');
    console.log('   👤 Nome:', name);
    console.log('   📧 Email:', email);
    console.log('   🔑 Senha:', password ? 'Fornecida' : 'Não fornecida');
    console.log('   📧 Email normalizado:', email ? email.toLowerCase().trim() : 'N/A');

    // Verificar se o email já existe
    console.log('\n🔍 Verificando se email já existe...');
    const existingUserByEmail = await User.findOne({ email });
    
    if (existingUserByEmail) {
      console.log('❌ Email já existe no banco:');
      console.log('   👤 Nome existente:', existingUserByEmail.name);
      console.log('   📧 Email existente:', existingUserByEmail.email);
      console.log('   ✅ Ativo:', existingUserByEmail.isActive);
      console.log('   👑 Admin:', existingUserByEmail.isAdmin);
      console.log('   📅 Criado em:', existingUserByEmail.createdAt);
      
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }
    

    
    console.log('✅ Email não existe, prosseguindo com registro...');

    // Criar novo usuário
    console.log('\n🆕 Criando novo usuário...');
    const user = new User({
      name,
      email,
      password
    });
    
    console.log('📋 Dados do usuário antes de salvar:');
    console.log('   👤 Nome:', user.name);
    console.log('   📧 Email:', user.email);
    console.log('   🔑 Senha hash:', user.password ? 'Sim' : 'Não');
    console.log('   ✅ Ativo:', user.isActive);
    console.log('   👑 Admin:', user.isAdmin);
    console.log('   🎫 Tokens:', user.visionTokens);

    // Salvar no banco de dados
    console.log('\n💾 Salvando no MongoDB...');
    await user.save();
    
    console.log('✅ Usuário salvo com sucesso!');
    console.log('🆔 ID gerado:', user._id);
    console.log('📅 Criado em:', user.createdAt);

    // Gerar token
    console.log('\n🎫 Gerando token JWT...');
    const token = generateToken(user._id);
    console.log('✅ Token gerado:', token ? 'Sim' : 'Não');

    // Verificar se o usuário foi realmente salvo no banco
    console.log('\n🔍 Verificando se usuário foi salvo no banco...');
    const savedUser = await User.findById(user._id);
    
    if (savedUser) {
      console.log('✅ Usuário confirmado no banco:');
      console.log('   👤 Nome:', savedUser.name);
      console.log('   📧 Email:', savedUser.email);
      console.log('   ✅ Ativo:', savedUser.isActive);
      console.log('   👑 Admin:', savedUser.isAdmin);
      console.log('   🎫 Tokens:', savedUser.visionTokens);
      console.log('   📅 Criado em:', savedUser.createdAt);
    } else {
      console.log('❌ ERRO: Usuário não encontrado no banco após salvar!');
    }

    // Contar total de usuários no banco
    const totalUsers = await User.countDocuments();
    console.log('📊 Total de usuários no banco:', totalUsers);

    // Retornar dados do usuário (sem senha) e token
    console.log('\n📤 Enviando resposta de sucesso...');
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: user.toPublicJSON(),
      token
    });
    
    console.log('✅ === REGISTRO CONCLUÍDO COM SUCESSO ===\n');

  } catch (error) {
    console.error('❌ === ERRO NO REGISTRO ===');
    console.error('📅 Timestamp:', new Date().toISOString());
    console.error('🌐 IP:', req.ip || req.connection.remoteAddress);
    console.error('📧 Email tentado:', req.body.email);
    console.error('👤 Nome tentado:', req.body.name);
    console.error('🔍 Tipo de erro:', error.name);
    console.error('📄 Mensagem:', error.message);
    console.error('📊 Stack:', error.stack);
    
    if (error.code === 11000) {
      console.error('❌ Erro de duplicação (código 11000)');
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }

    console.error('❌ === FIM DO ERRO ===\n');
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/login - Login do usuário
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    console.log('🔐 [AUTH-LOGIN] Iniciando login...');
    const { email, password } = req.body;
    console.log(`   - Email: ${email}`);
    console.log(`   - Senha: ${password ? 'Fornecida' : 'Não fornecida'}`);

    // Buscar usuário com senha
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ [AUTH-LOGIN] Usuário não encontrado');
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    console.log('✅ [AUTH-LOGIN] Usuário encontrado:');
    console.log(`   - ID: ${user._id}`);
    console.log(`   - Nome: ${user.name}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Tokens: ${user.visionTokens}`);
    console.log(`   - Admin: ${user.isAdmin}`);
    console.log(`   - Ativo: ${user.isActive}`);
    console.log(`   - Senha hash: ${user.password ? 'Presente' : 'Ausente'}`);

    if (!user.isActive) {
      console.log('❌ [AUTH-LOGIN] Usuário desativado');
      return res.status(401).json({
        error: 'Conta desativada'
      });
    }

    // Verificar senha
    console.log('🔐 [AUTH-LOGIN] Verificando senha...');
    const isPasswordValid = await user.comparePassword(password);
    console.log(`   - Senha válida: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      console.log('❌ [AUTH-LOGIN] Senha inválida');
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    // Atualizar último login
    console.log('📅 [AUTH-LOGIN] Atualizando último login...');
    await user.updateLastLogin();

    // Gerar token
    const token = generateToken(user._id);
    console.log('🎫 [AUTH-LOGIN] Token gerado');

    // Retornar dados do usuário e token
    const publicData = user.toPublicJSON();
    console.log('📤 [AUTH-LOGIN] Dados públicos:');
    console.log(`   - Tokens: ${publicData.visionTokens}`);
    console.log(`   - Admin: ${publicData.isAdmin}`);

    res.json({
      message: 'Login realizado com sucesso',
      user: publicData,
      token
    });
    
    console.log('✅ [AUTH-LOGIN] Login concluído com sucesso');

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/forgot-password - Solicitar recuperação de senha
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar usuário
    const user = await User.findOne({ email });
    
    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return res.json({
        message: 'Se o email existir, você receberá um link para redefinir sua senha'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        error: 'Conta desativada'
      });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no usuário
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Em produção, aqui você enviaria um email
    // Por enquanto, vamos retornar o token para teste
    res.json({
      message: 'Link de recuperação enviado para seu email',
      resetToken: resetToken, // Remover em produção
      resetUrl: `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`
    });

  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/reset-password - Redefinir senha
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, async (req, res) => {
  try {
    const { token, password } = req.body;

    // Buscar usuário pelo token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Token inválido ou expirado'
      });
    }

    // Atualizar senha
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/auth/me - Obter dados do usuário atual
router.get('/me', async (req, res) => {
  try {
    console.log('🔍 [AUTH-ME] Iniciando rota /me');
    
    // Pegar token do header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ [AUTH-ME] Token não fornecido');
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    // Verificar token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [AUTH-ME] Token válido, userId:', decoded.userId);
    
    // Buscar usuário
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ [AUTH-ME] Usuário não encontrado');
      return res.status(401).json({
        error: 'Usuário não encontrado'
      });
    }

    console.log('👤 [AUTH-ME] Usuário encontrado:');
    console.log('   - ID:', user._id);
    console.log('   - Nome:', user.name);
    console.log('   - Email:', user.email);
    console.log('   - Tokens (banco):', user.visionTokens);
    console.log('   - Admin:', user.isAdmin);
    console.log('   - Ativo:', user.isActive);

    if (!user.isActive) {
      console.log('❌ [AUTH-ME] Usuário desativado');
      return res.status(401).json({
        error: 'Usuário desativado'
      });
    }

    const publicData = user.toPublicJSON();
    console.log('📤 [AUTH-ME] Dados públicos:');
    console.log('   - Tokens (toPublicJSON):', publicData.visionTokens);

    res.json({
      user: publicData
    });
    
    console.log('✅ [AUTH-ME] Resposta enviada');

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/verify-admin - Verificar se usuário é admin
router.post('/verify-admin', async (req, res) => {
  try {
    console.log('🔐 [AUTH-VERIFY-ADMIN] Iniciando verificação de admin...');
    
    // Pegar token do header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ [AUTH-VERIFY-ADMIN] Token não fornecido');
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    // Verificar token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [AUTH-VERIFY-ADMIN] Token válido, userId:', decoded.userId);
    
    // Buscar usuário
    const user = await User.findById(decoded.userId).select('+password');
    
    if (!user) {
      console.log('❌ [AUTH-VERIFY-ADMIN] Usuário não encontrado');
      return res.status(401).json({
        error: 'Usuário não encontrado'
      });
    }

    console.log('👤 [AUTH-VERIFY-ADMIN] Usuário encontrado:');
    console.log('   - ID:', user._id);
    console.log('   - Nome:', user.name);
    console.log('   - Email:', user.email);
    console.log('   - Admin:', user.isAdmin);
    console.log('   - Ativo:', user.isActive);

    if (!user.isActive) {
      console.log('❌ [AUTH-VERIFY-ADMIN] Usuário desativado');
      return res.status(401).json({
        error: 'Usuário desativado'
      });
    }

    if (!user.isAdmin) {
      console.log('❌ [AUTH-VERIFY-ADMIN] Usuário não é admin');
      return res.status(403).json({
        error: 'Acesso negado - Usuário não é admin'
      });
    }

    // Verificar senha se fornecida
    const { password } = req.body;
    if (password) {
      console.log('🔐 [AUTH-VERIFY-ADMIN] Verificando senha...');
      const isPasswordValid = await user.comparePassword(password);
      console.log('   - Senha válida:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ [AUTH-VERIFY-ADMIN] Senha incorreta');
        return res.status(401).json({
          error: 'Senha incorreta'
        });
      }
    }

    console.log('✅ [AUTH-VERIFY-ADMIN] Verificação de admin bem-sucedida');
    res.json({
      message: 'Acesso admin confirmado',
      user: user.toPublicJSON()
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    console.error('Erro ao verificar admin:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/logout - Logout (opcional, pois o token é gerenciado no frontend)
router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout realizado com sucesso'
  });
});

module.exports = router; 