const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testTokenUsage() {
    try {
        console.log('🔍 Testando sistema de tokens consumidos...');
        
        // Verificar conexão
        console.log('📊 Status da conexão:', mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado');
        
        // Carregar modelos
        const TokenUsage = require('./models/TokenUsage');
        const User = require('./models/User');
        const Meeting = require('./models/Meeting');
        
        console.log('✅ Modelos carregados');
        
        // Verificar registros de TokenUsage
        const tokenUsageCount = await TokenUsage.countDocuments();
        console.log('📊 Total de registros de TokenUsage:', tokenUsageCount);
        
        if (tokenUsageCount > 0) {
            const tokenUsages = await TokenUsage.find().populate('user', 'name email').populate('meeting', 'title meetingId');
            console.log('📋 Registros de TokenUsage:');
            tokenUsages.forEach(usage => {
                console.log(`   - Usuário: ${usage.user?.name || 'N/A'} (${usage.user?.email || 'N/A'})`);
                console.log(`   - Reunião: ${usage.meeting?.title || 'N/A'} (${usage.meeting?.meetingId || 'N/A'})`);
                console.log(`   - Tokens usados: ${usage.tokensUsed}`);
                console.log(`   - Ação: ${usage.action}`);
                console.log(`   - Data: ${usage.createdAt}`);
                console.log('   ---');
            });
        }
        
        // Verificar usuários e seus tokens
        const users = await User.find().select('name email visionTokens isAdmin');
        console.log('👥 Usuários e tokens:');
        users.forEach(user => {
            console.log(`   - ${user.name} (${user.email}): ${user.visionTokens} tokens ${user.isAdmin ? '[ADMIN]' : ''}`);
        });
        
        // Verificar reuniões
        const meetingsCount = await Meeting.countDocuments();
        console.log('📹 Total de reuniões:', meetingsCount);
        
        if (meetingsCount > 0) {
            const meetings = await Meeting.find().populate('creator', 'name email');
            console.log('📋 Reuniões criadas:');
            meetings.forEach(meeting => {
                console.log(`   - ${meeting.title} por ${meeting.creator?.name || 'N/A'} (${meeting.creator?.email || 'N/A'})`);
                console.log(`   - ID: ${meeting.meetingId}`);
                console.log(`   - Data: ${meeting.createdAt}`);
                console.log('   ---');
            });
        }
        
        // Calcular tokens consumidos
        const tokensConsumedResult = await TokenUsage.aggregate([
            { $group: { _id: null, total: { $sum: '$tokensUsed' } } }
        ]);
        const totalTokensConsumed = tokensConsumedResult[0]?.total || 0;
        
        console.log('🔥 Total de tokens consumidos (calculado):', totalTokensConsumed);
        
        // Verificar se há discrepância
        const expectedTokensConsumed = meetingsCount * 2; // Cada reunião consome 2 tokens
        console.log('📊 Tokens esperados (reuniões × 2):', expectedTokensConsumed);
        
        if (totalTokensConsumed !== expectedTokensConsumed) {
            console.log('⚠️ DISCREPÂNCIA ENCONTRADA!');
            console.log(`   - Tokens registrados: ${totalTokensConsumed}`);
            console.log(`   - Tokens esperados: ${expectedTokensConsumed}`);
            console.log(`   - Diferença: ${expectedTokensConsumed - totalTokensConsumed}`);
        } else {
            console.log('✅ Tokens consumidos estão corretos!');
        }
        
        console.log('✅ Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        mongoose.connection.close();
    }
}

testTokenUsage();
