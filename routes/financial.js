const express = require('express');
const { body, validationResult } = require('express-validator');
// Middleware de autenticação compatível com o servidor principal
const authenticateToken = (req, res, next) => {
    console.log('🔐 Middleware de autenticação - URL:', req.url, 'Método:', req.method);
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('❌ Token não fornecido');
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }

    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
        if (err) {
            console.log('❌ Token inválido:', err.message);
            return res.status(403).json({ success: false, error: 'Token inválido' });
        }
        req.user = { _id: decoded.userId };
        console.log('✅ Token válido - Usuário:', decoded.userId);
        next();
    });
};
const FinancialGoal = require('../models/FinancialGoal');
const FinancialEntry = require('../models/FinancialEntry');
const FinancialHistory = require('../models/FinancialHistory');

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
    .withMessage('Meta deve ser um número positivo'),
  body('deadlineDate')
    .isISO8601()
    .withMessage('Data limite deve ser uma data válida')
];

const entryValidation = [
  body('date')
    .isISO8601()
    .withMessage('Data inválida'),
  body('grossRevenue')
    .isFloat()
    .withMessage('Faturamento bruto deve ser um número válido'),
  body('chipCost')
    .isFloat()
    .withMessage('Custo com chip deve ser um número válido'),
  body('additionalCost')
    .isFloat()
    .withMessage('Custo adicional deve ser um número válido'),
  body('adsCost')
    .isFloat()
    .withMessage('Custo com ads deve ser um número válido')
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
    
    // Calcular dias restantes
    let daysRemaining = 0;
    if (goal && goal.deadlineDate) {
      const now = new Date();
      const deadline = new Date(goal.deadlineDate);
      const diffTime = deadline - now;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, daysRemaining); // Não pode ser negativo
    }
    
    res.json({
      monthlyGoal,
      deadlineDate: goal ? goal.deadlineDate : null,
      daysRemaining,
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
  console.log('🎯 POST /api/financial/goal - Rota acessada com sucesso');
  try {
    const { monthlyGoal, deadlineDate } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Buscar meta existente para calcular valores anteriores
    const existingGoal = await FinancialGoal.findOne({ user: req.user._id, currentMonth });
    
    // Calcular valores anteriores
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    
    const entries = await FinancialEntry.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const totalRevenue = entries.reduce((sum, entry) => sum + entry.grossRevenue, 0);
    const totalExpenses = entries.reduce((sum, entry) => sum + entry.totalExpenses, 0);
    const totalProfit = entries.reduce((sum, entry) => sum + entry.netProfit, 0);
    const goalProgress = existingGoal && existingGoal.monthlyGoal > 0 ? Math.min((totalProfit / existingGoal.monthlyGoal) * 100, 100) : 0;
    
    const previousValues = {
      totalRevenue,
      totalExpenses,
      totalProfit,
      goalProgress: Math.round(goalProgress * 100) / 100
    };
    
    // Buscar ou criar meta do mês atual
    const goal = await FinancialGoal.findOneAndUpdate(
      { user: req.user._id, currentMonth },
      { 
        monthlyGoal,
        deadlineDate: new Date(deadlineDate)
      },
      { upsert: true, new: true }
    );
    
    // Calcular novos valores
    const newGoalProgress = goal.monthlyGoal > 0 ? Math.min((totalProfit / goal.monthlyGoal) * 100, 100) : 0;
    
    const newValues = {
      totalRevenue,
      totalExpenses,
      totalProfit,
      goalProgress: Math.round(newGoalProgress * 100) / 100
    };
    
    // Criar histórico
    const action = existingGoal ? 'update' : 'create';
    await FinancialHistory.createGoalHistory(req.user._id, goal, action, previousValues, newValues);
    
    res.json({
      message: 'Meta salva com sucesso',
      goal: {
        monthlyGoal: goal.monthlyGoal,
        currentMonth: goal.currentMonth,
        deadlineDate: goal.deadlineDate
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
        error: 'Já existe uma entrada para esta data',
        existingEntry: {
          id: existingEntry._id,
          date: existingEntry.date,
          grossRevenue: existingEntry.grossRevenue,
          chipCost: existingEntry.chipCost,
          additionalCost: existingEntry.additionalCost,
          adsCost: existingEntry.adsCost,
          notes: existingEntry.notes
        }
      });
    }
    
    // Calcular valores anteriores
    const startOfMonth = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 1);
    const endOfMonth = new Date(new Date(date).getFullYear(), new Date(date).getMonth() + 1, 0);
    
    const existingEntries = await FinancialEntry.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const previousTotalRevenue = existingEntries.reduce((sum, entry) => sum + entry.grossRevenue, 0);
    const previousTotalExpenses = existingEntries.reduce((sum, entry) => sum + entry.totalExpenses, 0);
    const previousTotalProfit = existingEntries.reduce((sum, entry) => sum + entry.netProfit, 0);
    
    const previousValues = {
      totalRevenue: previousTotalRevenue,
      totalExpenses: previousTotalExpenses,
      totalProfit: previousTotalProfit,
      goalProgress: 0 // Será calculado após salvar
    };
    
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
    
    // Calcular novos valores
    const newTotalRevenue = previousTotalRevenue + entry.grossRevenue;
    const newTotalExpenses = previousTotalExpenses + entry.totalExpenses;
    const newTotalProfit = previousTotalProfit + entry.netProfit;
    
    // Calcular progresso da meta
    const currentMonth = new Date(date).toISOString().slice(0, 7);
    const goal = await FinancialGoal.findOne({ user: req.user._id, currentMonth });
    const goalProgress = goal && goal.monthlyGoal > 0 ? Math.min((newTotalProfit / goal.monthlyGoal) * 100, 100) : 0;
    
    const newValues = {
      totalRevenue: newTotalRevenue,
      totalExpenses: newTotalExpenses,
      totalProfit: newTotalProfit,
      goalProgress: Math.round(goalProgress * 100) / 100
    };
    
    // Criar histórico
    await FinancialHistory.createEntryHistory(req.user._id, entry, previousValues, newValues);
    
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

// PUT /api/financial/entry/:id - Atualizar entrada
router.put('/entry/:id', authenticateToken, entryValidation, handleValidationErrors, async (req, res) => {
  try {
    const { grossRevenue, chipCost, additionalCost, adsCost, notes } = req.body;
    
    const entry = await FinancialEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!entry) {
      return res.status(404).json({
        error: 'Entrada não encontrada'
      });
    }
    
    // Calcular valores anteriores
    const startOfMonth = new Date(entry.date.getFullYear(), entry.date.getMonth(), 1);
    const endOfMonth = new Date(entry.date.getFullYear(), entry.date.getMonth() + 1, 0);
    
    const existingEntries = await FinancialEntry.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      _id: { $ne: entry._id } // Excluir a entrada atual
    });
    
    const previousTotalRevenue = existingEntries.reduce((sum, e) => sum + e.grossRevenue, 0) + entry.grossRevenue;
    const previousTotalExpenses = existingEntries.reduce((sum, e) => sum + e.totalExpenses, 0) + entry.totalExpenses;
    const previousTotalProfit = existingEntries.reduce((sum, e) => sum + e.netProfit, 0) + entry.netProfit;
    
    const previousValues = {
      totalRevenue: previousTotalRevenue,
      totalExpenses: previousTotalExpenses,
      totalProfit: previousTotalProfit,
      goalProgress: 0
    };
    
    // Atualizar entrada
    entry.grossRevenue = grossRevenue || 0;
    entry.chipCost = chipCost || 0;
    entry.additionalCost = additionalCost || 0;
    entry.adsCost = adsCost || 0;
    entry.notes = notes;
    
    await entry.save();
    
    // Calcular novos valores
    const newTotalRevenue = existingEntries.reduce((sum, e) => sum + e.grossRevenue, 0) + entry.grossRevenue;
    const newTotalExpenses = existingEntries.reduce((sum, e) => sum + e.totalExpenses, 0) + entry.totalExpenses;
    const newTotalProfit = existingEntries.reduce((sum, e) => sum + e.netProfit, 0) + entry.netProfit;
    
    // Calcular progresso da meta
    const currentMonth = entry.date.toISOString().slice(0, 7);
    const goal = await FinancialGoal.findOne({ user: req.user._id, currentMonth });
    const goalProgress = goal && goal.monthlyGoal > 0 ? Math.min((newTotalProfit / goal.monthlyGoal) * 100, 100) : 0;
    
    const newValues = {
      totalRevenue: newTotalRevenue,
      totalExpenses: newTotalExpenses,
      totalProfit: newTotalProfit,
      goalProgress: Math.round(goalProgress * 100) / 100
    };
    
    // Criar histórico de atualização
    await FinancialHistory.createEntryHistory(req.user._id, entry, previousValues, newValues);
    
    res.json({
      message: 'Entrada atualizada com sucesso',
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
    console.error('Erro ao atualizar entrada:', error);
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

// GET /api/financial/modifications - Listar histórico de modificações
router.get('/modifications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, action } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { user: req.user._id };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (action && action !== 'all') {
      query.action = action;
    }
    
    const modifications = await FinancialHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedEntry', 'date grossRevenue netProfit')
      .populate('relatedGoal', 'monthlyGoal deadlineDate');
    
    const total = await FinancialHistory.countDocuments(query);
    
    res.json({
      modifications: modifications.map(mod => mod.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar modificações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
