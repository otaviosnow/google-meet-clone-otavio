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
const FinancialHistory = require('../models/FinancialHistory');

const router = express.Router();

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  console.log('🔍 [VALIDAÇÃO] Verificando dados:', {
    body: req.body,
    url: req.url,
    method: req.method
  });
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ [VALIDAÇÃO] Erros encontrados:', errors.array());
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  console.log('✅ [VALIDAÇÃO] Dados válidos');
  next();
};

// Validações
const goalValidation = [
  body('monthlyGoal')
    .isFloat({ min: 0 })
    .withMessage('Meta deve ser um número positivo'),
  body('deadlineDate')
    .optional()
    .isISO8601()
    .withMessage('Data limite deve ser uma data válida')
];

const entryValidation = [
  body('date')
    .optional()
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

// GET /api/financial/goal - Obter meta atual
router.get('/goal', authenticateToken, async (req, res) => {
  console.log('🎯 [META] GET /goal - Usuário:', req.user._id);
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    console.log('📅 [META] Mês atual:', currentMonth);
    
    // Buscar meta do mês atual
    const goal = await FinancialGoal.findOne({ 
      user: req.user._id, 
      currentMonth 
    });
    
    console.log('📊 [META] Meta encontrada:', goal ? {
      monthlyGoal: goal.monthlyGoal,
      deadlineDate: goal.deadlineDate,
      currentMonth: goal.currentMonth
    } : 'Nenhuma meta encontrada');
    
    const response = {
      monthlyGoal: goal ? goal.monthlyGoal : 0,
      deadlineDate: goal ? goal.deadlineDate : null,
      currentMonth
    };
    
    console.log('✅ [META] Resposta enviada:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ [META] Erro ao obter meta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/financial/summary - Obter resumo financeiro do mês atual
router.get('/summary', authenticateToken, async (req, res) => {
  console.log('📊 [RESUMO] GET /summary - Usuário:', req.user._id);
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    console.log('📅 [RESUMO] Mês atual:', currentMonth);
    
    // Buscar meta do mês atual
    const goal = await FinancialGoal.findOne({ 
      user: req.user._id, 
      currentMonth 
    });
    
    console.log('🎯 [RESUMO] Meta encontrada:', goal ? {
      monthlyGoal: goal.monthlyGoal,
      deadlineDate: goal.deadlineDate
    } : 'Nenhuma meta encontrada');
    
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
    
    console.log('📝 [RESUMO] Entradas encontradas:', entries.length);
    
    // Calcular totais
    const totalRevenue = entries.reduce((sum, entry) => sum + entry.grossRevenue, 0);
    const totalExpenses = entries.reduce((sum, entry) => sum + entry.totalExpenses, 0);
    const totalProfit = entries.reduce((sum, entry) => sum + entry.netProfit, 0);
    
    // Calcular progresso da meta
    const monthlyGoal = goal ? goal.monthlyGoal : 0;
    const goalProgress = monthlyGoal > 0 ? Math.min((totalProfit / monthlyGoal) * 100, 100) : 0;
    
    // Calcular dias restantes baseado na data limite configurada
    let daysRemaining = null;
    if (goal && goal.deadlineDate) {
      const now = new Date();
      const deadline = new Date(goal.deadlineDate);
      const diffTime = deadline - now;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, daysRemaining); // Não pode ser negativo
      console.log('📅 [RESUMO] Dias restantes calculados:', {
        now: now.toISOString(),
        deadline: deadline.toISOString(),
        diffTime: diffTime,
        daysRemaining: daysRemaining
      });
    } else {
      console.log('⚠️ [RESUMO] Nenhuma data limite configurada');
    }
    
    const response = {
      monthlyGoal,
      deadlineDate: goal ? goal.deadlineDate : null,
      daysRemaining,
      totalRevenue,
      totalExpenses,
      totalProfit,
      goalProgress: Math.round(goalProgress * 100) / 100,
      entriesCount: entries.length
    };
    
    console.log('📊 [RESUMO] Valores calculados:', {
      monthlyGoal,
      totalRevenue,
      totalExpenses,
      totalProfit,
      goalProgress: Math.round(goalProgress * 100) / 100,
      daysRemaining,
      entriesCount: entries.length
    });
    
    console.log('✅ [RESUMO] Resposta enviada');
    res.json(response);
    
  } catch (error) {
    console.error('❌ [RESUMO] Erro ao obter resumo financeiro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/financial/goal - Definir meta mensal
router.post('/goal', authenticateToken, goalValidation, handleValidationErrors, async (req, res) => {
  console.log('🎯 [META] POST /goal - Usuário:', req.user._id);
  console.log('📝 [META] Dados recebidos:', req.body);
  
  try {
    const { monthlyGoal, deadlineDate } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Usar data padrão se deadlineDate não for fornecida
    const finalDeadlineDate = deadlineDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();
    
    console.log('📅 [META] Mês atual:', currentMonth);
    console.log('💰 [META] Meta mensal:', monthlyGoal);
    console.log('📅 [META] Data limite original:', deadlineDate);
    console.log('📅 [META] Data limite final:', finalDeadlineDate);
    
    // Buscar meta existente para calcular valores anteriores
    const existingGoal = await FinancialGoal.findOne({ user: req.user._id, currentMonth });
    console.log('🔍 [META] Meta existente:', existingGoal ? {
      monthlyGoal: existingGoal.monthlyGoal,
      deadlineDate: existingGoal.deadlineDate
    } : 'Nenhuma meta existente');
    
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
    
    console.log('📊 [META] Valores atuais:', {
      totalRevenue,
      totalExpenses,
      totalProfit,
      goalProgress: Math.round(goalProgress * 100) / 100,
      entriesCount: entries.length
    });
    
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
        deadlineDate: new Date(finalDeadlineDate)
      },
      { upsert: true, new: true }
    );
    
    console.log('💾 [META] Meta salva/criada:', {
      monthlyGoal: goal.monthlyGoal,
      currentMonth: goal.currentMonth,
      deadlineDate: goal.deadlineDate
    });
    
    // Calcular novos valores
    const newGoalProgress = goal.monthlyGoal > 0 ? Math.min((totalProfit / goal.monthlyGoal) * 100, 100) : 0;
    
    const newValues = {
      totalRevenue,
      totalExpenses,
      totalProfit,
      goalProgress: Math.round(newGoalProgress * 100) / 100
    };
    
    console.log('📈 [META] Novos valores calculados:', newValues);
    
    // Criar histórico
    const action = existingGoal ? 'update' : 'create';
    console.log('📝 [META] Criando histórico - Ação:', action);
    await FinancialHistory.createGoalHistory(req.user._id, goal, action, previousValues, newValues);
    console.log('✅ [META] Histórico criado com sucesso');
    
    const response = {
      message: 'Meta salva com sucesso',
      goal: {
        monthlyGoal: goal.monthlyGoal,
        currentMonth: goal.currentMonth,
        deadlineDate: goal.deadlineDate
      }
    };
    
    console.log('✅ [META] Resposta enviada:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ [META] Erro ao salvar meta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/financial/entry - Adicionar entrada diária
router.post('/entry', authenticateToken, entryValidation, handleValidationErrors, async (req, res) => {
  console.log('💰 [ENTRADA] POST /entry - Usuário:', req.user._id);
  console.log('📝 [ENTRADA] Dados recebidos:', req.body);
  
  try {
    const { date, grossRevenue, chipCost, additionalCost, adsCost, notes } = req.body;
    
    console.log('📅 [ENTRADA] Data:', date);
    console.log('💰 [ENTRADA] Valores:', {
      grossRevenue,
      chipCost,
      additionalCost,
      adsCost,
      notes: notes ? 'Sim' : 'Não'
    });
    
    // Verificar se já existe entrada para esta data
    const existingEntry = await FinancialEntry.findOne({
      user: req.user._id,
      date: new Date(date)
    });
    
    if (existingEntry) {
      console.log('⚠️ [ENTRADA] Entrada já existe para esta data, substituindo...');
      
      // Calcular valores anteriores para histórico
      const previousValues = {
        grossRevenue: existingEntry.grossRevenue,
        chipCost: existingEntry.chipCost,
        additionalCost: existingEntry.additionalCost,
        adsCost: existingEntry.adsCost,
        totalExpenses: existingEntry.totalExpenses,
        netProfit: existingEntry.netProfit,
        notes: existingEntry.notes
      };
      
      console.log('📊 [ENTRADA] Valores anteriores:', previousValues);
      
      // Atualizar entrada existente
      existingEntry.grossRevenue = grossRevenue || 0;
      existingEntry.chipCost = chipCost || 0;
      existingEntry.additionalCost = additionalCost || 0;
      existingEntry.adsCost = adsCost || 0;
      existingEntry.notes = notes;
      
      // Recalcular valores derivados
      existingEntry.totalExpenses = (chipCost || 0) + (additionalCost || 0) + (adsCost || 0);
      existingEntry.netProfit = (grossRevenue || 0) - existingEntry.totalExpenses;
      
      await existingEntry.save();
      
      console.log('✅ [ENTRADA] Entrada atualizada:', {
        id: existingEntry._id,
        date: existingEntry.date,
        grossRevenue: existingEntry.grossRevenue,
        chipCost: existingEntry.chipCost,
        additionalCost: existingEntry.additionalCost,
        adsCost: existingEntry.adsCost,
        totalExpenses: existingEntry.totalExpenses,
        netProfit: existingEntry.netProfit
      });
      
      // Registrar no histórico de modificações
      await FinancialHistory.createEntryHistory(req.user._id, existingEntry, 'update', previousValues);
      
      // Calcular novos totais do mês
      const startOfMonth = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 1);
      const endOfMonth = new Date(new Date(date).getFullYear(), new Date(date).getMonth() + 1, 0);
      
      const allEntries = await FinancialEntry.find({
        user: req.user._id,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const newTotalRevenue = allEntries.reduce((sum, entry) => sum + entry.grossRevenue, 0);
      const newTotalExpenses = allEntries.reduce((sum, entry) => sum + entry.totalExpenses, 0);
      const newTotalProfit = allEntries.reduce((sum, entry) => sum + entry.netProfit, 0);
      
      console.log('📈 [ENTRADA] Novos totais após atualização:', {
        totalRevenue: newTotalRevenue,
        totalExpenses: newTotalExpenses,
        totalProfit: newTotalProfit
      });
      
      res.json({
        message: 'Entrada atualizada com sucesso',
        entry: {
          id: existingEntry._id,
          date: existingEntry.date,
          grossRevenue: existingEntry.grossRevenue,
          chipCost: existingEntry.chipCost,
          additionalCost: existingEntry.additionalCost,
          adsCost: existingEntry.adsCost,
          totalExpenses: existingEntry.totalExpenses,
          netProfit: existingEntry.netProfit,
          notes: existingEntry.notes
        },
        totals: {
          totalRevenue: newTotalRevenue,
          totalExpenses: newTotalExpenses,
          totalProfit: newTotalProfit
        }
      });
      
      return;
    }
    
    console.log('✅ [ENTRADA] Nenhuma entrada existente encontrada para esta data');
    
    // Calcular valores anteriores
    const startOfMonth = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 1);
    const endOfMonth = new Date(new Date(date).getFullYear(), new Date(date).getMonth() + 1, 0);
    
    console.log('📅 [ENTRADA] Período de cálculo:', {
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString()
    });
    
    const existingEntries = await FinancialEntry.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    console.log('📊 [ENTRADA] Entradas existentes no mês:', existingEntries.length);
    
    const previousTotalRevenue = existingEntries.reduce((sum, entry) => sum + entry.grossRevenue, 0);
    const previousTotalExpenses = existingEntries.reduce((sum, entry) => sum + entry.totalExpenses, 0);
    const previousTotalProfit = existingEntries.reduce((sum, entry) => sum + entry.netProfit, 0);
    
    console.log('📈 [ENTRADA] Valores anteriores:', {
      totalRevenue: previousTotalRevenue,
      totalExpenses: previousTotalExpenses,
      totalProfit: previousTotalProfit
    });
    
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
    
    console.log('💾 [ENTRADA] Salvando nova entrada:', {
      date: entry.date,
      grossRevenue: entry.grossRevenue,
      chipCost: entry.chipCost,
      additionalCost: entry.additionalCost,
      adsCost: entry.adsCost,
      notes: entry.notes ? 'Sim' : 'Não'
    });
    
    await entry.save();
    console.log('✅ [ENTRADA] Entrada salva com sucesso - ID:', entry._id);
    
    // Registrar no histórico de modificações
    await FinancialHistory.createEntryHistory(req.user._id, entry, 'create', previousValues);
    
    // Calcular novos valores
    const newTotalRevenue = previousTotalRevenue + entry.grossRevenue;
    const newTotalExpenses = previousTotalExpenses + entry.totalExpenses;
    const newTotalProfit = previousTotalProfit + entry.netProfit;
    
    console.log('📊 [ENTRADA] Valores calculados da entrada:', {
      grossRevenue: entry.grossRevenue,
      totalExpenses: entry.totalExpenses,
      netProfit: entry.netProfit
    });
    
    // Calcular progresso da meta
    const currentMonth = new Date(date).toISOString().slice(0, 7);
    const goal = await FinancialGoal.findOne({ user: req.user._id, currentMonth });
    const goalProgress = goal && goal.monthlyGoal > 0 ? Math.min((newTotalProfit / goal.monthlyGoal) * 100, 100) : 0;
    
    console.log('🎯 [ENTRADA] Meta encontrada:', goal ? {
      monthlyGoal: goal.monthlyGoal,
      currentMonth: goal.currentMonth
    } : 'Nenhuma meta encontrada');
    
    const newValues = {
      totalRevenue: newTotalRevenue,
      totalExpenses: newTotalExpenses,
      totalProfit: newTotalProfit,
      goalProgress: Math.round(goalProgress * 100) / 100
    };
    
    console.log('📈 [ENTRADA] Novos valores totais:', newValues);
    
    // Criar histórico
    console.log('📝 [ENTRADA] Criando histórico da entrada');
    await FinancialHistory.createEntryHistory(req.user._id, entry, 'create', previousValues, newValues);
    console.log('✅ [ENTRADA] Histórico criado com sucesso');
    
    const response = {
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
    };
    
    console.log('✅ [ENTRADA] Resposta enviada:', response);
    res.status(201).json(response);
    
  } catch (error) {
    console.error('❌ [ENTRADA] Erro ao adicionar entrada:', error);
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
  console.log('🔄 [ATUALIZAR] PUT /entry/:id - Usuário:', req.user._id, 'ID:', req.params.id);
  console.log('📝 [ATUALIZAR] Dados recebidos:', req.body);
  
  try {
    const { grossRevenue, chipCost, additionalCost, adsCost, notes } = req.body;
    
    console.log('💰 [ATUALIZAR] Valores para atualizar:', {
      grossRevenue,
      chipCost,
      additionalCost,
      adsCost,
      notes: notes ? 'Sim' : 'Não'
    });
    
    const entry = await FinancialEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!entry) {
      console.log('❌ [ATUALIZAR] Entrada não encontrada - ID:', req.params.id);
      return res.status(404).json({
        error: 'Entrada não encontrada'
      });
    }
    
    console.log('✅ [ATUALIZAR] Entrada encontrada:', {
      id: entry._id,
      date: entry.date,
      grossRevenue: entry.grossRevenue,
      chipCost: entry.chipCost,
      additionalCost: entry.additionalCost,
      adsCost: entry.adsCost
    });
    
    // Calcular valores anteriores
    const startOfMonth = new Date(entry.date.getFullYear(), entry.date.getMonth(), 1);
    const endOfMonth = new Date(entry.date.getFullYear(), entry.date.getMonth() + 1, 0);
    
    console.log('📅 [ATUALIZAR] Período de cálculo:', {
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString()
    });
    
    const existingEntries = await FinancialEntry.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      _id: { $ne: entry._id } // Excluir a entrada atual
    });
    
    console.log('📊 [ATUALIZAR] Outras entradas no mês:', existingEntries.length);
    
    const previousTotalRevenue = existingEntries.reduce((sum, e) => sum + e.grossRevenue, 0) + entry.grossRevenue;
    const previousTotalExpenses = existingEntries.reduce((sum, e) => sum + e.totalExpenses, 0) + entry.totalExpenses;
    const previousTotalProfit = existingEntries.reduce((sum, e) => sum + e.netProfit, 0) + entry.netProfit;
    
    console.log('📈 [ATUALIZAR] Valores anteriores (incluindo entrada atual):', {
      totalRevenue: previousTotalRevenue,
      totalExpenses: previousTotalExpenses,
      totalProfit: previousTotalProfit
    });
    
    const previousValues = {
      totalRevenue: previousTotalRevenue,
      totalExpenses: previousTotalExpenses,
      totalProfit: previousTotalProfit,
      goalProgress: 0
    };
    
    // Atualizar entrada
    console.log('💾 [ATUALIZAR] Atualizando entrada com novos valores');
    entry.grossRevenue = grossRevenue || 0;
    entry.chipCost = chipCost || 0;
    entry.additionalCost = additionalCost || 0;
    entry.adsCost = adsCost || 0;
    entry.notes = notes;
    
    await entry.save();
    console.log('✅ [ATUALIZAR] Entrada atualizada com sucesso');
    
    // Calcular novos valores
    const newTotalRevenue = existingEntries.reduce((sum, e) => sum + e.grossRevenue, 0) + entry.grossRevenue;
    const newTotalExpenses = existingEntries.reduce((sum, e) => sum + e.totalExpenses, 0) + entry.totalExpenses;
    const newTotalProfit = existingEntries.reduce((sum, e) => sum + e.netProfit, 0) + entry.netProfit;
    
    console.log('📊 [ATUALIZAR] Valores calculados da entrada atualizada:', {
      grossRevenue: entry.grossRevenue,
      totalExpenses: entry.totalExpenses,
      netProfit: entry.netProfit
    });
    
    // Calcular progresso da meta
    const currentMonth = entry.date.toISOString().slice(0, 7);
    const goal = await FinancialGoal.findOne({ user: req.user._id, currentMonth });
    const goalProgress = goal && goal.monthlyGoal > 0 ? Math.min((newTotalProfit / goal.monthlyGoal) * 100, 100) : 0;
    
    console.log('🎯 [ATUALIZAR] Meta encontrada:', goal ? {
      monthlyGoal: goal.monthlyGoal,
      currentMonth: goal.currentMonth
    } : 'Nenhuma meta encontrada');
    
    const newValues = {
      totalRevenue: newTotalRevenue,
      totalExpenses: newTotalExpenses,
      totalProfit: newTotalProfit,
      goalProgress: Math.round(goalProgress * 100) / 100
    };
    
    console.log('📈 [ATUALIZAR] Novos valores totais:', newValues);
    
    // Criar histórico de atualização
    console.log('📝 [ATUALIZAR] Criando histórico da atualização');
    await FinancialHistory.createEntryHistory(req.user._id, entry, previousValues, newValues);
    console.log('✅ [ATUALIZAR] Histórico criado com sucesso');
    
    const response = {
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
    };
    
    console.log('✅ [ATUALIZAR] Resposta enviada:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ [ATUALIZAR] Erro ao atualizar entrada:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/financial/entry/:id - Deletar entrada
router.delete('/entry/:id', authenticateToken, async (req, res) => {
  console.log('🗑️ [DELETAR] DELETE /entry/:id - Usuário:', req.user._id, 'ID:', req.params.id);
  
  try {
    const entry = await FinancialEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!entry) {
      console.log('❌ [DELETAR] Entrada não encontrada - ID:', req.params.id);
      return res.status(404).json({
        error: 'Entrada não encontrada'
      });
    }
    
    console.log('✅ [DELETAR] Entrada encontrada:', {
      id: entry._id,
      date: entry.date,
      grossRevenue: entry.grossRevenue,
      netProfit: entry.netProfit
    });
    
    // Calcular valores anteriores (incluindo a entrada que será deletada)
    const startOfMonth = new Date(entry.date.getFullYear(), entry.date.getMonth(), 1);
    const endOfMonth = new Date(entry.date.getFullYear(), entry.date.getMonth() + 1, 0);
    
    const existingEntries = await FinancialEntry.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const previousTotalRevenue = existingEntries.reduce((sum, e) => sum + e.grossRevenue, 0);
    const previousTotalExpenses = existingEntries.reduce((sum, e) => sum + e.totalExpenses, 0);
    const previousTotalProfit = existingEntries.reduce((sum, e) => sum + e.netProfit, 0);
    
    const previousValues = {
      totalRevenue: previousTotalRevenue,
      totalExpenses: previousTotalExpenses,
      totalProfit: previousTotalProfit,
      goalProgress: 0
    };
    
    // Deletar entrada
    await FinancialEntry.findByIdAndDelete(entry._id);
    console.log('✅ [DELETAR] Entrada deletada com sucesso');
    
    // Calcular novos valores (sem a entrada deletada)
    const newTotalRevenue = previousTotalRevenue - entry.grossRevenue;
    const newTotalExpenses = previousTotalExpenses - entry.totalExpenses;
    const newTotalProfit = previousTotalProfit - entry.netProfit;
    
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
    
    console.log('📈 [DELETAR] Valores após deleção:', newValues);
    
    // Criar histórico da deleção
    console.log('📝 [DELETAR] Criando histórico da deleção');
    await FinancialHistory.createEntryHistory(req.user._id, entry, previousValues, newValues);
    console.log('✅ [DELETAR] Histórico criado com sucesso');
    
    res.json({
      message: 'Entrada deletada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ [DELETAR] Erro ao deletar entrada:', error);
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
