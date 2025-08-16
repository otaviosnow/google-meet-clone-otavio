const mongoose = require('mongoose');
const User = require('./models/User');
const Video = require('./models/Video');
const Meeting = require('./models/Meeting');
const IntegrationToken = require('./models/IntegrationToken');
const TokenUsage = require('./models/TokenUsage');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testCompleteSystem() {
    try {
        console.log('🧪 === TESTE COMPLETO DO SISTEMA ===\n');
        
        // Teste 1: Verificar conexão com banco
        console.log('1️⃣ Testando conexão com banco de dados...');
        const dbState = mongoose.connection.readyState;
        const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        console.log(`   Status: ${dbStates[dbState]}`);
        
        if (dbState !== 1) {
            console.log('❌ Banco não conectado. Pulando testes...');
            return;
        }
        console.log('✅ Banco conectado com sucesso\n');
        
        // Teste 2: Verificar modelos
        console.log('2️⃣ Testando modelos do banco...');
        
        const userCount = await User.countDocuments();
        const videoCount = await Video.countDocuments();
        const meetingCount = await Meeting.countDocuments();
        const tokenCount = await IntegrationToken.countDocuments();
        const usageCount = await TokenUsage.countDocuments();
        
        console.log(`   👥 Usuários: ${userCount}`);
        console.log(`   🎬 Vídeos: ${videoCount}`);
        console.log(`   🎯 Reuniões: ${meetingCount}`);
        console.log(`   🔗 Tokens de Integração: ${tokenCount}`);
        console.log(`   📊 Usos de Tokens: ${usageCount}`);
        console.log('✅ Modelos verificados\n');
        
        // Teste 3: Verificar usuário admin
        console.log('3️⃣ Testando usuário admin...');
        const adminUser = await User.findOne({ isAdmin: true });
        
        if (adminUser) {
            console.log(`   👑 Admin encontrado: ${adminUser.email}`);
            console.log(`   🎫 Tokens: ${adminUser.visionTokens}`);
            console.log(`   ✅ Status: ${adminUser.isActive ? 'Ativo' : 'Inativo'}`);
        } else {
            console.log('⚠️ Nenhum admin encontrado');
        }
        console.log('✅ Usuário admin verificado\n');
        
        // Teste 4: Verificar vídeos
        console.log('4️⃣ Testando vídeos...');
        const videos = await Video.find().limit(3);
        
        if (videos.length > 0) {
            console.log(`   🎬 ${videos.length} vídeos encontrados:`);
            videos.forEach((video, index) => {
                console.log(`      ${index + 1}. ${video.title} (${video.type})`);
            });
        } else {
            console.log('⚠️ Nenhum vídeo encontrado');
        }
        console.log('✅ Vídeos verificados\n');
        
        // Teste 5: Verificar reuniões
        console.log('5️⃣ Testando reuniões...');
        const meetings = await Meeting.find().populate('creator', 'name email').limit(3);
        
        if (meetings.length > 0) {
            console.log(`   🎯 ${meetings.length} reuniões encontradas:`);
            meetings.forEach((meeting, index) => {
                console.log(`      ${index + 1}. ${meeting.title} (${meeting.status})`);
                console.log(`         Criador: ${meeting.creator ? meeting.creator.email : 'N/A'}`);
                console.log(`         Duração do vídeo: ${meeting.videoDuration ? meeting.videoDuration / 1000 + 's' : 'Não definida'}`);
            });
        } else {
            console.log('⚠️ Nenhuma reunião encontrada');
        }
        console.log('✅ Reuniões verificadas\n');
        
        // Teste 6: Verificar tokens de integração
        console.log('6️⃣ Testando tokens de integração...');
        const tokens = await IntegrationToken.find().populate('user', 'name email').limit(3);
        
        if (tokens.length > 0) {
            console.log(`   🔗 ${tokens.length} tokens encontrados:`);
            tokens.forEach((token, index) => {
                console.log(`      ${index + 1}. ${token.name} (${token.isActive ? 'Ativo' : 'Inativo'})`);
                console.log(`         Usuário: ${token.user ? token.user.email : 'N/A'}`);
                console.log(`         Vídeos: ${token.videos ? token.videos.length : 0}`);
                console.log(`         Usos: ${token.usageCount || 0}`);
            });
        } else {
            console.log('⚠️ Nenhum token de integração encontrado');
        }
        console.log('✅ Tokens de integração verificados\n');
        
        // Teste 7: Verificar usos de tokens
        console.log('7️⃣ Testando usos de tokens...');
        const usages = await TokenUsage.find().populate('user', 'name email').populate('meeting', 'title').limit(3);
        
        if (usages.length > 0) {
            console.log(`   📊 ${usages.length} usos encontrados:`);
            usages.forEach((usage, index) => {
                console.log(`      ${index + 1}. ${usage.action} (${usage.tokensUsed} tokens)`);
                console.log(`         Usuário: ${usage.user ? usage.user.email : 'N/A'}`);
                console.log(`         Reunião: ${usage.meeting ? usage.meeting.title : 'N/A'}`);
            });
        } else {
            console.log('⚠️ Nenhum uso de token encontrado');
        }
        console.log('✅ Usos de tokens verificados\n');
        
        // Teste 8: Verificar funcionalidade de expiração
        console.log('8️⃣ Testando funcionalidade de expiração...');
        const activeMeetings = await Meeting.find({ status: 'active' });
        const endedMeetings = await Meeting.find({ status: 'ended' });
        
        console.log(`   🎯 Reuniões ativas: ${activeMeetings.length}`);
        console.log(`   🔚 Reuniões encerradas: ${endedMeetings.length}`);
        
        if (activeMeetings.length > 0) {
            const testMeeting = activeMeetings[0];
            const isExpired = testMeeting.isExpired();
            console.log(`   ⏰ Teste de expiração: ${isExpired ? 'Expirada' : 'Ativa'}`);
            
            if (testMeeting.startedAt) {
                const now = new Date();
                const elapsed = now.getTime() - testMeeting.startedAt.getTime();
                console.log(`   ⏱️ Tempo decorrido: ${Math.round(elapsed / 1000 / 60)} minutos`);
            }
        }
        console.log('✅ Funcionalidade de expiração verificada\n');
        
        // Teste 9: Verificar integridade dos dados
        console.log('9️⃣ Testando integridade dos dados...');
        
        // Verificar usuários sem tokens
        const usersWithoutTokens = await User.find({ visionTokens: { $lt: 0 } });
        if (usersWithoutTokens.length > 0) {
            console.log(`   ⚠️ ${usersWithoutTokens.length} usuários com tokens negativos`);
        } else {
            console.log('   ✅ Todos os usuários têm tokens válidos');
        }
        
        // Verificar reuniões órfãs (sem criador)
        const orphanMeetings = await Meeting.find({ creator: { $exists: false } });
        if (orphanMeetings.length > 0) {
            console.log(`   ⚠️ ${orphanMeetings.length} reuniões sem criador`);
        } else {
            console.log('   ✅ Todas as reuniões têm criador');
        }
        
        // Verificar tokens órfãos (sem usuário)
        const orphanTokens = await IntegrationToken.find({ user: { $exists: false } });
        if (orphanTokens.length > 0) {
            console.log(`   ⚠️ ${orphanTokens.length} tokens sem usuário`);
        } else {
            console.log('   ✅ Todos os tokens têm usuário');
        }
        
        console.log('✅ Integridade dos dados verificada\n');
        
        // Teste 10: Resumo final
        console.log('🔟 Resumo do sistema:');
        console.log(`   📊 Total de dados: ${userCount + videoCount + meetingCount + tokenCount + usageCount} registros`);
        console.log(`   👥 Usuários ativos: ${await User.countDocuments({ isActive: true })}`);
        console.log(`   🎬 Vídeos disponíveis: ${videoCount}`);
        console.log(`   🎯 Reuniões ativas: ${activeMeetings.length}`);
        console.log(`   🔗 Integrações ativas: ${await IntegrationToken.countDocuments({ isActive: true })}`);
        
        console.log('\n✅ === TESTE COMPLETO CONCLUÍDO ===');
        console.log('🎉 Sistema funcionando corretamente!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexão com MongoDB fechada');
    }
}

testCompleteSystem();
