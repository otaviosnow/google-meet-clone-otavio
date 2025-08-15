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

async function createTeste90Admin() {
    try {
        const userData = {
            name: 'Teste 90',
            email: 'teste90@gmail.com',
            password: '123456', // Senha padrão, você pode alterar depois
            visionTokens: 10,
            isAdmin: true,
            isActive: true
        };
        
        console.log('👑 Criando usuário teste90@gmail.com como administrador...');
        console.log('📧 Email:', userData.email);
        console.log('🔑 Senha:', userData.password);
        
        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
            console.log('⚠️ Usuário já existe. Transformando em admin...');
            
            // Hash da senha
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            
            // Atualizar usuário
            existingUser.password = hashedPassword;
            existingUser.isActive = true;
            existingUser.isAdmin = true;
            existingUser.visionTokens = userData.visionTokens;
            
            await existingUser.save();
            
            console.log('✅ Usuário atualizado e transformado em administrador!');
        } else {
            console.log('🆕 Usuário não existe. Criando...');
            
            // Hash da senha
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            
            // Criar novo usuário
            const newUser = new User({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                visionTokens: userData.visionTokens,
                isAdmin: userData.isAdmin,
                isActive: userData.isActive
            });
            
            await newUser.save();
            
            console.log('✅ Usuário criado como administrador!');
        }
        
        // Verificar se foi criado/atualizado corretamente
        const finalUser = await User.findOne({ email: userData.email }).select('+password');
        console.log('\n📋 Dados finais do usuário:');
        console.log('👤 Nome:', finalUser.name);
        console.log('📧 Email:', finalUser.email);
        console.log('✅ Ativo:', finalUser.isActive);
        console.log('👑 Admin:', finalUser.isAdmin);
        console.log('🎫 Tokens:', finalUser.visionTokens);
        console.log('🔐 Senha hash:', finalUser.password ? 'Sim' : 'Não');
        
        // Testar a senha
        const isPasswordValid = await bcrypt.compare(userData.password, finalUser.password);
        console.log('🔑 Senha válida:', isPasswordValid);
        
        if (isPasswordValid) {
            console.log('\n🎉 Usuário teste90@gmail.com criado/atualizado com sucesso!');
            console.log('🔑 Credenciais de login:');
            console.log('   📧 Email: teste90@gmail.com');
            console.log('   🔑 Senha: 123456');
            console.log('   👑 Status: Administrador');
        } else {
            console.log('\n❌ Problema com a senha!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar/atualizar usuário:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Conexão com MongoDB fechada');
    }
}

createTeste90Admin();

