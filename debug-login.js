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

async function debugLogin() {
    try {
        const email = 'tavinmktdigital2@gmail.com';
        const password = '@Snow2012';
        
        console.log('🔍 Debugando login...');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
        console.log('🌐 MongoDB URI:', process.env.MONGODB_URI ? 'Configurado' : 'Não configurado');
        
        // 1. Verificar se o usuário existe
        console.log('\n1️⃣ Verificando se o usuário existe...');
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado!');
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log('   👤 Nome:', user.name);
        console.log('   📧 Email:', user.email);
        console.log('   🔐 Senha hash:', user.password ? 'Sim' : 'Não');
        console.log('   ✅ Ativo:', user.isActive);
        console.log('   👑 Admin:', user.isAdmin);
        console.log('   🎫 Tokens:', user.visionTokens);
        console.log('   📅 Criado em:', user.createdAt);
        
        // 2. Verificar se a senha está correta
        console.log('\n2️⃣ Verificando senha...');
        if (!user.password) {
            console.log('❌ Senha não encontrada no banco!');
            return;
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔑 Senha válida:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('❌ Senha incorreta! Vou corrigir...');
            
            // Recriar a senha
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            user.password = hashedPassword;
            await user.save();
            
            console.log('✅ Senha corrigida!');
            
            // Testar novamente
            const newUser = await User.findOne({ email }).select('+password');
            const newPasswordValid = await bcrypt.compare(password, newUser.password);
            console.log('🔑 Nova senha válida:', newPasswordValid);
        }
        
        // 3. Verificar se o usuário está ativo
        console.log('\n3️⃣ Verificando status do usuário...');
        if (!user.isActive) {
            console.log('❌ Usuário inativo! Ativando...');
            user.isActive = true;
            await user.save();
            console.log('✅ Usuário ativado!');
        }
        
        // 4. Simular o processo de login
        console.log('\n4️⃣ Simulando processo de login...');
        
        // Buscar usuário novamente (como o servidor faria)
        const loginUser = await User.findOne({ email }).select('+password');
        
        if (!loginUser) {
            console.log('❌ Erro: Usuário não encontrado durante login');
            return;
        }
        
        if (!loginUser.isActive) {
            console.log('❌ Erro: Usuário inativo');
            return;
        }
        
        const loginPasswordValid = await bcrypt.compare(password, loginUser.password);
        if (!loginPasswordValid) {
            console.log('❌ Erro: Senha inválida durante login');
            return;
        }
        
        console.log('✅ Login simulado com sucesso!');
        console.log('🎉 Usuário pronto para login!');
        
    } catch (error) {
        console.error('❌ Erro durante debug:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Conexão com MongoDB fechada');
    }
}

debugLogin();
