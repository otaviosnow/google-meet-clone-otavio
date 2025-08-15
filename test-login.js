const axios = require('axios');

async function testLogin() {
    try {
        console.log('🧪 Testando login do usuário...');
        
        const loginData = {
            email: 'tavinmktdigital2@gmail.com',
            password: '@Snow2012'
        };
        
        console.log('📧 Email:', loginData.email);
        console.log('🔑 Senha:', loginData.password);
        
        // Testar no servidor local primeiro
        console.log('\n🌐 Testando servidor local...');
        try {
            const localResponse = await axios.post('http://localhost:10000/api/auth/login', loginData);
            console.log('✅ Login local bem-sucedido!');
            console.log('📄 Resposta:', localResponse.data);
        } catch (localError) {
            console.log('❌ Erro no servidor local:', localError.response?.status, localError.response?.data);
        }
        
        // Testar no servidor de produção
        console.log('\n🌐 Testando servidor de produção...');
        try {
            const prodResponse = await axios.post('https://google-meet-saas-v2.onrender.com/api/auth/login', loginData);
            console.log('✅ Login de produção bem-sucedido!');
            console.log('📄 Resposta:', prodResponse.data);
        } catch (prodError) {
            console.log('❌ Erro no servidor de produção:', prodError.response?.status, prodError.response?.data);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

testLogin();
