require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testComparePassword() {
    try {
        console.log('🔍 Conectando ao MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB Atlas!');

        // Buscar usuário
        const user = await User.findOne({ email: 'teste90@gmail.com' }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado');
            return;
        }

        console.log('👤 Usuário:', user.name);
        console.log('📧 Email:', user.email);
        console.log('🔐 Hash:', user.password);

        // Testar método comparePassword
        console.log('\n🧪 Testando método comparePassword:');
        try {
            const result1 = await user.comparePassword('Teste90!');
            console.log('   Teste90!:', result1 ? '✅ VÁLIDA' : '❌ inválida');
        } catch (error) {
            console.log('   Teste90!:', '❌ ERRO -', error.message);
        }

        try {
            const result2 = await user.comparePassword('senhaerrada');
            console.log('   senhaerrada:', result2 ? '✅ VÁLIDA' : '❌ inválida');
        } catch (error) {
            console.log('   senhaerrada:', '❌ ERRO -', error.message);
        }

        // Testar bcrypt.compare diretamente
        console.log('\n🧪 Testando bcrypt.compare diretamente:');
        try {
            const result3 = await bcrypt.compare('Teste90!', user.password);
            console.log('   Teste90!:', result3 ? '✅ VÁLIDA' : '❌ inválida');
        } catch (error) {
            console.log('   Teste90!:', '❌ ERRO -', error.message);
        }

        // Verificar se o método comparePassword existe
        console.log('\n🔍 Verificando método comparePassword:');
        console.log('   Método existe:', typeof user.comparePassword === 'function' ? '✅ Sim' : '❌ Não');
        
        if (typeof user.comparePassword === 'function') {
            console.log('   Tipo:', typeof user.comparePassword);
            console.log('   Nome:', user.comparePassword.name);
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

testComparePassword();
