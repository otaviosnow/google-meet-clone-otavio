const mongoose = require('mongoose');
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

async function makeAdmin() {
    try {
        const email = 'teste90@gmail.com';
        
        console.log('👑 Transformando usuário em administrador...');
        console.log('📧 Email:', email);
        
        // Buscar usuário
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('❌ Usuário não encontrado:', email);
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log('👤 Nome:', user.name);
        console.log('📧 Email:', user.email);
        console.log('✅ Ativo:', user.isActive);
        console.log('👑 Admin atual:', user.isAdmin);
        console.log('🎫 Tokens:', user.visionTokens);
        
        // Transformar em admin
        if (!user.isAdmin) {
            user.isAdmin = true;
            await user.save();
            console.log('✅ Usuário transformado em administrador!');
        } else {
            console.log('ℹ️ Usuário já é administrador');
        }
        
        // Verificar resultado final
        const updatedUser = await User.findOne({ email });
        console.log('\n📋 Status final:');
        console.log('👤 Nome:', updatedUser.name);
        console.log('📧 Email:', updatedUser.email);
        console.log('✅ Ativo:', updatedUser.isActive);
        console.log('👑 Admin:', updatedUser.isAdmin);
        console.log('🎫 Tokens:', updatedUser.visionTokens);
        
        console.log('\n🎉 Processo concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Conexão com MongoDB fechada');
    }
}

makeAdmin();
