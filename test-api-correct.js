require('dotenv').config();

const API_BASE_URL = 'https://google-meet-saas-v2.onrender.com/api';

async function testAPI() {
    console.log('🧪 Testando API com senha correta...');
    
    try {
        // 1. Fazer login
        console.log('\n1️⃣ Fazendo login...');
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
        
        if (!loginResponse.ok) {
            const error = await loginResponse.json();
            console.error('❌ Erro no login:', error);
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login bem-sucedido');
        console.log('🎫 Token recebido:', loginData.token ? 'Sim' : 'Não');
        
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
        console.log('👤 Dados do usuário:');
        console.log('   - Nome:', meData.user.name);
        console.log('   - Email:', meData.user.email);
        console.log('   - Tokens:', meData.user.visionTokens);
        console.log('   - Admin:', meData.user.isAdmin);
        console.log('   - Ativo:', meData.user.isActive);
        
        // 3. Verificar se os tokens estão corretos
        if (meData.user.visionTokens >= 1000) {
            console.log('✅ Tokens estão corretos no banco e na API!');
        } else {
            console.log('❌ Tokens incorretos na API:', meData.user.visionTokens);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testAPI();
