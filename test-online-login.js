const https = require('https');

async function testOnlineLogin() {
    const testUsers = [
        { email: 'teste90@gmail.com', password: 'Teste90!' },
        { email: 'admin@callx.com', password: 'Admin123!' },
        { email: 'tavinmktdigital@gmail.com', password: 'Admin123!' },
        { email: 'teste2@gmail.com', password: 'Admin123!' }
    ];

    console.log('🌐 Testando logins online...\n');

    for (const user of testUsers) {
        console.log(`🔍 Testando: ${user.email}`);
        
        const postData = JSON.stringify({
            email: user.email,
            password: user.password
        });

        const options = {
            hostname: 'google-meet-saas-v2.onrender.com',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`   Status: ${res.statusCode}`);
                console.log(`   Response: ${data}`);
                
                if (res.statusCode === 200) {
                    console.log('   ✅ Login bem-sucedido!');
                } else {
                    console.log('   ❌ Login falhou');
                }
                console.log('');
            });
        });

        req.on('error', (e) => {
            console.error(`   ❌ Erro na requisição: ${e.message}`);
        });

        req.write(postData);
        req.end();

        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

testOnlineLogin();
