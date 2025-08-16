require('dotenv').config();

const API_BASE_URL = 'https://google-meet-saas-v2.onrender.com/api';

async function testAPIDirect() {
    console.log('🌐 === TESTE DIRETO DA API ===\n');
    
    try {
        // Testar login
        console.log('1️⃣ Testando login...');
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
            console.log('✅ Login bem-sucedido!');
            console.log('📊 Dados retornados:');
            console.log(`   - Tokens: ${loginData.user.visionTokens}`);
            console.log(`   - Admin: ${loginData.user.isAdmin}`);
            console.log(`   - ID: ${loginData.user.id}`);
            
            if (loginData.user.visionTokens === 1000) {
                console.log('✅ API retornando tokens corretos!');
            } else {
                console.log('❌ API retornando tokens incorretos!');
                console.log('🔍 Problema pode estar no servidor online');
            }
        } else {
            const error = await loginResponse.json();
            console.log('❌ Erro no login:', error);
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

testAPIDirect();
