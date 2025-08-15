const https = require('https');

// Função para fazer login
function testMainAdminLogin() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            email: 'tavinmktdigital@gmail.com',
            password: 'Admin123!'
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

async function testMainAdmin() {
    console.log('🔐 Testando Login do Admin Principal...\n');
    
    try {
        console.log('📧 Email: tavinmktdigital@gmail.com');
        console.log('🔑 Senha: Admin123!');
        console.log('🌐 URL: https://google-meet-saas-v2.onrender.com/api/auth/login');
        console.log('');
        
        const result = await testMainAdminLogin();
        
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
            console.log('🔧 Soluções:');
            console.log('   1. Aguarde 2-3 minutos para sincronização');
            console.log('   2. Tente novamente');
            console.log('   3. Use as credenciais alternativas');
            
        } else {
            console.log('⚠️ Status inesperado:', result.status);
            console.log('📄 Resposta:', result.data);
        }
        
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
    }
}

// Executar teste
testMainAdmin();
