const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Meeting = require('./models/Meeting');
const User = require('./models/User');
const Video = require('./models/Video');

async function testMeetingExpiration() {
    try {
        console.log('🧪 Testando expiração de reuniões...\n');

        // 1. Verificar reuniões existentes
        const meetings = await Meeting.find().populate('video creator');
        console.log(`📊 Total de reuniões: ${meetings.length}`);

        if (meetings.length === 0) {
            console.log('❌ Nenhuma reunião encontrada para testar');
            return;
        }

        // 2. Testar cada reunião
        for (const meeting of meetings) {
            console.log(`\n🔍 Testando reunião: ${meeting.meetingId}`);
            console.log(`   - Status: ${meeting.status}`);
            console.log(`   - Criada em: ${meeting.createdAt.toLocaleString('pt-BR')}`);
            console.log(`   - Iniciada em: ${meeting.startedAt ? meeting.startedAt.toLocaleString('pt-BR') : 'Não iniciada'}`);
            console.log(`   - Encerrada em: ${meeting.endedAt ? meeting.endedAt.toLocaleString('pt-BR') : 'Não encerrada'}`);
            console.log(`   - Duração máxima: ${meeting.maxDuration / 1000 / 60} minutos`);

            // Testar acesso com IP do criador
            const creatorAccess = meeting.canAccess(meeting.creatorIP);
            console.log(`   - Acesso do criador (${meeting.creatorIP}): ${creatorAccess ? '✅ Permitido' : '❌ Negado'}`);

            // Testar acesso com IP diferente
            const otherIP = '192.168.1.100';
            const otherAccess = meeting.canAccess(otherIP);
            console.log(`   - Acesso de outro IP (${otherIP}): ${otherAccess ? '✅ Permitido' : '❌ Negado'}`);

            // Verificar se expirou por tempo
            const isExpired = meeting.isExpired();
            console.log(`   - Expirou por tempo: ${isExpired ? '✅ Sim' : '❌ Não'}`);

            // Testar autorização de acesso
            const accessResult = meeting.authorizeAccess(meeting.creatorIP);
            console.log(`   - Resultado autorização: ${accessResult.authorized ? '✅ Autorizado' : '❌ Negado'}`);
            if (!accessResult.authorized) {
                console.log(`     - Motivo: ${accessResult.reason}`);
            }
        }

        // 3. Criar reunião de teste expirada
        console.log('\n🧪 Criando reunião de teste expirada...');
        
        const testUser = await User.findOne();
        const testVideo = await Video.findOne();
        
        if (!testUser || !testVideo) {
            console.log('❌ Usuário ou vídeo não encontrado para teste');
            return;
        }

        const expiredMeeting = new Meeting({
            meetingId: 'test-expired-' + Math.random().toString(36).substr(2, 9),
            title: 'Reunião de Teste Expirada',
            video: testVideo._id,
            creator: testUser._id,
            meetLink: 'http://localhost:3000/meet/test-expired',
            creatorIP: '127.0.0.1',
            status: 'active',
            startedAt: new Date(Date.now() - (25 * 60 * 1000)), // 25 minutos atrás
            maxDuration: 20 * 60 * 1000 // 20 minutos
        });

        await expiredMeeting.save();
        console.log('✅ Reunião expirada criada:', expiredMeeting.meetingId);

        // 4. Testar reunião expirada
        console.log('\n🔍 Testando reunião expirada...');
        console.log(`   - Status: ${expiredMeeting.status}`);
        console.log(`   - Iniciada em: ${expiredMeeting.startedAt.toLocaleString('pt-BR')}`);
        console.log(`   - Duração máxima: ${expiredMeeting.maxDuration / 1000 / 60} minutos`);
        
        const isExpired = expiredMeeting.isExpired();
        console.log(`   - Expirou por tempo: ${isExpired ? '✅ Sim' : '❌ Não'}`);

        const accessBefore = expiredMeeting.canAccess(expiredMeeting.creatorIP);
        console.log(`   - Acesso antes da verificação: ${accessBefore ? '✅ Permitido' : '❌ Negado'}`);

        // Simular verificação de acesso que deve marcar como expirada
        const accessAfter = expiredMeeting.canAccess(expiredMeeting.creatorIP);
        console.log(`   - Acesso após verificação: ${accessAfter ? '✅ Permitido' : '❌ Negado'}`);
        console.log(`   - Status após verificação: ${expiredMeeting.status}`);

        // 5. Testar encerramento manual
        console.log('\n🧪 Testando encerramento manual...');
        await expiredMeeting.endMeeting();
        console.log(`   - Status após encerramento: ${expiredMeeting.status}`);
        console.log(`   - Encerrada em: ${expiredMeeting.endedAt.toLocaleString('pt-BR')}`);

        const accessAfterEnd = expiredMeeting.canAccess(expiredMeeting.creatorIP);
        console.log(`   - Acesso após encerramento: ${accessAfterEnd ? '✅ Permitido' : '❌ Negado'}`);

        // 6. Limpar reunião de teste
        await Meeting.findByIdAndDelete(expiredMeeting._id);
        console.log('✅ Reunião de teste removida');

        console.log('\n✅ Teste de expiração concluído!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        mongoose.connection.close();
    }
}

testMeetingExpiration();
