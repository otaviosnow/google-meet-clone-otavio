const express = require('express');
const { body, validationResult } = require('express-validator');
// Middleware de autenticação compatível com o servidor principal
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }

    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Token inválido' });
        }
        req.user = { _id: decoded.userId };
        next();
    });
};
const FinancialGoal = require('../models/FinancialGoal');
const FinancialEntry = require('../models/FinancialEntry');

const router = express.Router();

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

// Validações
const goalValidation = [
  body('monthlyGoal')
    .isFloat({ min: 0 })
    .withMessage('Meta deve ser um número positivo')
];

const entryValidation = [
  body('date')
    .isISO8601()
    .withMessage('Data inválida'),
  body('grossRevenue')
    .isFloat({ min: 0 })
    .withMessage('Faturamento bruto deve ser um número positivo'),
  body('chipCost')
    .isFloat({ min: 0 })
    .withMessage('Custo com chip deve ser um número positivo'),
  body('additionalCost')
    .isFloat({ min: 0 })
    .withMessage('Custo adicional deve ser um número positivo'),
  body('adsCost')
    .isFloat({ min: 0 })
    .withMessage('Custo com ads deve ser um número positivo')
];

// GET /api/financial/summary - Obter resumo financeiro do mês atual
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Buscar meta do mês atual
    const goal = await FinancialGoal.findOne({ 
      user: req.user._id, 
      currentMonth 
    });
    
    // Buscar entradas do mês atual
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    
    const entries = await FinancialEntry.find({
      user: req.user._id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    // Calcular totais
    const totalRevenue = entries.reduce((sum, entry) => sum + entry.grossRevenue, 0);
    const totalExpenses = entries.reduce((sum, entry) => sum + entry.totalExpenses, 0);
    const totalProfit = entries.reduce((sum, entry) => sum + entry.netProfit, 0);
    
    // Calcular progresso da meta
    const monthlyGoal = goal ? goal.monthlyGoal : 0;
    const goalProgress = monthlyGoal > 0 ? Math.min((totalProfit / monthlyGoal) * 100, 100) : 0;
    
    res.json({
      monthlyGoal,
      totalRevenue,
      totalExpenses,
      totalProfit,
      goalProgress: Math.round(goalProgress * 100) / 100,
      entriesCount: entries.length
    });
    
  } catch (error) {
    console.error('Erro ao obter resumo financeiro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/financial/goal - Definir meta mensal
router.post('/goal', authenticateToken, goalValidation, handleValidationErrors, async (req, res) => {
  try {
    const { monthlyGoal } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Buscar ou criar meta do mês atual
    const goal = await FinancialGoal.findOneAndUpdate(
      { user: req.user._id, currentMonth },
      { monthlyGoal },
      { upsert: true, new: true }
    );
    
    res.json({
      message: 'Meta salva com sucesso',
      goal: {
        monthlyGoal: goal.monthlyGoal,
        currentMonth: goal.currentMonth
      }
    });
    
  } catch (error) {
    console.error('Erro ao salvar meta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/financial/entry - Adicionar entrada diária
router.post('/entry', authenticateToken, entryValidation, handleValidationErrors, async (req, res) => {
  try {
    const { date, grossRevenue, chipCost, additionalCost, adsCost, notes } = req.body;
    
    // Verificar se já existe entrada para esta data
    const existingEntry = await FinancialEntry.findOne({
      user: req.user._id,
      date: new Date(date)
    });
    
    if (existingEntry) {
      return res.status(400).json({
        error: 'Já existe uma entrada para esta data'
      });
    }
    
    // Criar nova entrada
    const entry = new FinancialEntry({
      user: req.user._id,
      date: new Date(date),
      grossRevenue: grossRevenue || 0,
      chipCost: chipCost || 0,
      additionalCost: additionalCost || 0,
      adsCost: adsCost || 0,
      notes
    });
    
    await entry.save();
    
    res.status(201).json({
      message: 'Entrada adicionada com sucesso',
      entry: {
        id: entry._id,
        date: entry.date,
        grossRevenue: entry.grossRevenue,
        chipCost: entry.chipCost,
        additionalCost: entry.additionalCost,
        adsCost: entry.adsCost,
        totalExpenses: entry.totalExpenses,
        netProfit: entry.netProfit,
        notes: entry.notes
      }
    });
    
  } catch (error) {
    console.error('Erro ao adicionar entrada:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/financial/entries - Listar entradas do mês
router.get('/entries', authenticateToken, async (req, res) => {
  try {
    const { month } = req.query;
    let startOfMonth, endOfMonth;
    
    if (month) {
      // Mês específico (formato: YYYY-MM)
      const [year, monthNum] = month.split('-');
      startOfMonth = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0);
    } else {
      // Mês atual
      startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    }
    
    const entries = await FinancialEntry.find({
      user: req.user._id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).sort({ date: -1 });
    
    res.json({
      entries: entries.map(entry => ({
        id: entry._id,
        date: entry.date,
        grossRevenue: entry.grossRevenue,
        chipCost: entry.chipCost,
        additionalCost: entry.additionalCost,
        adsCost: entry.adsCost,
        totalExpenses: entry.totalExpenses,
        netProfit: entry.netProfit,
        notes: entry.notes
      }))
    });
    
  } catch (error) {
    console.error('Erro ao listar entradas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/financial/history - Obter histórico financeiro
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    let query = { user: req.user._id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (type && type !== 'all') {
      // Filtrar por tipo se especificado
      if (type === 'revenue') {
        query.grossRevenue = { $gt: 0 };
      } else if (type === 'expenses') {
        query.totalExpenses = { $gt: 0 };
      }
    }
    
    const entries = await FinancialEntry.find(query).sort({ date: -1 });
    
    res.json({
      entries: entries.map(entry => ({
        id: entry._id,
        date: entry.date,
        grossRevenue: entry.grossRevenue,
        chipCost: entry.chipCost,
        additionalCost: entry.additionalCost,
        adsCost: entry.adsCost,
        totalExpenses: entry.totalExpenses,
        netProfit: entry.netProfit,
        notes: entry.notes
      }))
    });
    
  } catch (error) {
    console.error('Erro ao obter histórico financeiro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/financial/entry/:id - Deletar entrada
router.delete('/entry/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await FinancialEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!entry) {
      return res.status(404).json({
        error: 'Entrada não encontrada'
      });
    }
    
    res.json({
      message: 'Entrada deletada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar entrada:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
