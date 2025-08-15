require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkOnlineUsers() {
    try {
        console.log('🔍 Conectando ao MongoDB Atlas (online)...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB Atlas!');

        // Buscar todos os usuários admin
        const adminUsers = await User.find({ isAdmin: true }).select('+password');
        
        console.log(`\n📊 Encontrados ${adminUsers.length} usuários admin:\n`);

        for (const user of adminUsers) {
            console.log(`👤 ${user.name}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🔑 Admin: ${user.isAdmin}`);
            console.log(`   🚫 Banido: ${user.isBanned}`);
            console.log(`   🎫 Tokens: ${user.visionTokens}`);
            console.log(`   📅 Criado: ${user.createdAt.toLocaleDateString('pt-BR')}`);
            console.log(`   🔐 Password: ${user.password ? '✅ Sim' : '❌ Não'}`);
            
            if (user.password) {
                console.log(`   🔒 Hash: ${user.password.substring(0, 20)}...`);
                
                // Testar senhas conhecidas
                const testPasswords = ['Teste90!', 'Admin123!'];
                for (const testPass of testPasswords) {
                    try {
                        const isValid = await bcrypt.compare(testPass, user.password);
                        if (isValid) {
                            console.log(`   ✅ Senha válida: ${testPass}`);
                        }
                    } catch (error) {
                        console.log(`   ❌ Erro ao testar senha: ${error.message}`);
                    }
                }
            }
            console.log('');
        }

        // Testar criação de hash
        console.log('🧪 Testando criação de hash...');
        const testPassword = 'Teste90!';
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(testPassword, salt);
        console.log(`   Senha: ${testPassword}`);
        console.log(`   Hash: ${hash.substring(0, 20)}...`);
        
        const isValid = await bcrypt.compare(testPassword, hash);
        console.log(`   Válido: ${isValid ? '✅ Sim' : '❌ Não'}`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

checkOnlineUsers();
