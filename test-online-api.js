require('dotenv').config();

const API_BASE_URL = 'https://google-meet-saas-v2.onrender.com/api';

async function testOnlineAPI() {
    console.log('🌐 === TESTE DA API ONLINE ===\n');
    
    try {
        // 1. Testar login
        console.log('1️⃣ Testando login online...');
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
        
        console.log(`   Status: ${loginResponse.status}`);
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login online bem-sucedido!');
            console.log(`   - Tokens: ${loginData.user.visionTokens}`);
            console.log(`   - Admin: ${loginData.user.isAdmin}`);
            
            const token = loginData.token;
            
            // 2. Testar rota /me
            console.log('\n2️⃣ Testando rota /me online...');
            const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (meResponse.ok) {
                const meData = await meResponse.json();
                console.log('✅ Rota /me online funcionando!');
                console.log(`   - Tokens: ${meData.user.visionTokens}`);
                console.log(`   - Admin: ${meData.user.isAdmin}`);
                
                console.log('\n🎉 API ONLINE FUNCIONANDO PERFEITAMENTE!');
            } else {
                console.log('❌ Erro na rota /me online');
                const error = await meResponse.json();
                console.log('   Erro:', error);
            }
            
        } else {
            const error = await loginResponse.json();
            console.log('❌ Erro no login online:');
            console.log('   Erro:', error);
            
            // 3. Verificar se é problema de senha
            console.log('\n🔍 Verificando se é problema de senha...');
            
            const testPasswords = ['123456', '@Teste90', 'Teste90', 'teste90'];
            
            for (const password of testPasswords) {
                try {
                    const testResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: 'teste90@gmail.com',
                            password: password
                        })
                    });
                    
                    if (testResponse.ok) {
                        console.log(`✅ SENHA FUNCIONANDO: "${password}"`);
                        break;
                    }
                } catch (err) {
                    console.log(`❌ Erro testando "${password}":`, err.message);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testOnlineAPI();
