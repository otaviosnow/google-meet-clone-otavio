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

async function makeLatestAdmin() {
    try {
        console.log('👑 Transformando usuário mais recente em administrador...');
        
        // Buscar o usuário mais recente
        const latestUser = await User.findOne({}).sort({ createdAt: -1 });
        
        if (!latestUser) {
            console.log('❌ Nenhum usuário encontrado no banco!');
            return;
        }
        
        console.log('✅ Usuário mais recente encontrado:');
        console.log('👤 Nome:', latestUser.name);
        console.log('📧 Email:', latestUser.email);
        console.log('✅ Ativo:', latestUser.isActive);
        console.log('👑 Admin atual:', latestUser.isAdmin);
        console.log('🎫 Tokens:', latestUser.visionTokens);
        console.log('📅 Criado em:', latestUser.createdAt ? latestUser.createdAt.toLocaleDateString('pt-BR') : 'N/A');
        
        // Transformar em admin
        if (!latestUser.isAdmin) {
            latestUser.isAdmin = true;
            await latestUser.save();
            console.log('\n✅ Usuário transformado em administrador!');
        } else {
            console.log('\nℹ️ Usuário já é administrador');
        }
        
        // Verificar resultado final
        const updatedUser = await User.findById(latestUser._id);
        console.log('\n📋 Status final:');
        console.log('👤 Nome:', updatedUser.name);
        console.log('📧 Email:', updatedUser.email);
        console.log('✅ Ativo:', updatedUser.isActive);
        console.log('👑 Admin:', updatedUser.isAdmin);
        console.log('🎫 Tokens:', updatedUser.visionTokens);
        
        console.log('\n🎉 Processo concluído com sucesso!');
        console.log('🔑 Use este email para fazer login como administrador:', updatedUser.email);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Conexão com MongoDB fechada');
    }
}

makeLatestAdmin();
