const mongoose = require('mongoose');

const tokenUsageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: true
    },
    tokensUsed: {
        type: Number,
        required: true,
        default: 2 // Cada reunião consome 2 tokens
    },
    action: {
        type: String,
        enum: ['meeting_created', 'meeting_joined'],
        default: 'meeting_created'
    },
    description: {
        type: String,
        default: 'Criação de reunião'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices para melhor performance
tokenUsageSchema.index({ user: 1, createdAt: -1 });
tokenUsageSchema.index({ meeting: 1 });
tokenUsageSchema.index({ createdAt: 1 });

// Método para retornar dados públicos
tokenUsageSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        userId: this.user,
        meetingId: this.meeting,
        tokensUsed: this.tokensUsed,
        action: this.action,
        description: this.description,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('TokenUsage', tokenUsageSchema);
