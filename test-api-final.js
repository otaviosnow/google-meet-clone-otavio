require('dotenv').config();

const API_BASE_URL = 'https://google-meet-saas-v2.onrender.com/api';

async function testAPIFinal() {
    console.log('🌐 === TESTE FINAL DA API ===\n');
    
    try {
        // 1. Login
        console.log('1️⃣ Fazendo login...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'teste90@gmail.com',
                password: '123456'
            })
        });
        
        if (!loginResponse.ok) {
            const error = await loginResponse.json();
            console.error('❌ Erro no login:', error);
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login bem-sucedido');
        console.log(`   - Tokens: ${loginData.user.visionTokens}`);
        console.log(`   - Admin: ${loginData.user.isAdmin}`);
        
        const token = loginData.token;
        
        // 2. Testar rota /me
        console.log('\n2️⃣ Testando rota /me...');
        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!meResponse.ok) {
            const error = await meResponse.json();
            console.error('❌ Erro na rota /me:', error);
            return;
        }
        
        const meData = await meResponse.json();
        console.log('✅ Rota /me funcionando');
        console.log(`   - Tokens: ${meData.user.visionTokens}`);
        console.log(`   - Admin: ${meData.user.isAdmin}`);
        
        // 3. Verificar se tudo está correto
        if (loginData.user.visionTokens === 1000 && meData.user.visionTokens === 1000) {
            console.log('\n🎉 SUCESSO TOTAL!');
            console.log('✅ Tokens funcionando na API');
            console.log('✅ Login funcionando');
            console.log('✅ Rota /me funcionando');
            console.log('✅ Sistema de tokens reconstruído com sucesso!');
        } else {
            console.log('\n❌ PROBLEMA PERSISTE');
            console.log(`   Login tokens: ${loginData.user.visionTokens}`);
            console.log(`   /me tokens: ${meData.user.visionTokens}`);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testAPIFinal();
