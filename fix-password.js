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
    visionTokens: { type: Number, default: 10 },
    avatar: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

async function fixPassword() {
    try {
        const email = 'tavinmktdigital2@gmail.com';
        const newPassword = '@Snow2012';
        
        // Buscar usuário incluindo a senha
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado:', email);
            return;
        }
        
        console.log('✅ Usuário encontrado:', user.name);
        console.log('📧 Email:', user.email);
        
        // Hash da nova senha
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Atualizar a senha
        user.password = hashedPassword;
        await user.save();
        
        console.log('✅ Senha atualizada com sucesso!');
        console.log('🔑 Nova senha:', newPassword);
        
        // Testar se a senha está funcionando
        const testUser = await User.findOne({ email }).select('+password');
        const isPasswordValid = await bcrypt.compare(newPassword, testUser.password);
        
        if (isPasswordValid) {
            console.log('✅ Teste de senha: PASSED');
        } else {
            console.log('❌ Teste de senha: FAILED');
        }
        
    } catch (error) {
        console.error('❌ Erro ao corrigir senha:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Conexão com MongoDB fechada');
    }
}

fixPassword();
