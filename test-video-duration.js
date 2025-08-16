const mongoose = require('mongoose');
const Meeting = require('./models/Meeting');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testVideoDuration() {
    try {
        console.log('🧪 Testando funcionalidade de duração do vídeo...\n');
        
        // Buscar reuniões existentes
        const meetings = await Meeting.find({}).limit(5);
        console.log(`📊 Encontradas ${meetings.length} reuniões para teste\n`);
        
        if (meetings.length === 0) {
            console.log('❌ Nenhuma reunião encontrada para teste');
            return;
        }
        
        // Testar com a primeira reunião
        const meeting = meetings[0];
        console.log(`🔍 Testando reunião: ${meeting.meetingId}`);
        console.log(`   - Status: ${meeting.status}`);
        console.log(`   - Duração máxima atual: ${meeting.maxDuration / 1000 / 60} minutos`);
        console.log(`   - Duração do vídeo: ${meeting.videoDuration ? meeting.videoDuration / 1000 + ' segundos' : 'Não definida'}`);
        console.log(`   - Iniciada em: ${meeting.startedAt ? meeting.startedAt.toLocaleString('pt-BR') : 'Não iniciada'}`);
        
        // Simular duração de vídeo (5 minutos)
        const videoDurationMs = 5 * 60 * 1000; // 5 minutos
        console.log(`\n⏱️ Simulando duração do vídeo: ${videoDurationMs / 1000} segundos`);
        
        // Atualizar duração do vídeo
        await meeting.updateVideoDuration(videoDurationMs);
        console.log('✅ Duração do vídeo atualizada');
        
        // Verificar se a reunião expirou
        console.log('\n🔍 Verificando expiração...');
        const isExpired = meeting.isExpired();
        console.log(`   - Expirou: ${isExpired ? 'Sim' : 'Não'}`);
        
        if (meeting.startedAt) {
            const now = new Date();
            const elapsed = now.getTime() - meeting.startedAt.getTime();
            const videoDurationWithMargin = meeting.videoDuration + (30 * 1000);
            console.log(`   - Tempo decorrido: ${Math.round(elapsed / 1000)} segundos`);
            console.log(`   - Duração com margem: ${Math.round(videoDurationWithMargin / 1000)} segundos`);
        }
        
        // Testar com diferentes durações
        console.log('\n🧪 Testando diferentes durações...');
        const testDurations = [
            { name: 'Vídeo curto', duration: 2 * 60 * 1000 }, // 2 minutos
            { name: 'Vídeo médio', duration: 10 * 60 * 1000 }, // 10 minutos
            { name: 'Vídeo longo', duration: 30 * 60 * 1000 }  // 30 minutos
        ];
        
        for (const test of testDurations) {
            await meeting.updateVideoDuration(test.duration);
            const isExpired = meeting.isExpired();
            console.log(`   - ${test.name} (${test.duration / 1000}s): ${isExpired ? 'Expirou' : 'Ativa'}`);
        }
        
        console.log('\n✅ Teste de duração do vídeo concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexão com MongoDB fechada');
    }
}

testVideoDuration();
