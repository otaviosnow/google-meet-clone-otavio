const axios = require('axios');

async function testValidation() {
    try {
        console.log('🧪 Testando validação dos dados de login...');
        
        const testCases = [
            {
                name: 'Dados corretos',
                data: {
                    email: 'tavinmktdigital2@gmail.com',
                    password: '@Snow2012'
                }
            },
            {
                name: 'Email em maiúsculas',
                data: {
                    email: 'TAVINMKTDIGITAL2@GMAIL.COM',
                    password: '@Snow2012'
                }
            },
            {
                name: 'Email com espaços',
                data: {
                    email: ' tavinmktdigital2@gmail.com ',
                    password: '@Snow2012'
                }
            },
            {
                name: 'Senha com espaços',
                data: {
                    email: 'tavinmktdigital2@gmail.com',
                    password: ' @Snow2012 '
                }
            }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n📋 Teste: ${testCase.name}`);
            console.log('📧 Email:', testCase.data.email);
            console.log('🔑 Senha:', testCase.data.password);
            
            try {
                const response = await axios.post('https://google-meet-saas-v2.onrender.com/api/auth/login', testCase.data, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });
                
                console.log('✅ Sucesso!');
                console.log('📄 Status:', response.status);
                console.log('📄 Token:', response.data.token ? 'Presente' : 'Ausente');
                
            } catch (error) {
                console.log('❌ Erro:');
                console.log('📄 Status:', error.response?.status);
                console.log('📄 Dados:', error.response?.data);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

testValidation();
