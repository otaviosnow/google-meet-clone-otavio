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

async function findSpecificUser() {
    try {
        const email = 'teste90@gmail.com';
        
        console.log('🔍 Buscando usuário específico...');
        console.log('📧 Email:', email);
        console.log('🌐 MongoDB URI:', process.env.MONGODB_URI ? 'Configurado' : 'Não configurado');
        
        // Buscar por email exato
        const user = await User.findOne({ email: email });
        
        if (!user) {
            console.log('❌ Usuário não encontrado com email exato');
            
            // Buscar por email parcial (case insensitive)
            console.log('\n🔍 Tentando busca case insensitive...');
            const userCaseInsensitive = await User.findOne({ 
                email: { $regex: new RegExp(email, 'i') } 
            });
            
            if (!userCaseInsensitive) {
                console.log('❌ Usuário não encontrado com busca case insensitive');
                
                // Listar todos os emails para verificar
                console.log('\n📋 Listando todos os emails no banco:');
                const allUsers = await User.find({}).select('email name createdAt');
                
                if (allUsers.length === 0) {
                    console.log('❌ Nenhum usuário encontrado no banco!');
                } else {
                    allUsers.forEach((user, index) => {
                        console.log(`${index + 1}. ${user.email} (${user.name}) - ${user.createdAt ? user.createdAt.toLocaleDateString('pt-BR') : 'N/A'}`);
                    });
                }
            } else {
                console.log('✅ Usuário encontrado com busca case insensitive:');
                console.log('👤 Nome:', userCaseInsensitive.name);
                console.log('📧 Email:', userCaseInsensitive.email);
                console.log('✅ Ativo:', userCaseInsensitive.isActive);
                console.log('👑 Admin:', userCaseInsensitive.isAdmin);
                console.log('🎫 Tokens:', userCaseInsensitive.visionTokens);
            }
        } else {
            console.log('✅ Usuário encontrado:');
            console.log('👤 Nome:', user.name);
            console.log('📧 Email:', user.email);
            console.log('✅ Ativo:', user.isActive);
            console.log('👑 Admin:', user.isAdmin);
            console.log('🎫 Tokens:', user.visionTokens);
            console.log('📅 Criado em:', user.createdAt ? user.createdAt.toLocaleDateString('pt-BR') : 'N/A');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Conexão com MongoDB fechada');
    }
}

findSpecificUser();

