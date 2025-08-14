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
  revenue: {
    type: Number,
    default: 0,
    min: [0, 'Faturamento não pode ser negativo']
  },
  expenses: {
    type: Number,
    default: 0,
    min: [0, 'Gastos não podem ser negativos']
  },
  profit: {
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
  this.profit = this.revenue - this.expenses;
  next();
});

module.exports = mongoose.model('FinancialEntry', financialEntrySchema);
