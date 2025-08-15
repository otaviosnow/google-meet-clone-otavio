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
    const { name, email, password } = req.body;

    // Verificar se o email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    // Retornar dados do usuário (sem senha) e token
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: user.toPublicJSON(),
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/login - Login do usuário
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário com senha
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Conta desativada'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    // Atualizar último login
    await user.updateLastLogin();

    // Gerar token
    const token = generateToken(user._id);

    // Retornar dados do usuário e token
    res.json({
      message: 'Login realizado com sucesso',
      user: user.toPublicJSON(),
      token
    });

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
    // Pegar token do header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    // Verificar token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Usuário desativado'
      });
    }

    res.json({
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

    console.error('Erro ao obter dados do usuário:', error);
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