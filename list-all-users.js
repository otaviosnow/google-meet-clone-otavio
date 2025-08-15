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

async function listAllUsers() {
    try {
        console.log('📋 Listando todos os usuários no banco de dados...');
        console.log('🌐 MongoDB URI:', process.env.MONGODB_URI ? 'Configurado' : 'Não configurado');
        
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        
        if (users.length === 0) {
            console.log('❌ Nenhum usuário encontrado no banco!');
            return;
        }
        
        console.log(`\n✅ ${users.length} usuário(s) encontrado(s):\n`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. 👤 ${user.name}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   ✅ Ativo: ${user.isActive ? 'Sim' : 'Não'}`);
            console.log(`   👑 Admin: ${user.isAdmin ? 'Sim' : 'Não'}`);
            console.log(`   🎫 Tokens: ${user.visionTokens}`);
            console.log(`   📅 Criado: ${user.createdAt ? user.createdAt.toLocaleDateString('pt-BR') : 'N/A'}`);
            console.log(`   🔗 ID: ${user._id}`);
            console.log('---');
        });
        
        // Mostrar estatísticas
        const adminCount = users.filter(u => u.isAdmin).length;
        const activeCount = users.filter(u => u.isActive).length;
        
        console.log('\n📊 Estatísticas:');
        console.log(`👑 Administradores: ${adminCount}`);
        console.log(`✅ Usuários ativos: ${activeCount}`);
        console.log(`📧 Total de usuários: ${users.length}`);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Conexão com MongoDB fechada');
    }
}

listAllUsers();
