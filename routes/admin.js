const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Meeting = require('../models/Meeting');

const router = express.Router();

// Middleware para verificar se o usuário é admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado. Privilégios administrativos necessários.'
      });
    }
    next();
  } catch (error) {
    console.error('Erro ao verificar privilégios admin:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

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

// Validações para gerenciamento de tokens
const tokenValidation = [
  body('action')
    .isIn(['add', 'remove', 'set'])
    .withMessage('Ação deve ser: add, remove ou set'),
  body('amount')
    .isInt({ min: 0 })
    .withMessage('Quantidade deve ser um número inteiro positivo')
];

// Validações para banir/desbanir usuário
const banValidation = [
  body('isBanned')
    .isBoolean()
    .withMessage('isBanned deve ser true ou false')
];

// GET /api/admin/users - Listar todos os usuários
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .lean();

    // Contar reuniões para cada usuário
    const usersWithMeetings = await Promise.all(
      users.map(async (user) => {
        const meetingsCount = await Meeting.countDocuments({ user: user._id });
        return {
          ...user,
          meetingsCount
        };
      })
    );

    res.json({
      users: usersWithMeetings
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/stats - Estatísticas gerais
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Total de usuários
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ isBanned: { $ne: true } });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const adminUsers = await User.countDocuments({ isAdmin: true });

    // Total de tokens
    const tokensResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$visionTokens' } } }
    ]);
    const totalTokens = tokensResult[0]?.total || 0;

    // Total de reuniões
    const totalMeetings = await Meeting.countDocuments({});

    const stats = {
      totalUsers,
      activeUsers,
      bannedUsers,
      adminUsers,
      totalTokens,
      totalMeetings
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

// PUT /api/admin/:id/tokens - Gerenciar tokens de um usuário
router.put('/:id/tokens', authenticateToken, requireAdmin, tokenValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, amount } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    let newTokenCount = user.visionTokens || 0;

    switch (action) {
      case 'add':
        newTokenCount += amount;
        break;
      case 'remove':
        newTokenCount = Math.max(0, newTokenCount - amount);
        break;
      case 'set':
        newTokenCount = amount;
        break;
    }

    user.visionTokens = newTokenCount;
    await user.save();

    res.json({
      message: `Tokens ${action === 'add' ? 'adicionados' : action === 'remove' ? 'removidos' : 'definidos'} com sucesso`,
      userId: user._id,
      newTokenCount: user.visionTokens
    });

  } catch (error) {
    console.error('Erro ao gerenciar tokens:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/admin/:id/ban - Banir/desbanir usuário
router.put('/:id/ban', authenticateToken, requireAdmin, banValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Não permitir banir administradores
    if (user.isAdmin) {
      return res.status(400).json({
        error: 'Não é possível banir administradores'
      });
    }

    user.isBanned = isBanned;
    await user.save();

    res.json({
      message: `Usuário ${isBanned ? 'banido' : 'desbanido'} com sucesso`,
      userId: user._id,
      isBanned: user.isBanned
    });

  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/admin/:id - Deletar usuário
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Não permitir deletar administradores
    if (user.isAdmin) {
      return res.status(400).json({
        error: 'Não é possível deletar administradores'
      });
    }

    // Deletar reuniões do usuário
    await Meeting.deleteMany({ user: user._id });

    // Deletar vídeos do usuário (se existir modelo Video)
    try {
      const Video = require('../models/Video');
      await Video.deleteMany({ user: user._id });
    } catch (error) {
      console.log('Modelo Video não encontrado, pulando...');
    }

    // Deletar entradas financeiras (se existir modelo FinancialEntry)
    try {
      const FinancialEntry = require('../models/FinancialEntry');
      await FinancialEntry.deleteMany({ user: user._id });
    } catch (error) {
      console.log('Modelo FinancialEntry não encontrado, pulando...');
    }

    // Deletar metas financeiras (se existir modelo FinancialGoal)
    try {
      const FinancialGoal = require('../models/FinancialGoal');
      await FinancialGoal.deleteMany({ user: user._id });
    } catch (error) {
      console.log('Modelo FinancialGoal não encontrado, pulando...');
    }

    // Deletar o usuário
    await User.findByIdAndDelete(id);

    res.json({
      message: 'Usuário e todos os dados relacionados deletados com sucesso',
      userId: id
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/users/:id - Obter detalhes de um usuário específico
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Contar reuniões do usuário
    const meetingsCount = await Meeting.countDocuments({ user: id });

    // Obter reuniões recentes
    const recentMeetings = await Meeting.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const userDetails = {
      ...user.toObject(),
      meetingsCount,
      recentMeetings
    };

    res.json({
      user: userDetails
    });

  } catch (error) {
    console.error('Erro ao obter detalhes do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
