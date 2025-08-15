require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Configuração do MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/callx';

async function checkAdminUsers() {
    try {
        console.log('🔍 Conectando ao MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Conectado ao MongoDB!');
        console.log('🔍 Buscando usuários admin...\n');
        
        const adminUsers = await User.find({ isAdmin: true });
        
        if (adminUsers.length === 0) {
            console.log('❌ Nenhum usuário admin encontrado!');
            console.log('💡 Dica: Use um dos scripts para criar um admin:');
            console.log('   - create-admin-user.js');
            console.log('   - add-teste90-admin.js');
            console.log('   - fix-admin-login.js');
        } else {
            console.log(`✅ ${adminUsers.length} usuário(s) admin encontrado(s):\n`);
            
            adminUsers.forEach((user, index) => {
                console.log(`👤 ${index + 1}. ${user.name || 'Sem nome'}`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   🔑 Admin: ${user.isAdmin ? '✅ Sim' : '❌ Não'}`);
                console.log(`   🚫 Banido: ${user.isBanned ? '❌ Sim' : '✅ Não'}`);
                console.log(`   🎫 Tokens: ${user.visionTokens}`);
                console.log(`   📅 Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`);
                console.log('');
            });
            
            console.log('🎯 LOGINS DISPONÍVEIS PARA TESTE:');
            console.log('=====================================');
            adminUsers.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   Senha: (verificar nos scripts de criação)`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Dica: O MongoDB local não está rodando.');
            console.log('   Para usar o banco online, configure a variável MONGODB_URI:');
            console.log('   export MONGODB_URI="sua_url_do_mongodb_atlas"');
        }
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexão fechada.');
    }
}

checkAdminUsers();
