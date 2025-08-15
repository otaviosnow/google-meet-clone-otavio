const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const User = mongoose.model('User', userSchema);

async function checkAndFixUser() {
    try {
        const email = 'tavinmktdigital2@gmail.com';
        
        // Buscar usuário incluindo a senha
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado:', email);
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log('👤 Nome:', user.name);
        console.log('📧 Email:', user.email);
        console.log('🔐 Senha hash:', user.password ? 'Sim' : 'Não');
        console.log('✅ Ativo:', user.isActive);
        console.log('👑 Admin:', user.isAdmin);
        console.log('🎫 Tokens:', user.visionTokens);
        console.log('📅 Criado em:', user.createdAt);
        
        // Verificar se a senha está correta
        const testPassword = '@Snow2012';
        const isPasswordValid = await bcrypt.compare(testPassword, user.password);
        console.log('🔑 Senha válida:', isPasswordValid);
        
        // Se a senha não estiver válida, corrigir
        if (!isPasswordValid) {
            console.log('🛠️ Corrigindo senha...');
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
            user.password = hashedPassword;
            await user.save();
            console.log('✅ Senha corrigida!');
        }
        
        // Garantir que o usuário está ativo
        if (!user.isActive) {
            console.log('🛠️ Ativando usuário...');
            user.isActive = true;
            await user.save();
            console.log('✅ Usuário ativado!');
        }
        
        // Garantir que é admin
        if (!user.isAdmin) {
            console.log('🛠️ Definindo como admin...');
            user.isAdmin = true;
            await user.save();
            console.log('✅ Usuário definido como admin!');
        }
        
        console.log('\n🎉 Usuário verificado e corrigido com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Conexão com MongoDB fechada');
    }
}

checkAndFixUser();
