const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    tokens: {
        type: Number,
        required: true,
        min: 1
    },
    paymentMethod: {
        type: String,
        enum: ['pix', 'credit_card', 'debit_card'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'cancelled'],
        default: 'pending'
    },
    pagarmeId: {
        type: String,
        default: null
    },
    pagarmeStatus: {
        type: String,
        default: null
    },
    pixCode: {
        type: String,
        default: null
    },
    pixQrCode: {
        type: String,
        default: null
    },
    expiresAt: {
        type: Date,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices para melhor performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ pagarmeId: 1 });

// Método para retornar dados públicos
transactionSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        amount: this.amount,
        tokens: this.tokens,
        paymentMethod: this.paymentMethod,
        status: this.status,
        pixCode: this.pixCode,
        pixQrCode: this.pixQrCode,
        expiresAt: this.expiresAt,
        paidAt: this.paidAt,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('Transaction', transactionSchema);
