const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Validações para atualização de perfil
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
];

// Validações para alteração de senha
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
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

// GET /api/users/profile - Obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/users/avatar - Atualizar avatar do usuário
router.put('/avatar', authenticateToken, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({
        error: 'Avatar é obrigatório'
      });
    }
    
    // Verificar se é uma data URL válida
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({
        error: 'Formato de imagem inválido'
      });
    }
    
    // Buscar usuário atual
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }
    
    // Atualizar avatar
    user.avatar = avatar;
    await user.save();
    
    res.json({
      message: 'Avatar atualizado com sucesso',
      avatar: user.avatar
    });
    
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/users/profile - Atualizar perfil do usuário
router.put('/profile', authenticateToken, updateProfileValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = req.user;

    // Verificar se o email já existe (se foi alterado)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: 'Email já está em uso'
        });
      }
      user.email = email;
    }

    // Atualizar nome se fornecido
    if (name) {
      user.name = name;
    }

    await user.save();

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    
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

// PUT /api/users/password - Alterar senha
router.put('/password', authenticateToken, changePasswordValidation, handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Buscar usuário com senha para verificação
    const userWithPassword = await User.findById(user._id).select('+password');

    // Verificar senha atual
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    res.json({
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/users/profile - Deletar conta
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Desativar usuário (soft delete)
    user.isActive = false;
    await user.save();

    res.json({
      message: 'Conta desativada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/users/stats - Obter estatísticas do usuário
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const Video = require('../models/Video');
    const Meeting = require('../models/Meeting');

    // Contar vídeos
    const totalVideos = await Video.countDocuments({ user: req.user._id });
    const activeVideos = await Video.countDocuments({ user: req.user._id, isActive: true });

    // Contar reuniões
    const totalMeetings = await Meeting.countDocuments({ user: req.user._id });
    const activeMeetings = await Meeting.countDocuments({ user: req.user._id, isActive: true });

    // Total de visualizações
    const totalVideoViews = await Video.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const totalMeetingViews = await Meeting.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const stats = {
      videos: {
        total: totalVideos,
        active: activeVideos
      },
      meetings: {
        total: totalMeetings,
        active: activeMeetings
      },
      views: {
        videos: totalVideoViews[0]?.total || 0,
        meetings: totalMeetingViews[0]?.total || 0,
        total: (totalVideoViews[0]?.total || 0) + (totalMeetingViews[0]?.total || 0)
      }
    };

    res.json({
      stats
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ===== ROTAS ADMIN =====

// Middleware para verificar se é admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado - Apenas administradores'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// GET /api/users/admin - Listar todos os usuários (admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('👑 [USERS-ADMIN] Listando usuários...');
    
    const users = await User.find({}).select('-password');
    
    console.log(`✅ [USERS-ADMIN] ${users.length} usuários encontrados`);
    
    res.json({
      users: users.map(user => user.toPublicJSON())
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/users/admin/:userId/ban - Banir usuário (admin)
router.post('/admin/:userId/ban', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🚫 [USERS-ADMIN] Banindo usuário...');
    
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ [USERS-ADMIN] Usuário não encontrado');
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }
    
    user.isActive = false;
    user.isBanned = true;
    await user.save();
    
    console.log('✅ [USERS-ADMIN] Usuário banido:', user.email);
    
    res.json({
      message: 'Usuário banido com sucesso',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao banir usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/users/admin/:userId - Editar usuário (admin)
router.put('/admin/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('✏️ [USERS-ADMIN] Editando usuário...');
    
    const { userId } = req.params;
    const { name, visionTokens, isAdmin, isActive } = req.body;
    
    console.log('📝 [USERS-ADMIN] Dados recebidos:', { userId, name, visionTokens, isAdmin, isActive });
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ [USERS-ADMIN] Usuário não encontrado');
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }
    
    // Atualizar campos
    if (name !== undefined) user.name = name;
    if (visionTokens !== undefined) user.visionTokens = parseInt(visionTokens);
    if (isAdmin !== undefined) user.isAdmin = isAdmin === 'true' || isAdmin === true;
    if (isActive !== undefined) user.isActive = isActive === 'true' || isActive === true;
    
    await user.save();
    
    console.log('✅ [USERS-ADMIN] Usuário atualizado:', user.email);
    
    res.json({
      message: 'Usuário atualizado com sucesso',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/users/admin/:userId - Deletar usuário (admin)
router.delete('/admin/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🗑️ [USERS-ADMIN] Deletando usuário...');
    
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ [USERS-ADMIN] Usuário não encontrado');
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }
    
    await User.findByIdAndDelete(userId);
    
    console.log('✅ [USERS-ADMIN] Usuário deletado:', user.email);
    
    res.json({
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 