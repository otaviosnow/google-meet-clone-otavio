const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar ao MongoDB de produção
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Modelo de usuário EXATO como no servidor
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
        maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
        select: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    visionTokens: {
        type: Number,
        default: 10,
        min: [0, 'Tokens não podem ser negativos']
    },
    avatar: {
        type: String,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Middleware para hash da senha
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Erro ao comparar senhas');
    }
};

// Método para atualizar último login
userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    return await this.save();
};

// Método para retornar dados públicos
userSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        isActive: this.isActive,
        visionTokens: this.visionTokens,
        avatar: this.avatar,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// Índices
userSchema.index({ email: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

async function recreateUserExact() {
    try {
        const email = 'tavinmktdigital2@gmail.com';
        
        console.log('🔄 Recriando usuário com schema exato...');
        
        // Deletar usuário existente
        await User.deleteOne({ email });
        console.log('✅ Usuário deletado');
        
        // Criar novo usuário
        const newUser = new User({
            name: 'Otávio Henrique',
            email: email,
            password: '@Snow2012',
            visionTokens: 10,
            isActive: true
        });
        
        await newUser.save();
        console.log('✅ Usuário criado');
        
        // Verificar
        const createdUser = await User.findOne({ email }).select('+password');
        const isPasswordValid = await createdUser.comparePassword('@Snow2012');
        console.log('🔑 Senha válida:', isPasswordValid);
        
        if (isPasswordValid) {
            console.log('🎉 Usuário recriado com sucesso!');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        mongoose.connection.close();
    }
}

recreateUserExact();
