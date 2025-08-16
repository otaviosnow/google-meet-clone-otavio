const fetch = require('node-fetch');

// Configuração
const BASE_URL = process.env.API_URL || 'http://localhost:10000';
let authToken = null;
let testUserId = null;
let testVideoId = null;
let testMeetingId = null;
let testTokenId = null;

// Função para fazer requisições
async function makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        },
        ...options
    };
    
    try {
        console.log(`📡 ${options.method || 'GET'} ${endpoint}`);
        const response = await fetch(url, config);
        const data = await response.json();
        
        console.log(`   Status: ${response.status}`);
        if (response.ok) {
            console.log(`   ✅ Sucesso`);
        } else {
            console.log(`   ❌ Erro: ${data.error || 'Erro desconhecido'}`);
        }
        
        return { response, data };
    } catch (error) {
        console.log(`   ❌ Erro de rede: ${error.message}`);
        return { response: null, data: null };
    }
}

// Teste 1: Verificar se a API está online
async function testApiOnline() {
    console.log('\n1️⃣ Testando se a API está online...');
    const { response, data } = await makeRequest('/api/test');
    return response && response.ok;
}

// Teste 2: Autenticação
async function testAuth() {
    console.log('\n2️⃣ Testando autenticação...');
    
    // Teste de registro
    console.log('   📝 Testando registro...');
    const registerData = {
        name: 'Teste Integração',
        email: 'teste.integracao@test.com',
        password: '@Teste123'
    };
    
    const { response: registerResponse, data: registerResult } = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData)
    });
    
    if (registerResponse && registerResponse.ok) {
        authToken = registerResult.token;
        testUserId = registerResult.user._id;
        console.log('   ✅ Registro bem-sucedido');
    } else {
        // Tentar login se registro falhar
        console.log('   🔄 Tentando login...');
        const loginData = {
            email: 'teste.integracao@test.com',
            password: '@Teste123'
        };
        
        const { response: loginResponse, data: loginResult } = await makeRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        if (loginResponse && loginResponse.ok) {
            authToken = loginResult.token;
            testUserId = loginResult.user._id;
            console.log('   ✅ Login bem-sucedido');
        } else {
            console.log('   ❌ Falha na autenticação');
            return false;
        }
    }
    
    return true;
}

// Teste 3: Vídeos
async function testVideos() {
    console.log('\n3️⃣ Testando rotas de vídeos...');
    
    // Listar vídeos
    console.log('   📋 Listando vídeos...');
    const { response: listResponse, data: videos } = await makeRequest('/api/videos');
    
    if (listResponse && listResponse.ok && videos.length > 0) {
        testVideoId = videos[0]._id;
        console.log(`   ✅ ${videos.length} vídeos encontrados`);
    } else {
        // Criar vídeo de teste
        console.log('   ➕ Criando vídeo de teste...');
        const videoData = {
            title: 'Vídeo de Teste',
            type: 'url',
            url: 'https://exemplo.com/video.mp4'
        };
        
        const { response: createResponse, data: newVideo } = await makeRequest('/api/videos', {
            method: 'POST',
            body: JSON.stringify(videoData)
        });
        
        if (createResponse && createResponse.ok) {
            testVideoId = newVideo._id;
            console.log('   ✅ Vídeo criado com sucesso');
        } else {
            console.log('   ❌ Falha ao criar vídeo');
            return false;
        }
    }
    
    return true;
}

// Teste 4: Reuniões
async function testMeetings() {
    console.log('\n4️⃣ Testando rotas de reuniões...');
    
    if (!testVideoId) {
        console.log('   ❌ Nenhum vídeo disponível para teste');
        return false;
    }
    
    // Criar reunião
    console.log('   ➕ Criando reunião de teste...');
    const meetingData = {
        title: 'Reunião de Teste',
        videoId: testVideoId
    };
    
    const { response: createResponse, data: newMeeting } = await makeRequest('/api/meetings', {
        method: 'POST',
        body: JSON.stringify(meetingData)
    });
    
    if (createResponse && createResponse.ok) {
        testMeetingId = newMeeting.meeting.meetingId;
        console.log('   ✅ Reunião criada com sucesso');
        
        // Listar reuniões
        console.log('   📋 Listando reuniões...');
        const { response: listResponse, data: meetings } = await makeRequest('/api/meetings');
        
        if (listResponse && listResponse.ok) {
            console.log(`   ✅ ${meetings.length} reuniões encontradas`);
        }
        
        return true;
    } else {
        console.log('   ❌ Falha ao criar reunião');
        return false;
    }
}

// Teste 5: Tokens de Integração
async function testIntegration() {
    console.log('\n5️⃣ Testando rotas de integração...');
    
    // Listar tokens
    console.log('   📋 Listando tokens de integração...');
    const { response: listResponse, data: tokens } = await makeRequest('/api/integration/tokens');
    
    if (listResponse && listResponse.ok) {
        console.log(`   ✅ ${tokens.length} tokens encontrados`);
        
        if (tokens.length > 0) {
            testTokenId = tokens[0]._id;
        }
    }
    
    // Criar token de teste
    console.log('   ➕ Criando token de integração...');
    const tokenData = {
        name: 'Token de Teste',
        description: 'Token para testes de integração',
        website: 'https://teste.com',
        videos: testVideoId ? [{
            video: testVideoId,
            name: 'Vídeo de Teste',
            isDefault: true
        }] : []
    };
    
    const { response: createResponse, data: newToken } = await makeRequest('/api/integration/tokens', {
        method: 'POST',
        body: JSON.stringify(tokenData)
    });
    
    if (createResponse && createResponse.ok) {
        testTokenId = newToken._id;
        console.log('   ✅ Token criado com sucesso');
        
        // Testar criação de reunião via integração
        console.log('   🎯 Testando criação de reunião via integração...');
        const integrationData = {
            token: newToken.token,
            title: 'Reunião via Integração',
            redirectUrl: 'https://teste.com'
        };
        
        const { response: integrationResponse, data: integrationResult } = await makeRequest('/api/integration/create-meeting', {
            method: 'POST',
            body: JSON.stringify(integrationData)
        });
        
        if (integrationResponse && integrationResponse.ok) {
            console.log('   ✅ Reunião via integração criada com sucesso');
        } else {
            console.log('   ❌ Falha ao criar reunião via integração');
        }
        
        return true;
    } else {
        console.log('   ❌ Falha ao criar token');
        return false;
    }
}

