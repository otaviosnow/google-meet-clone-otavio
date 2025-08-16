require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');

console.log('🧹 === LIMPEZA E RECONSTRUÇÃO DO SISTEMA DE TOKENS ===\n');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    try {
        // 1. LISTAR TODOS OS USUÁRIOS
        console.log('\n📋 1. Listando todos os usuários...');
        const allUsers = await User.find({});
        console.log(`   Total de usuários encontrados: ${allUsers.length}`);
        
        allUsers.forEach(user => {
            console.log(`   - ${user.email} (ID: ${user._id}) - Tokens: ${user.visionTokens}`);
        });
        
        // 2. BACKUP DO USUÁRIO TESTE90
        console.log('\n💾 2. Fazendo backup do teste90@gmail.com...');
        const teste90User = await User.findOne({ email: 'teste90@gmail.com' });
        
        if (!teste90User) {
            console.log('❌ Usuário teste90@gmail.com não encontrado!');
            return;
        }
        
        console.log('✅ Backup do teste90@gmail.com:');
        console.log(`   - ID: ${teste90User._id}`);
        console.log(`   - Nome: ${teste90User.name}`);
        console.log(`   - Email: ${teste90User.email}`);
        console.log(`   - Tokens atuais: ${teste90User.visionTokens}`);
        console.log(`   - Admin: ${teste90User.isAdmin}`);
        console.log(`   - Ativo: ${teste90User.isActive}`);
        
        // 3. DELETAR TODOS OS USUÁRIOS
        console.log('\n🗑️ 3. Deletando todos os usuários...');
        const deleteResult = await User.deleteMany({});
        console.log(`✅ ${deleteResult.deletedCount} usuários deletados`);
        
        // 4. RECRIAR O USUÁRIO TESTE90 COM TOKENS
        console.log('\n🔄 4. Recriando teste90@gmail.com com tokens...');
        
        const newTeste90 = new User({
            name: 'Teste 90',
            email: 'teste90@gmail.com',
            password: '@Teste90',
            visionTokens: 1000,
            isAdmin: true,
            isActive: true
        });
        
        await newTeste90.save();
        console.log('✅ Usuário teste90@gmail.com recriado');
        
        // 5. VERIFICAR SE FOI SALVO CORRETAMENTE
        console.log('\n🔍 5. Verificando dados salvos...');
        const savedUser = await User.findOne({ email: 'teste90@gmail.com' });
        
        if (savedUser) {
            console.log('✅ Usuário encontrado após salvamento:');
            console.log(`   - ID: ${savedUser._id}`);
            console.log(`   - Nome: ${savedUser.name}`);
            console.log(`   - Email: ${savedUser.email}`);
            console.log(`   - Tokens: ${savedUser.visionTokens}`);
            console.log(`   - Admin: ${savedUser.isAdmin}`);
            console.log(`   - Ativo: ${savedUser.isActive}`);
            
            // 6. TESTAR TOKEN HASH
            console.log('\n🔐 6. Testando hash da senha...');
            const isPasswordValid = await savedUser.comparePassword('@Teste90');
            console.log(`   - Senha válida: ${isPasswordValid}`);
            
            // 7. TESTAR TO PUBLIC JSON
            console.log('\n📤 7. Testando toPublicJSON()...');
            const publicData = savedUser.toPublicJSON();
            console.log('   Dados públicos:');
            console.log(`   - ID: ${publicData.id}`);
            console.log(`   - Nome: ${publicData.name}`);
            console.log(`   - Email: ${publicData.email}`);
            console.log(`   - Tokens: ${publicData.visionTokens}`);
            console.log(`   - Admin: ${publicData.isAdmin}`);
            console.log(`   - Ativo: ${publicData.isActive}`);
            
            // 8. VERIFICAR SE TOKENS ESTÃO CORRETOS
            if (publicData.visionTokens === 1000) {
                console.log('✅ TOKENS CORRETOS NO toPublicJSON!');
            } else {
                console.log('❌ PROBLEMA: Tokens incorretos no toPublicJSON!');
                console.log(`   Esperado: 1000, Recebido: ${publicData.visionTokens}`);
            }
            
        } else {
            console.log('❌ ERRO: Usuário não encontrado após salvamento!');
        }
        
        // 9. CONTAGEM FINAL
        console.log('\n📊 9. Contagem final...');
        const finalCount = await User.countDocuments();
        console.log(`   Total de usuários no banco: ${finalCount}`);
        
        if (finalCount === 1) {
            console.log('✅ SUCESSO: Apenas o teste90@gmail.com permanece no banco!');
        } else {
            console.log('❌ ERRO: Contagem incorreta de usuários!');
        }
        
        console.log('\n🎉 === LIMPEZA E RECONSTRUÇÃO CONCLUÍDA ===');
        
    } catch (error) {
        console.error('❌ Erro durante o processo:', error);
    }
    
    mongoose.connection.close();
    console.log('🔌 Conexão fechada');
})
.catch(err => {
    console.error('❌ Erro de conexão:', err);
    process.exit(1);
});
