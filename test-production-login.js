const axios = require('axios');

async function testProductionLogin() {
    try {
        console.log('🌐 Testando login no servidor de produção...');
        
        const loginData = {
            email: 'tavinmktdigital2@gmail.com',
            password: '@Snow2012'
        };
        
        console.log('📧 Email:', loginData.email);
        console.log('🔑 Senha:', loginData.password);
        
        // Testar o endpoint de login
        const response = await axios.post('https://google-meet-saas-v2.onrender.com/api/auth/login', loginData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Login bem-sucedido!');
        console.log('📄 Status:', response.status);
        console.log('📄 Resposta:', response.data);
        
    } catch (error) {
        console.log('❌ Erro no login de produção:');
        console.log('📄 Status:', error.response?.status);
        console.log('📄 Dados:', error.response?.data);
        console.log('📄 Headers:', error.response?.headers);
        
        if (error.response?.status === 401) {
            console.log('\n🔍 Análise do erro 401:');
            console.log('   - Usuário não encontrado ou senha incorreta');
            console.log('   - Usuário pode estar inativo');
            console.log('   - Problema na validação dos dados');
        }
    }
}

testProductionLogin();
