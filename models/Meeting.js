const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    meetingId: {
        type: String,
        required: true,
        unique: true,
        default: () => 'meet-' + Math.random().toString(36).substr(2, 9)
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    meetLink: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'ended'],
        default: 'active'
    },
    // Controle de acesso: criador + 1 pessoa adicional
    creatorIP: {
        type: String,
        required: true
    },
    additionalAccessIP: {
        type: String,
        default: null
    },
    accessCount: {
        type: Number,
        default: 0
    },
    // Controle de tempo
    startedAt: {
        type: Date,
        default: null
    },
    endedAt: {
        type: Date,
        default: null
    },
    linkExpiresAt: {
        type: Date,
        default: null // Será definido quando a reunião for encerrada
    },
    maxDuration: {
        type: Number,
        default: 20 * 60 * 1000 // 20 minutos em milissegundos (fallback)
    },
    videoDuration: {
        type: Number,
        default: null // Duração do vídeo em milissegundos
    },
    // Dados de integração (para reuniões criadas via API externa)
    integrationData: {
        tokenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'IntegrationToken'
        },
        origin: {
            type: String,
            trim: true
        },
        redirectUrl: {
            type: String,
            trim: true
        },
        customerInfo: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Método para verificar se um IP pode acessar a reunião
meetingSchema.methods.canAccess = function(ip) {
    // Se a reunião foi encerrada, ninguém pode acessar
    if (this.status === 'ended') {
        return false;
    }
    
    // Verificar se a reunião expirou por tempo
    if (this.startedAt && this.isExpired()) {
        this.status = 'ended';
        this.endedAt = new Date();
        return false;
    }
    
    // O criador sempre pode acessar
    if (ip === this.creatorIP) {
        return true;
    }
    
    // Se já existe um IP adicional autorizado, apenas ele pode acessar
    if (this.additionalAccessIP) {
        return ip === this.additionalAccessIP;
    }
    
    // Se não há IP adicional, qualquer IP diferente do criador pode ser o primeiro
    return ip !== this.creatorIP;
};

// Método para verificar se a reunião expirou por tempo
meetingSchema.methods.isExpired = function() {
    if (!this.startedAt) return false;
    
    const now = new Date();
    const elapsed = now.getTime() - this.startedAt.getTime();
    
    // Se temos a duração do vídeo, usar ela + 30 segundos de margem
    if (this.videoDuration) {
        const videoDurationWithMargin = this.videoDuration + (30 * 1000); // +30 segundos
        return elapsed >= videoDurationWithMargin;
    }
    
    // Caso contrário, usar a duração máxima padrão
    return elapsed >= this.maxDuration;
};

// Método para autorizar acesso de um novo IP
meetingSchema.methods.authorizeAccess = function(ip) {
    // Se é o criador, apenas incrementa o contador
    if (ip === this.creatorIP) {
        this.accessCount += 1;
        // Marcar início da reunião se for o primeiro acesso do criador
        if (!this.startedAt) {
            this.startedAt = new Date();
        }
        return { authorized: true, isCreator: true };
    }
    
    // Se já existe um IP adicional autorizado
    if (this.additionalAccessIP) {
        if (ip === this.additionalAccessIP) {
            this.accessCount += 1;
            // Marcar início da reunião se for o primeiro acesso
            if (!this.startedAt) {
                this.startedAt = new Date();
            }
            return { authorized: true, isCreator: false };
        } else {
            return { authorized: false, reason: 'Reunião já está sendo utilizada por outra pessoa' };
        }
    }
    
    // Se não há IP adicional, autoriza este IP
    this.additionalAccessIP = ip;
    this.accessCount += 1;
    // Marcar início da reunião
    if (!this.startedAt) {
        this.startedAt = new Date();
    }
    return { authorized: true, isCreator: false, isFirstAdditional: true };
};

// Método para encerrar a reunião
meetingSchema.methods.endMeeting = function() {
    this.status = 'ended';
    this.endedAt = new Date();
    // Definir expiração do link para 30 segundos após encerramento
    this.linkExpiresAt = new Date(this.endedAt.getTime() + (30 * 1000));
    // Resetar acesso para permitir novo cliente
    this.additionalAccessIP = null;
    this.accessCount = 0;
    return this.save();
};

// Método para atualizar a duração do vídeo
meetingSchema.methods.updateVideoDuration = function(durationMs) {
    this.videoDuration = durationMs;
    return this.save();
};

// Método para encerrar automaticamente quando o vídeo termina
meetingSchema.methods.endByVideoCompletion = function() {
    if (this.status === 'active') {
        this.status = 'ended';
        this.endedAt = new Date();
        // Definir expiração do link para 30 segundos após encerramento
        this.linkExpiresAt = new Date(this.endedAt.getTime() + (30 * 1000));
        // Resetar acesso para permitir novo cliente
        this.additionalAccessIP = null;
        this.accessCount = 0;
        return this.save();
    }
    return Promise.resolve(this);
};

module.exports = mongoose.model('Meeting', meetingSchema); 