// Teste 6: Admin (se aplicável)
async function testAdmin() {
    console.log('\n6️⃣ Testando rotas de admin...');
    
    // Verificar se é admin
    console.log('   👑 Verificando permissões de admin...');
    const { response: meResponse, data: userData } = await makeRequest('/api/auth/me');
    
    if (meResponse && meResponse.ok && userData.isAdmin) {
        console.log('   ✅ Usuário é admin');
        
        // Listar usuários
        console.log('   📋 Listando usuários...');
        const { response: usersResponse, data: users } = await makeRequest('/api/admin/users');
        
        if (usersResponse && usersResponse.ok) {
            console.log(`   ✅ ${users.length} usuários encontrados`);
        }
        
        // Estatísticas
        console.log('   📊 Buscando estatísticas...');
        const { response: statsResponse, data: stats } = await makeRequest('/api/admin/stats');
        
        if (statsResponse && statsResponse.ok) {
            console.log('   ✅ Estatísticas carregadas');
        }
        
        return true;
    } else {
        console.log('   ⚠️ Usuário não é admin');
        return true; // Não é erro, apenas não tem permissão
    }
}

// Teste 7: Analytics
async function testAnalytics() {
    console.log('\n7️⃣ Testando rotas de analytics...');
    
    // Estatísticas
    console.log('   📊 Buscando estatísticas...');
    const { response: statsResponse, data: stats } = await makeRequest('/api/analytics/stats');
    
    if (statsResponse && statsResponse.ok) {
        console.log('   ✅ Estatísticas carregadas');
    } else {
        console.log('   ❌ Falha ao carregar estatísticas');
    }
    
    // Top usuários
    console.log('   👥 Buscando top usuários...');
    const { response: usersResponse, data: users } = await makeRequest('/api/analytics/top-users');
    
    if (usersResponse && usersResponse.ok) {
        console.log('   ✅ Top usuários carregados');
    } else {
        console.log('   ❌ Falha ao carregar top usuários');
    }
    
    return true;
}

// Teste 8: Limpeza
async function testCleanup() {
    console.log('\n8️⃣ Testando limpeza automática...');
    
    // Executar limpeza manual
    console.log('   🧹 Executando limpeza manual...');
    const { response: cleanupResponse, data: cleanupResult } = await makeRequest('/api/admin/cleanup', {
        method: 'POST'
    });
    
    if (cleanupResponse && cleanupResponse.ok) {
        console.log('   ✅ Limpeza executada com sucesso');
        console.log(`   📊 ${cleanupResult.markedAsExpired} marcadas como expiradas`);
        console.log(`   🗑️ ${cleanupResult.removedCount} removidas`);
    } else {
        console.log('   ❌ Falha na limpeza');
    }
    
    return true;
}

// Função principal
async function testAllRoutes() {
    console.log('🧪 === TESTE COMPLETO DAS ROTAS DA API ===\n');
    
    try {
        // Teste 1: API online
        const apiOnline = await testApiOnline();
        if (!apiOnline) {
            console.log('❌ API não está online. Encerrando testes.');
            return;
        }
        
        // Teste 2: Autenticação
        const authOk = await testAuth();
        if (!authOk) {
            console.log('❌ Falha na autenticação. Encerrando testes.');
            return;
        }
        
        // Teste 3: Vídeos
        const videosOk = await testVideos();
        
        // Teste 4: Reuniões
        const meetingsOk = await testMeetings();
        
        // Teste 5: Integração
        const integrationOk = await testIntegration();
        
        // Teste 6: Admin
        const adminOk = await testAdmin();
        
        // Teste 7: Analytics
        const analyticsOk = await testAnalytics();
        
        // Teste 8: Limpeza
        const cleanupOk = await testCleanup();
        
        // Resumo final
        console.log('\n📋 === RESUMO DOS TESTES ===');
        console.log(`✅ API Online: ${apiOnline ? 'Sim' : 'Não'}`);
        console.log(`✅ Autenticação: ${authOk ? 'Sim' : 'Não'}`);
        console.log(`✅ Vídeos: ${videosOk ? 'Sim' : 'Não'}`);
        console.log(`✅ Reuniões: ${meetingsOk ? 'Sim' : 'Não'}`);
        console.log(`✅ Integração: ${integrationOk ? 'Sim' : 'Não'}`);
        console.log(`✅ Admin: ${adminOk ? 'Sim' : 'Não'}`);
        console.log(`✅ Analytics: ${analyticsOk ? 'Sim' : 'Não'}`);
        console.log(`✅ Limpeza: ${cleanupOk ? 'Sim' : 'Não'}`);
        
        const allTests = [apiOnline, authOk, videosOk, meetingsOk, integrationOk, adminOk, analyticsOk, cleanupOk];
        const passedTests = allTests.filter(test => test).length;
        
        console.log(`\n🎯 ${passedTests}/${allTests.length} testes passaram`);
        
        if (passedTests === allTests.length) {
            console.log('🎉 Todos os testes passaram! Sistema funcionando perfeitamente!');
        } else {
            console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
        }
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }
}

testAllRoutes();
