require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixAdminPasswordsFinal() {
    try {
        console.log('🔍 Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB!');

        // Lista de usuários admin com suas senhas
        const adminUsers = [
            { email: 'teste90@gmail.com', password: 'Teste90!' },
            { email: 'admin@callx.com', password: 'Admin123!' },
            { email: 'tavinmktdigital@gmail.com', password: 'Admin123!' },
            { email: 'teste2@gmail.com', password: 'Admin123!' }
        ];

        console.log('🔧 Corrigindo senhas dos usuários admin...\n');

        for (const adminUser of adminUsers) {
            console.log(`🔍 Processando: ${adminUser.email}`);
            
            // Gerar hash da senha
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(adminUser.password, salt);

            // Atualizar senha diretamente no banco (sem middleware)
            const result = await User.updateOne(
                { email: adminUser.email },
                { 
                    $set: { 
                        password: hashedPassword,
                        isAdmin: true,
                        isBanned: false
                    } 
                }
            );

            if (result.matchedCount > 0) {
                console.log(`✅ Senha atualizada: ${adminUser.password}`);
                console.log(`   - Hash: ${hashedPassword.substring(0, 20)}...`);
            } else {
                console.log('❌ Usuário não encontrado');
            }
        }

        console.log('\n🎉 Todas as senhas foram corrigidas!');
        console.log('\n🔐 LOGINS ADMIN DISPONÍVEIS:');
        console.log('=====================================');
        
        adminUsers.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   Senha: ${user.password}`);
            console.log('');
        });

        console.log('🌐 Teste no painel admin: http://localhost:10000/admin');
        console.log('🌐 Teste no sistema principal: http://localhost:10000');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

fixAdminPasswordsFinal();
