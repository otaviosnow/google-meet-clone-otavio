const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar ao MongoDB de produção
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

async function checkProductionUser() {
    try {
        const email = 'tavinmktdigital2@gmail.com';
        const password = '@Snow2012';
        
        console.log('🔍 Verificando usuário no banco de produção...');
        console.log('📧 Email:', email);
        console.log('🌐 MongoDB URI:', process.env.MONGODB_URI ? 'Configurado' : 'Não configurado');
        
        // Listar todos os usuários
        console.log('\n📋 Todos os usuários no banco:');
        const allUsers = await User.find({}).select('-password');
        
        if (allUsers.length === 0) {
            console.log('❌ Nenhum usuário encontrado no banco!');
        } else {
            allUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email}) - Ativo: ${user.isActive} - Admin: ${user.isAdmin}`);
            });
        }
        
        // Buscar usuário específico
        console.log('\n🔍 Buscando usuário específico...');
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado!');
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
        console.log('📅 Atualizado em:', user.updatedAt);
        
        // Testar senha
        if (user.password) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('🔑 Senha válida:', isPasswordValid);
            
            if (!isPasswordValid) {
                console.log('❌ Senha inválida! Vou corrigir...');
                
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
        } else {
            console.log('❌ Senha não encontrada!');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Conexão com MongoDB fechada');
    }
}

checkProductionUser();
