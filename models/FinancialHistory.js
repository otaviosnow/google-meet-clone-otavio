const mongoose = require('mongoose');

const financialHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário é obrigatório']
    },
    type: {
        type: String,
        enum: ['entry', 'goal_update', 'goal_created', 'goal_deleted'],
        required: [true, 'Tipo de modificação é obrigatório']
    },
    action: {
        type: String,
        enum: ['add', 'subtract', 'update', 'create', 'delete'],
        required: [true, 'Ação é obrigatória']
    },
    description: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        trim: true,
        maxlength: [200, 'Descrição não pode ter mais de 200 caracteres']
    },
    // Dados da entrada financeira (se aplicável)
    entryData: {
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
        date: {
            type: Date,
            default: Date.now
        }
    },
    // Dados da meta (se aplicável)
    goalData: {
        targetAmount: {
            type: Number,
            default: 0
        },
        deadlineDate: {
            type: Date,
            default: null
        },
        description: {
            type: String,
            default: ''
        }
    },
    // Valores antes e depois da modificação
    previousValues: {
        totalRevenue: {
            type: Number,
            default: 0
        },
        totalExpenses: {
            type: Number,
            default: 0
        },
        totalProfit: {
            type: Number,
            default: 0
        },
        goalProgress: {
            type: Number,
            default: 0
        }
    },
    newValues: {
        totalRevenue: {
            type: Number,
            default: 0
        },
        totalExpenses: {
            type: Number,
            default: 0
        },
        totalProfit: {
            type: Number,
            default: 0
        },
        goalProgress: {
            type: Number,
            default: 0
        }
    },
    // Referência para a entrada ou meta relacionada
    relatedEntry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialEntry',
        default: null
    },
    relatedGoal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialGoal',
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
financialHistorySchema.index({ user: 1, createdAt: -1 });
financialHistorySchema.index({ user: 1, type: 1 });
financialHistorySchema.index({ user: 1, action: 1 });

// Método para criar histórico de entrada financeira
financialHistorySchema.statics.createEntryHistory = async function(userId, entry, action, previousValues, newValues) {
    try {
        console.log('📝 [HISTORY] Criando histórico de entrada - Dados recebidos:', {
            userId,
            entry: {
                grossRevenue: entry?.grossRevenue,
                chipCost: entry?.chipCost,
                additionalCost: entry?.additionalCost,
                adsCost: entry?.adsCost,
                totalExpenses: entry?.totalExpenses,
                netProfit: entry?.netProfit,
                date: entry?.date,
                _id: entry?._id
            },
            action,
            previousValues,
            newValues
        });
        
        const grossRevenue = entry?.grossRevenue || 0;
        let description = '';
        
        switch(action) {
            case 'create':
                description = `Adicionada entrada financeira: R$ ${grossRevenue.toFixed(2)} de receita bruta`;
                break;
            case 'update':
                description = `Atualizada entrada financeira: R$ ${grossRevenue.toFixed(2)} de receita bruta`;
                break;
            case 'delete':
                description = `Removida entrada financeira: R$ ${grossRevenue.toFixed(2)} de receita bruta`;
                break;
            default:
                description = `Modificada entrada financeira: R$ ${grossRevenue.toFixed(2)} de receita bruta`;
        }
        
        console.log('📝 [HISTORY] Descrição gerada:', description);
        
        const history = new this({
            user: userId,
            type: 'entry',
            action: action || 'add',
            description,
            entryData: {
                grossRevenue: grossRevenue,
                chipCost: entry?.chipCost || 0,
                additionalCost: entry?.additionalCost || 0,
                adsCost: entry?.adsCost || 0,
                totalExpenses: entry?.totalExpenses || 0,
                netProfit: entry?.netProfit || 0,
                date: entry?.date || new Date()
            },
            previousValues: previousValues || {},
            newValues: newValues || {},
            relatedEntry: entry?._id
        });
        
        console.log('📝 [HISTORY] Histórico criado, salvando...');
        const savedHistory = await history.save();
        console.log('✅ [HISTORY] Histórico salvo com sucesso:', savedHistory._id);
        
        return savedHistory;
    } catch (error) {
        console.error('❌ [HISTORY] Erro ao criar histórico:', error);
        console.error('❌ [HISTORY] Detalhes do erro:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        throw error;
    }
};

// Método para criar histórico de atualização de meta
financialHistorySchema.statics.createGoalHistory = async function(userId, goal, action, previousValues, newValues) {
    console.log('📝 [HISTORY] Criando histórico de meta - Dados recebidos:', {
        userId,
        goal: {
            targetAmount: goal?.targetAmount,
            deadlineDate: goal?.deadlineDate,
            description: goal?.description,
            _id: goal?._id
        },
        action,
        previousValues,
        newValues
    });
    
    let description = '';
    const targetAmount = goal?.targetAmount || 0;
    const deadlineDate = goal?.deadlineDate;
    
    switch(action) {
        case 'create':
            description = `Meta criada: R$ ${targetAmount.toFixed(2)}${deadlineDate ? ` até ${new Date(deadlineDate).toLocaleDateString('pt-BR')}` : ''}`;
            break;
        case 'update':
            description = `Meta atualizada: R$ ${targetAmount.toFixed(2)}${deadlineDate ? ` até ${new Date(deadlineDate).toLocaleDateString('pt-BR')}` : ''}`;
            break;
        case 'delete':
            description = `Meta deletada: R$ ${targetAmount.toFixed(2)}`;
            break;
    }
    
    console.log('📝 [HISTORY] Descrição gerada:', description);
    
    const history = new this({
        user: userId,
        type: action === 'create' ? 'goal_created' : action === 'delete' ? 'goal_deleted' : 'goal_update',
        action,
        description,
        goalData: {
            targetAmount: targetAmount,
            deadlineDate: deadlineDate,
            description: goal?.description || ''
        },
        previousValues: previousValues || {},
        newValues: newValues || {},
        relatedGoal: goal?._id
    });
    
    console.log('📝 [HISTORY] Histórico criado, salvando...');
    const savedHistory = await history.save();
    console.log('✅ [HISTORY] Histórico salvo com sucesso:', savedHistory._id);
    
    return savedHistory;
};

// Método para retornar dados públicos do histórico
financialHistorySchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        type: this.type,
        action: this.action,
        description: this.description,
        entryData: this.entryData,
        goalData: this.goalData,
        previousValues: this.previousValues,
        newValues: this.newValues,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('FinancialHistory', financialHistorySchema);
