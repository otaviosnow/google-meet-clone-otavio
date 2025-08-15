require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixOnlineAdminUsers() {
    try {
        console.log('🔍 Conectando ao MongoDB Atlas (online)...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB Atlas!');

        // Lista de usuários admin com suas senhas
        const adminUsers = [
            { email: 'teste90@gmail.com', password: 'Teste90!', name: 'Teste 90' },
            { email: 'admin@callx.com', password: 'Admin123!', name: 'Admin Alternativo' },
            { email: 'tavinmktdigital@gmail.com', password: 'Admin123!', name: 'Otávio Admin' },
            { email: 'teste2@gmail.com', password: 'Admin123!', name: 'teste2' }
        ];

        console.log('🔧 Corrigindo usuários admin no banco online...\n');

        for (const adminUser of adminUsers) {
            console.log(`🔍 Processando: ${adminUser.email}`);
            
            // Verificar se o usuário existe
            let user = await User.findOne({ email: adminUser.email });
            
            if (!user) {
                console.log('❌ Usuário não encontrado, criando novo...');
                
                // Gerar hash da senha
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash(adminUser.password, salt);

                // Criar novo usuário admin
                user = new User({
                    name: adminUser.name,
                    email: adminUser.email,
                    password: hashedPassword,
                    isAdmin: true,
                    isBanned: false,
                    visionTokens: 1000,
                    isActive: true
                });

                await user.save();
                console.log(`✅ Usuário criado: ${adminUser.name}`);
            } else {
                console.log(`✅ Usuário encontrado: ${user.name}`);
                
                // Gerar hash da senha
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash(adminUser.password, salt);

                // Atualizar usuário
                user.name = adminUser.name;
                user.password = hashedPassword;
                user.isAdmin = true;
                user.isBanned = false;
                user.visionTokens = 1000;
                user.isActive = true;

                await user.save();
                console.log(`✅ Usuário atualizado: ${adminUser.name}`);
            }

            console.log(`   - Email: ${adminUser.email}`);
            console.log(`   - Senha: ${adminUser.password}`);
            console.log(`   - Admin: ${user.isAdmin}`);
            console.log(`   - Tokens: ${user.visionTokens}`);
            console.log('');
        }

        console.log('🎉 Todos os usuários admin foram corrigidos no banco online!');
        console.log('\n🔐 LOGINS ADMIN DISPONÍVEIS ONLINE:');
        console.log('=====================================');
        
        adminUsers.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   Senha: ${user.password}`);
            console.log('');
        });

        console.log('🌐 Teste online: https://google-meet-saas-v2.onrender.com');
        console.log('🛡️ Admin online: https://google-meet-saas-v2.onrender.com/admin');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

fixOnlineAdminUsers();
