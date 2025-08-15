const mongoose = require('mongoose');

const financialEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  date: {
    type: Date,
    required: [true, 'Data é obrigatória']
  },
  grossRevenue: {
    type: Number,
    default: 0
  },
  chipCost: {
    type: Number,
    default: 0
  },
  additionalCost: {
    type: Number,
    default: 0
  },
  adsCost: {
    type: Number,
    default: 0
  },
  totalExpenses: {
    type: Number,
    default: 0
  },
  netProfit: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notas não podem ter mais de 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
financialEntrySchema.index({ user: 1, date: 1 }, { unique: true });
financialEntrySchema.index({ user: 1, createdAt: -1 });

// Middleware para calcular o lucro automaticamente
financialEntrySchema.pre('save', function(next) {
  // Garantir que os custos sejam sempre positivos (descontos)
  this.chipCost = Math.abs(this.chipCost || 0);
  this.additionalCost = Math.abs(this.additionalCost || 0);
  this.adsCost = Math.abs(this.adsCost || 0);
  
  // Calcular total de despesas
  this.totalExpenses = this.chipCost + this.additionalCost + this.adsCost;
  
  // Calcular lucro líquido (faturamento - despesas)
  this.netProfit = this.grossRevenue - this.totalExpenses;
  
  next();
});

module.exports = mongoose.model('FinancialEntry', financialEntrySchema);
