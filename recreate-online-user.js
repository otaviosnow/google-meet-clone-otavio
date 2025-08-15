require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function recreateOnlineUser() {
    try {
        console.log('🔍 Conectando ao MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB Atlas!');

        // Deletar usuário existente
        await User.deleteOne({ email: 'teste90@gmail.com' });
        console.log('🗑️ Usuário anterior deletado');

        // Gerar hash da senha correta
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('Teste90!', salt);
        console.log('🔐 Hash gerado:', hashedPassword.substring(0, 20) + '...');

        // Criar novo usuário
        const newUser = new User({
            name: 'Teste 90',
            email: 'teste90@gmail.com',
            password: hashedPassword,
            isAdmin: true,
            isBanned: false,
            visionTokens: 1000,
            isActive: true
        });

        await newUser.save();
        console.log('✅ Usuário criado com sucesso!');

        // Verificar se a senha funciona
        const testUser = await User.findOne({ email: 'teste90@gmail.com' }).select('+password');
        const isValid = await bcrypt.compare('Teste90!', testUser.password);
        console.log('🧪 Teste de senha:', isValid ? '✅ VÁLIDA' : '❌ inválida');

        console.log('\n🔐 LOGIN DISPONÍVEL:');
        console.log('Email: teste90@gmail.com');
        console.log('Senha: Teste90!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

recreateOnlineUser();
