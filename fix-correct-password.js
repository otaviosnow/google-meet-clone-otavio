require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');

console.log('🔧 === CORREÇÃO COM SENHA CORRETA ===\n');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    try {
        // 1. Buscar usuário
        console.log('\n🔍 1. Buscando usuário...');
        const user = await User.findOne({ email: 'teste90@gmail.com' }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado!');
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Tokens: ${user.visionTokens}`);
        console.log(`   - Admin: ${user.isAdmin}`);
        
        // 2. Corrigir senha para @Teste90
        console.log('\n🔐 2. Corrigindo senha para @Teste90...');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash('@Teste90', salt);
        user.visionTokens = 1000;
        user.isAdmin = true;
        user.isActive = true;
        
        await user.save();
        console.log('✅ Senha corrigida');
        
        // 3. Testar nova senha
        console.log('\n🧪 3. Testando nova senha...');
        const isPasswordValid = await user.comparePassword('@Teste90');
        console.log(`   - Senha "@Teste90" válida: ${isPasswordValid}`);
        
        if (isPasswordValid) {
            console.log('✅ SENHA FUNCIONANDO!');
            
            // 4. Testar toPublicJSON
            console.log('\n📤 4. Testando toPublicJSON()...');
            const publicData = user.toPublicJSON();
            console.log('   Dados públicos:');
            console.log(`   - Tokens: ${publicData.visionTokens}`);
            console.log(`   - Admin: ${publicData.isAdmin}`);
            
            if (publicData.visionTokens === 1000 && publicData.isAdmin === true) {
                console.log('✅ DADOS CORRETOS!');
                console.log('\n🎉 USUÁRIO CORRIGIDO COM SUCESSO!');
                console.log('📝 EMAIL: teste90@gmail.com');
                console.log('📝 SENHA: @Teste90');
                console.log('📝 TOKENS: 1000');
                console.log('📝 ADMIN: true');
            } else {
                console.log('❌ PROBLEMA COM DADOS PÚBLICOS!');
            }
        } else {
            console.log('❌ PROBLEMA: Nova senha não funciona!');
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
