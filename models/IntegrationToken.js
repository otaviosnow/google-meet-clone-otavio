const mongoose = require('mongoose');
const crypto = require('crypto');

const integrationTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Descrição deve ter no máximo 200 caracteres']
    },
    website: {
        type: String,
        trim: true,
        maxlength: [200, 'Website deve ter no máximo 200 caracteres']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        default: null
    },
    usageCount: {
        type: Number,
        default: 0
    },
    allowedOrigins: [{
        type: String,
        trim: true
    }],
    webhookUrl: {
        type: String,
        trim: true
    },
    // Configuração de vídeos disponíveis para integração
    videos: [{
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, 'Nome do vídeo deve ter no máximo 50 caracteres']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Descrição do vídeo deve ter no máximo 200 caracteres']
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices para melhor performance
integrationTokenSchema.index({ user: 1, isActive: 1 });
integrationTokenSchema.index({ token: 1 }, { unique: true });
integrationTokenSchema.index({ createdAt: -1 });

// Middleware para gerar token único antes de salvar
integrationTokenSchema.pre('save', function(next) {
    if (this.isNew && !this.token) {
        // Gerar token único: prefixo + timestamp + random
        const prefix = 'int_';
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(8).toString('hex');
        this.token = `${prefix}${timestamp}_${random}`;
    }
    next();
});

// Método para incrementar uso
integrationTokenSchema.methods.incrementUsage = function() {
    this.usageCount += 1;
    this.lastUsed = new Date();
    return this.save();
};

// Método para validar origem
integrationTokenSchema.methods.isOriginAllowed = function(origin) {
    if (!this.allowedOrigins || this.allowedOrigins.length === 0) {
        return true; // Se não há restrições, permite qualquer origem
    }
    return this.allowedOrigins.some(allowedOrigin => {
        // Verificar se a origem corresponde (com suporte a wildcards)
        if (allowedOrigin === '*') return true;
        if (allowedOrigin.startsWith('*.')) {
            const domain = allowedOrigin.substring(2);
            return origin.endsWith(domain);
        }
        return origin === allowedOrigin;
    });
};

// Método para retornar dados públicos
integrationTokenSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        name: this.name,
        description: this.description,
        website: this.website,
        isActive: this.isActive,
        lastUsed: this.lastUsed,
        usageCount: this.usageCount,
        allowedOrigins: this.allowedOrigins,
        webhookUrl: this.webhookUrl,
        defaultVideo: this.defaultVideo,
        createdAt: this.createdAt
    };
};

// Método para retornar dados de integração (sem informações sensíveis)
integrationTokenSchema.methods.toIntegrationJSON = function() {
    return {
        id: this._id,
        name: this.name,
        description: this.description,
        website: this.website,
        isActive: this.isActive,
        lastUsed: this.lastUsed,
        usageCount: this.usageCount,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('IntegrationToken', integrationTokenSchema);
