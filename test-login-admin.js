const https = require('https');

// Função para fazer login
function testLogin() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            email: 'teste90@gmail.com',
            password: 'Teste90!'
        });

        const options = {
            hostname: 'google-meet-saas-v2.onrender.com',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: result
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function testAdminLogin() {
    console.log('🔐 Testando Login do Admin...\n');
    
    try {
        console.log('📧 Email: teste90@gmail.com');
        console.log('🔑 Senha: Teste90!');
        console.log('🌐 URL: https://google-meet-saas-v2.onrender.com/api/auth/login');
        console.log('');
        
        const result = await testLogin();
        
        console.log(`📊 Status: ${result.status}`);
        
        if (result.status === 200) {
            console.log('✅ LOGIN BEM-SUCEDIDO!');
            console.log('');
            console.log('📋 Dados do usuário:');
            console.log('   - Token:', result.data.token ? '✅ Gerado' : '❌ Não gerado');
            console.log('   - Admin:', result.data.user?.isAdmin ? '✅ Sim' : '❌ Não');
            console.log('   - Nome:', result.data.user?.name || 'N/A');
            console.log('   - Email:', result.data.user?.email || 'N/A');
            console.log('   - Tokens:', result.data.user?.visionTokens || 'N/A');
            console.log('');
            console.log('🎉 Login funcionando perfeitamente!');
            console.log('');
            console.log('🌐 Agora você pode acessar:');
            console.log('   https://google-meet-saas-v2.onrender.com/admin');
            
        } else if (result.status === 401) {
            console.log('❌ LOGIN FALHOU - Credenciais inválidas');
            console.log('📄 Resposta:', result.data);
            console.log('');
            console.log('🔧 Possíveis soluções:');
            console.log('   1. Verificar se a senha foi redefinida');
            console.log('   2. Aguardar alguns minutos para sincronização');
            console.log('   3. Tentar novamente');
            
        } else {
            console.log('⚠️ Status inesperado:', result.status);
            console.log('📄 Resposta:', result.data);
        }
        
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
        console.log('');
        console.log('🔧 Verifique:');
        console.log('   1. Se o servidor está online');
        console.log('   2. Se a URL está correta');
        console.log('   3. Se há problemas de rede');
    }
}

// Executar teste
testAdminLogin();
