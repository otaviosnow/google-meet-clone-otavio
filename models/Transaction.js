const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // ID do Mercado Pago
  mercadopagoId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Usuário que fez a compra
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Quantidade de tokens comprados
  tokens: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Valor em centavos (Mercado Pago usa centavos)
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Status da transação
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // Dados do PIX
  pix: {
    qrCode: String,
    qrCodeBase64: String,
    expiresAt: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  paidAt: {
    type: Date,
    default: null
  }
});

// Índices para performance
transactionSchema.index({ mercadopagoId: 1 });
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
