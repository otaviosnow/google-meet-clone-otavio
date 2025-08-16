require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');

console.log('🔄 === RECRIANDO USUÁRIO COM SENHA SIMPLES ===\n');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    try {
        // 1. Deletar usuário atual
        console.log('\n🗑️ 1. Deletando usuário atual...');
        await User.deleteOne({ email: 'teste90@gmail.com' });
        console.log('✅ Usuário deletado');
        
        // 2. Criar novo usuário com senha simples
        console.log('\n🆕 2. Criando novo usuário...');
        const newUser = new User({
            name: 'Teste 90',
            email: 'teste90@gmail.com',
            password: '123456', // Senha simples
            visionTokens: 1000,
            isAdmin: true,
            isActive: true
        });
        
        await newUser.save();
        console.log('✅ Usuário criado');
        
        // 3. Verificar dados
        console.log('\n🔍 3. Verificando dados...');
        const savedUser = await User.findOne({ email: 'teste90@gmail.com' });
        
        if (savedUser) {
            console.log('✅ Usuário encontrado:');
            console.log(`   - ID: ${savedUser._id}`);
            console.log(`   - Nome: ${savedUser.name}`);
            console.log(`   - Email: ${savedUser.email}`);
            console.log(`   - Tokens: ${savedUser.visionTokens}`);
            console.log(`   - Admin: ${savedUser.isAdmin}`);
            console.log(`   - Ativo: ${savedUser.isActive}`);
            
            // 4. Testar senha
            console.log('\n🧪 4. Testando senha...');
            const isPasswordValid = await savedUser.comparePassword('123456');
            console.log(`   - Senha "123456" válida: ${isPasswordValid}`);
            
            // 5. Testar toPublicJSON
            console.log('\n📤 5. Testando toPublicJSON()...');
            const publicData = savedUser.toPublicJSON();
            console.log('   Dados públicos:');
            console.log(`   - Tokens: ${publicData.visionTokens}`);
            console.log(`   - Admin: ${publicData.isAdmin}`);
            
            if (publicData.visionTokens === 1000) {
                console.log('✅ TOKENS CORRETOS!');
            } else {
                console.log('❌ PROBLEMA COM TOKENS!');
            }
            
            console.log('\n🎉 USUÁRIO RECRIADO COM SUCESSO!');
            console.log('📝 SENHA: 123456');
            console.log('📝 EMAIL: teste90@gmail.com');
            console.log('📝 TOKENS: 1000');
            console.log('📝 ADMIN: true');
            
        } else {
            console.log('❌ ERRO: Usuário não encontrado após criação!');
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
