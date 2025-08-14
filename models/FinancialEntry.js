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
    default: 0,
    min: [0, 'Faturamento bruto não pode ser negativo']
  },
  chipCost: {
    type: Number,
    default: 0,
    min: [0, 'Custo com chip não pode ser negativo']
  },
  additionalCost: {
    type: Number,
    default: 0,
    min: [0, 'Custo adicional não pode ser negativo']
  },
  adsCost: {
    type: Number,
    default: 0,
    min: [0, 'Custo com ads não pode ser negativo']
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
  this.totalExpenses = this.chipCost + this.additionalCost + this.adsCost;
  this.netProfit = this.grossRevenue - this.totalExpenses;
  next();
});

module.exports = mongoose.model('FinancialEntry', financialEntrySchema);
