const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Modelo de usuário
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    visionTokens: { type: Number, default: 10 },
    avatar: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: { type: Boolean, default: false }
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

const User = mongoose.model('User', userSchema);

// Função para gerar token JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
};

async function testAuthRoute() {
    try {
        const email = 'tavinmktdigital2@gmail.com';
        const password = '@Snow2012';
        
        console.log('🧪 Testando rota de autenticação...');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
        
        // Simular o processo exato da rota de login
        console.log('\n1️⃣ Buscando usuário...');
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado');
            return;
        }
        
        console.log('✅ Usuário encontrado:', user.name);
        console.log('✅ Usuário ativo:', user.isActive);
        
        console.log('\n2️⃣ Verificando senha com comparePassword...');
        const isPasswordValid = await user.comparePassword(password);
        console.log('🔑 Senha válida:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('❌ Senha inválida');
            return;
        }
        
        console.log('\n3️⃣ Atualizando último login...');
        await user.updateLastLogin();
        console.log('✅ Último login atualizado');
        
        console.log('\n4️⃣ Gerando token...');
        const token = generateToken(user._id);
        console.log('🎫 Token gerado:', token ? 'Sim' : 'Não');
        
        console.log('\n5️⃣ Preparando resposta...');
        const response = {
            message: 'Login realizado com sucesso',
            user: user.toPublicJSON(),
            token
        };
        
        console.log('📄 Resposta preparada:', {
            message: response.message,
            user: {
                id: response.user.id,
                name: response.user.name,
                email: response.user.email
            },
            token: response.token ? 'Presente' : 'Ausente'
        });
        
        console.log('\n🎉 Teste da rota de autenticação concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante teste:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Conexão com MongoDB fechada');
    }
}

testAuthRoute();
