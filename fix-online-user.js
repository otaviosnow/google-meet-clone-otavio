require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');

console.log('🌐 === CORREÇÃO DO USUÁRIO ONLINE ===\n');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado ao MongoDB Online');
    
    try {
        // 1. VERIFICAR USUÁRIO ATUAL
        console.log('\n🔍 1. Verificando usuário atual...');
        const currentUser = await User.findOne({ email: 'teste90@gmail.com' }).select('+password');
        
        if (currentUser) {
            console.log('✅ Usuário encontrado:');
            console.log(`   - ID: ${currentUser._id}`);
            console.log(`   - Nome: ${currentUser.name}`);
            console.log(`   - Email: ${currentUser.email}`);
            console.log(`   - Tokens: ${currentUser.visionTokens}`);
            console.log(`   - Admin: ${currentUser.isAdmin}`);
            console.log(`   - Ativo: ${currentUser.isActive}`);
            console.log(`   - Senha hash: ${currentUser.password ? 'Presente' : 'Ausente'}`);
            
            // 2. TESTAR SENHA ATUAL
            console.log('\n🧪 2. Testando senha atual...');
            const isCurrentValid = await currentUser.comparePassword('123456');
            console.log(`   - Senha "123456" válida: ${isCurrentValid}`);
            
            if (!isCurrentValid) {
                console.log('❌ Senha atual não funciona!');
                
                // 3. CORRIGIR SENHA
                console.log('\n🔧 3. Corrigindo senha...');
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(12);
                currentUser.password = await bcrypt.hash('123456', salt);
                currentUser.visionTokens = 1000;
                currentUser.isAdmin = true;
                currentUser.isActive = true;
                
                await currentUser.save();
                console.log('✅ Senha corrigida');
                
                // 4. TESTAR NOVA SENHA
                console.log('\n🧪 4. Testando nova senha...');
                const isNewValid = await currentUser.comparePassword('123456');
                console.log(`   - Nova senha "123456" válida: ${isNewValid}`);
                
                if (isNewValid) {
                    console.log('✅ SENHA FUNCIONANDO!');
                    
                    // 5. TESTAR TO PUBLIC JSON
                    console.log('\n📤 5. Testando toPublicJSON()...');
                    const publicData = currentUser.toPublicJSON();
                    console.log('   Dados públicos:');
                    console.log(`   - Tokens: ${publicData.visionTokens}`);
                    console.log(`   - Admin: ${publicData.isAdmin}`);
                    
                    if (publicData.visionTokens === 1000 && publicData.isAdmin === true) {
                        console.log('✅ DADOS CORRETOS!');
                        console.log('\n🎉 USUÁRIO ONLINE CORRIGIDO!');
                        console.log('📝 EMAIL: teste90@gmail.com');
                        console.log('📝 SENHA: 123456');
                        console.log('📝 TOKENS: 1000');
                        console.log('📝 ADMIN: true');
                    } else {
                        console.log('❌ PROBLEMA COM DADOS PÚBLICOS!');
                    }
                } else {
                    console.log('❌ PROBLEMA: Nova senha não funciona!');
                }
                
            } else {
                console.log('✅ Senha atual funciona!');
                console.log('🔍 Verificando se há outros problemas...');
                
                // Verificar se há problemas com os dados
                const publicData = currentUser.toPublicJSON();
                if (publicData.visionTokens !== 1000 || publicData.isAdmin !== true) {
                    console.log('❌ Dados incorretos, corrigindo...');
                    currentUser.visionTokens = 1000;
                    currentUser.isAdmin = true;
                    currentUser.isActive = true;
                    await currentUser.save();
                    console.log('✅ Dados corrigidos!');
                }
            }
            
        } else {
            console.log('❌ Usuário não encontrado!');
            console.log('🆕 Criando novo usuário...');
            
            const newUser = new User({
                name: 'Teste 90',
                email: 'teste90@gmail.com',
                password: '123456',
                visionTokens: 1000,
                isAdmin: true,
                isActive: true
            });
            
            await newUser.save();
            console.log('✅ Novo usuário criado!');
        }
        
        // 6. VERIFICAÇÃO FINAL
        console.log('\n🔍 6. Verificação final...');
        const finalUser = await User.findOne({ email: 'teste90@gmail.com' }).select('+password');
        
        if (finalUser) {
            const isFinalValid = await finalUser.comparePassword('123456');
            const finalPublic = finalUser.toPublicJSON();
            
            console.log('✅ Usuário final:');
            console.log(`   - Senha válida: ${isFinalValid}`);
            console.log(`   - Tokens: ${finalPublic.visionTokens}`);
            console.log(`   - Admin: ${finalPublic.isAdmin}`);
            
            if (isFinalValid && finalPublic.visionTokens === 1000 && finalPublic.isAdmin === true) {
                console.log('\n🎉 SUCESSO TOTAL!');
                console.log('✅ Login deve funcionar agora!');
            } else {
                console.log('\n❌ Ainda há problemas!');
            }
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
