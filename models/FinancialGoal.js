const mongoose = require('mongoose');

const financialGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  monthlyGoal: {
    type: Number,
    default: 0,
    min: [0, 'Meta não pode ser negativa']
  },
  deadlineDate: {
    type: Date,
    required: [true, 'Data limite é obrigatória'],
    default: function() {
      // Por padrão, define como último dia do mês atual
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
  },
  currentMonth: {
    type: String, // Formato: "YYYY-MM"
    required: true
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
financialGoalSchema.index({ user: 1, currentMonth: 1 }, { unique: true });

module.exports = mongoose.model('FinancialGoal', financialGoalSchema);
