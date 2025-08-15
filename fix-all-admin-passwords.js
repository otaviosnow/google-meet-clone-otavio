require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixAdminPasswords() {
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
            
            // Buscar usuário no banco
            const user = await User.findOne({ email: adminUser.email });
            
            if (!user) {
                console.log('❌ Usuário não encontrado');
                continue;
            }

            console.log(`✅ Usuário encontrado: ${user.name}`);

            // Verificar se já tem senha
            if (user.password) {
                console.log('⚠️ Usuário já tem senha definida');
                continue;
            }

            // Gerar hash da senha
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(adminUser.password, salt);

            // Atualizar senha
            user.password = hashedPassword;
            await user.save();

            console.log(`✅ Senha definida: ${adminUser.password}`);
            console.log(`   - Hash: ${hashedPassword.substring(0, 20)}...`);
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

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

fixAdminPasswords();
