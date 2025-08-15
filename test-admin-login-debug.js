require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testAdminLogin() {
    try {
        console.log('🔍 Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB!');

        // Testar diferentes usuários admin
        const testUsers = [
            { email: 'teste90@gmail.com', password: 'Teste90!' },
            { email: 'admin@callx.com', password: 'Admin123!' },
            { email: 'tavinmktdigital@gmail.com', password: 'Admin123!' },
            { email: 'teste2@gmail.com', password: 'Admin123!' }
        ];

        for (const testUser of testUsers) {
            console.log(`\n🔍 Testando login: ${testUser.email}`);
            
            // Buscar usuário no banco (incluindo password)
            const user = await User.findOne({ email: testUser.email }).select('+password');
            
            if (!user) {
                console.log('❌ Usuário não encontrado no banco');
                continue;
            }

            console.log('✅ Usuário encontrado:');
            console.log(`   - Nome: ${user.name}`);
            console.log(`   - Admin: ${user.isAdmin}`);
            console.log(`   - Banido: ${user.isBanned}`);
            console.log(`   - Tokens: ${user.visionTokens}`);
            console.log(`   - Password existe: ${user.password ? '✅ Sim' : '❌ Não'}`);

            if (!user.password) {
                console.log('❌ Usuário não tem senha definida');
                continue;
            }

            // Testar senha
            try {
                const isPasswordValid = await bcrypt.compare(testUser.password, user.password);
                console.log(`   - Senha válida: ${isPasswordValid ? '✅ Sim' : '❌ Não'}`);

                if (isPasswordValid) {
                    console.log('🎉 Login válido!');
                } else {
                    console.log('❌ Senha incorreta');
                    
                    // Mostrar hash da senha atual
                    console.log(`   - Hash atual: ${user.password.substring(0, 20)}...`);
                    
                    // Gerar hash da senha que deveria ser
                    const correctHash = await bcrypt.hash(testUser.password, 12);
                    console.log(`   - Hash correto: ${correctHash.substring(0, 20)}...`);
                }
            } catch (error) {
                console.log(`❌ Erro ao verificar senha: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

testAdminLogin();
