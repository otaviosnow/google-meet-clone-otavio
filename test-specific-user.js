require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testSpecificUser() {
    try {
        console.log('🔍 Conectando ao MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB Atlas!');

        // Buscar usuário específico
        const user = await User.findOne({ email: 'teste90@gmail.com' }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado');
            return;
        }

        console.log('👤 Usuário encontrado:');
        console.log(`   Nome: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Admin: ${user.isAdmin}`);
        console.log(`   Password: ${user.password ? 'Sim' : 'Não'}`);
        
        if (user.password) {
            console.log(`   Hash: ${user.password}`);
            
            // Testar diferentes senhas
            const testPasswords = [
                'Teste90!',
                'Teste90',
                'teste90!',
                'teste90',
                'Admin123!',
                'admin123!'
            ];
            
            console.log('\n🔍 Testando senhas:');
            for (const testPass of testPasswords) {
                try {
                    const isValid = await bcrypt.compare(testPass, user.password);
                    console.log(`   ${testPass}: ${isValid ? '✅ VÁLIDA' : '❌ inválida'}`);
                } catch (error) {
                    console.log(`   ${testPass}: ❌ ERRO - ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

testSpecificUser();
