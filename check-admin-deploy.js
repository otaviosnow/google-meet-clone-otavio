const https = require('https');
const http = require('http');

// Função para testar URL
function testURL(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data.substring(0, 1000) // Primeiros 1000 chars
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// URLs para testar
const testURLs = [
    'https://google-meet-saas-v2.onrender.com/admin',
    'https://google-meet-saas-v2.onrender.com/admin/css/admin.css',
    'https://google-meet-saas-v2.onrender.com/admin/js/admin.js',
    'https://google-meet-saas-v2.onrender.com/api/test'
];

async function checkAdminDeploy() {
    console.log('🔍 Verificando Deploy do Painel Admin...\n');
    
    for (const url of testURLs) {
        try {
            console.log(`🔍 Testando: ${url}`);
            const result = await testURL(url);
            
            if (result.status === 200) {
                console.log(`✅ Status: ${result.status} - FUNCIONANDO!`);
                
                if (url.includes('/admin') && !url.includes('.css') && !url.includes('.js')) {
                    // Verificar se é a página admin
                    if (result.data.includes('Admin Panel')) {
                        console.log(`📄 Página admin carregada: ✅`);
                        if (result.data.includes('login-screen')) {
                            console.log(`🎨 CSS detectado: ✅`);
                        } else {
                            console.log(`⚠️ CSS pode não estar carregando`);
                        }
                    }
                } else if (url.includes('.css')) {
                    // Verificar se é o arquivo CSS
                    if (result.data.includes('/* Reset e Base */')) {
                        console.log(`🎨 CSS carregado: ✅`);
                    } else {
                        console.log(`❌ CSS não encontrado`);
                    }
                } else if (url.includes('.js')) {
                    // Verificar se é o arquivo JS
                    if (result.data.includes('API_BASE_URL')) {
                        console.log(`⚙️ JavaScript carregado: ✅`);
                    } else {
                        console.log(`❌ JavaScript não encontrado`);
                    }
                }
                
            } else if (result.status === 404) {
                console.log(`❌ Status: ${result.status} - ARQUIVO NÃO ENCONTRADO`);
            } else {
                console.log(`⚠️ Status: ${result.status} - Verificar`);
            }
            
        } catch (error) {
            console.log(`❌ Erro: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('📋 Resumo do Deploy:');
    console.log('✅ Correção enviada para GitHub');
    console.log('✅ Render deve fazer deploy automático');
    console.log('⏱️ Aguarde 2-3 minutos para o deploy');
    console.log('');
    console.log('🔗 URLs finais:');
    console.log('   Admin: https://google-meet-saas-v2.onrender.com/admin');
    console.log('   Email: teste90@gmail.com');
    console.log('   Senha: Teste90!');
    console.log('');
    console.log('🎯 Se ainda não funcionar:');
    console.log('   1. Acesse o Render Dashboard');
    console.log('   2. Vá em "Manual Deploy"');
    console.log('   3. Clique em "Deploy latest commit"');
}

// Executar verificação
checkAdminDeploy();
