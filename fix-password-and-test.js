require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');
const bcrypt = require('bcryptjs');

console.log('🔧 === CORREÇÃO DE SENHA E TESTE COMPLETO ===\n');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    try {
        // 1. BUSCAR USUÁRIO ATUAL
        console.log('\n🔍 1. Buscando usuário teste90@gmail.com...');
        const user = await User.findOne({ email: 'teste90@gmail.com' });
        
        if (!user) {
            console.log('❌ Usuário não encontrado!');
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Nome: ${user.name}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Tokens: ${user.visionTokens}`);
        console.log(`   - Admin: ${user.isAdmin}`);
        console.log(`   - Ativo: ${user.isActive}`);
        
        // 2. CORRIGIR SENHA
        console.log('\n🔐 2. Corrigindo senha...');
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash('@Teste90', salt);
        await user.save();
        console.log('✅ Senha corrigida');
        
        // 3. TESTAR SENHA
        console.log('\n🧪 3. Testando senha...');
        const isPasswordValid = await user.comparePassword('@Teste90');
        console.log(`   - Senha válida: ${isPasswordValid}`);
        
        if (!isPasswordValid) {
            console.log('❌ PROBLEMA: Senha ainda inválida!');
            return;
        }
        
        // 4. TESTAR TO PUBLIC JSON
        console.log('\n📤 4. Testando toPublicJSON()...');
        const publicData = user.toPublicJSON();
        console.log('   Dados públicos:');
        console.log(`   - ID: ${publicData.id}`);
        console.log(`   - Nome: ${publicData.name}`);
        console.log(`   - Email: ${publicData.email}`);
        console.log(`   - Tokens: ${publicData.visionTokens}`);
        console.log(`   - Admin: ${publicData.isAdmin}`);
        console.log(`   - Ativo: ${publicData.isActive}`);
        
        // 5. VERIFICAR TOKENS
        if (publicData.visionTokens === 1000) {
            console.log('✅ TOKENS CORRETOS NO toPublicJSON!');
        } else {
            console.log('❌ PROBLEMA: Tokens incorretos no toPublicJSON!');
            console.log(`   Esperado: 1000, Recebido: ${publicData.visionTokens}`);
        }
        
        // 6. TESTAR LOGIN VIA API
        console.log('\n🌐 5. Testando login via API...');
        const API_BASE_URL = 'https://google-meet-saas-v2.onrender.com/api';
        
        try {
            const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'teste90@gmail.com',
                    password: '@Teste90'
                })
            });
            
            if (loginResponse.ok) {
                const loginData = await loginResponse.json();
                console.log('✅ Login via API bem-sucedido');
                console.log(`   - Tokens retornados: ${loginData.user.visionTokens}`);
                console.log(`   - Admin: ${loginData.user.isAdmin}`);
                
                if (loginData.user.visionTokens === 1000) {
                    console.log('✅ SUCESSO: Tokens corretos na API!');
                } else {
                    console.log('❌ PROBLEMA: Tokens incorretos na API!');
                }
                
                // Testar rota /me
                console.log('\n🔍 6. Testando rota /me...');
                const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${loginData.token}`
                    }
                });
                
                if (meResponse.ok) {
                    const meData = await meResponse.json();
                    console.log('✅ Rota /me funcionando');
                    console.log(`   - Tokens: ${meData.user.visionTokens}`);
                    console.log(`   - Admin: ${meData.user.isAdmin}`);
                } else {
                    console.log('❌ Erro na rota /me');
                }
                
            } else {
                const error = await loginResponse.json();
                console.log('❌ Erro no login via API:', error);
            }
            
        } catch (error) {
            console.log('❌ Erro ao testar API:', error.message);
        }
        
        console.log('\n🎉 === TESTE COMPLETO FINALIZADO ===');
        
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
