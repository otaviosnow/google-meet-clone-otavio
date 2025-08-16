require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');
const bcrypt = require('bcryptjs');

console.log('🔧 === TESTE E CORREÇÃO DO BCRYPT ===\n');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    try {
        // 1. Testar bcrypt isoladamente
        console.log('\n🧪 1. Testando bcrypt isoladamente...');
        const testPassword = '@Teste90';
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(testPassword, salt);
        const isValid = await bcrypt.compare(testPassword, hash);
        
        console.log(`   - Senha: ${testPassword}`);
        console.log(`   - Hash: ${hash.substring(0, 20)}...`);
        console.log(`   - Válida: ${isValid}`);
        
        if (!isValid) {
            console.log('❌ PROBLEMA COM BCRYPT!');
            return;
        }
        
        // 2. Buscar usuário
        console.log('\n🔍 2. Buscando usuário...');
        const user = await User.findOne({ email: 'teste90@gmail.com' }).select('+password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado!');
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log(`   - Hash atual: ${user.password.substring(0, 20)}...`);
        
        // 3. Criar novo hash
        console.log('\n🔐 3. Criando novo hash...');
        const newSalt = await bcrypt.genSalt(12);
        const newHash = await bcrypt.hash('@Teste90', newSalt);
        
        console.log(`   - Novo hash: ${newHash.substring(0, 20)}...`);
        
        // 4. Testar novo hash
        const isNewValid = await bcrypt.compare('@Teste90', newHash);
        console.log(`   - Novo hash válido: ${isNewValid}`);
        
        if (isNewValid) {
            // 5. Atualizar usuário
            console.log('\n💾 4. Atualizando usuário...');
            user.password = newHash;
            user.visionTokens = 1000;
            user.isAdmin = true;
            user.isActive = true;
            
            await user.save();
            console.log('✅ Usuário atualizado');
            
            // 6. Testar método comparePassword
            console.log('\n🧪 5. Testando método comparePassword...');
            const isMethodValid = await user.comparePassword('@Teste90');
            console.log(`   - Método comparePassword: ${isMethodValid}`);
            
            if (isMethodValid) {
                console.log('✅ MÉTODO FUNCIONANDO!');
                
                // 7. Testar toPublicJSON
                console.log('\n📤 6. Testando toPublicJSON()...');
                const publicData = user.toPublicJSON();
                console.log('   Dados públicos:');
                console.log(`   - Tokens: ${publicData.visionTokens}`);
                console.log(`   - Admin: ${publicData.isAdmin}`);
                
                if (publicData.visionTokens === 1000 && publicData.isAdmin === true) {
                    console.log('✅ DADOS CORRETOS!');
                    console.log('\n🎉 SUCESSO TOTAL!');
                    console.log('📝 EMAIL: teste90@gmail.com');
                    console.log('📝 SENHA: @Teste90');
                    console.log('📝 TOKENS: 1000');
                    console.log('📝 ADMIN: true');
                } else {
                    console.log('❌ PROBLEMA COM DADOS PÚBLICOS!');
                }
            } else {
                console.log('❌ PROBLEMA COM MÉTODO comparePassword!');
            }
        } else {
            console.log('❌ PROBLEMA COM NOVO HASH!');
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
