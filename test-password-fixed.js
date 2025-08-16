require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');

console.log('🔧 === TESTE DE SENHA CORRIGIDO ===\n');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    try {
        // Buscar usuário COM senha (usando select('+password'))
        console.log('\n🔍 Buscando usuário com senha...');
        const user = await User.findOne({ email: 'teste90@gmail.com' }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado!');
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Tokens: ${user.visionTokens}`);
        console.log(`   - Admin: ${user.isAdmin}`);
        console.log(`   - Senha hash: ${user.password ? 'Presente' : 'Ausente'}`);
        
        // Testar senha
        console.log('\n🧪 Testando senha...');
        const isPasswordValid = await user.comparePassword('123456');
        console.log(`   - Senha "123456" válida: ${isPasswordValid}`);
        
        if (isPasswordValid) {
            console.log('✅ SENHA FUNCIONANDO!');
            
            // Testar toPublicJSON
            console.log('\n📤 Testando toPublicJSON()...');
            const publicData = user.toPublicJSON();
            console.log('   Dados públicos:');
            console.log(`   - Tokens: ${publicData.visionTokens}`);
            console.log(`   - Admin: ${publicData.isAdmin}`);
            
            if (publicData.visionTokens === 1000) {
                console.log('✅ TOKENS CORRETOS!');
                console.log('\n🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
                console.log('📝 EMAIL: teste90@gmail.com');
                console.log('📝 SENHA: 123456');
                console.log('📝 TOKENS: 1000');
                console.log('📝 ADMIN: true');
            } else {
                console.log('❌ PROBLEMA COM TOKENS!');
            }
        } else {
            console.log('❌ SENHA INVÁLIDA!');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
    
    mongoose.connection.close();
    console.log('\n🔌 Conexão fechada');
})
.catch(err => {
    console.error('❌ Erro de conexão:', err);
    process.exit(1);
});
