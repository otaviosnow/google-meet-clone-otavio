const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const TokenUsage = require('./models/TokenUsage');
const User = require('./models/User');
const Meeting = require('./models/Meeting');

async function testTokenUsage() {
    try {
        console.log('🔍 Testando registro de uso de tokens...\n');

        // 1. Verificar se existem registros de TokenUsage
        const totalTokenUsage = await TokenUsage.countDocuments();
        console.log(`📊 Total de registros TokenUsage: ${totalTokenUsage}`);

        if (totalTokenUsage > 0) {
            const recentUsage = await TokenUsage.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'name email')
                .populate('meeting', 'title meetingId');

            console.log('\n📝 Últimos 5 registros de uso de tokens:');
            recentUsage.forEach((usage, index) => {
                console.log(`${index + 1}. ${usage.description}`);
                console.log(`   - Usuário: ${usage.user?.name} (${usage.user?.email})`);
                console.log(`   - Reunião: ${usage.meeting?.title} (${usage.meeting?.meetingId})`);
                console.log(`   - Tokens usados: ${usage.tokensUsed}`);
                console.log(`   - Data: ${usage.createdAt.toLocaleString('pt-BR')}`);
                console.log('');
            });
        }

        // 2. Verificar total de tokens consumidos
        const tokensConsumedResult = await TokenUsage.aggregate([
            { $group: { _id: null, total: { $sum: '$tokensUsed' } } }
        ]);
        const totalTokensConsumed = tokensConsumedResult[0]?.total || 0;
        console.log(`💰 Total de tokens consumidos: ${totalTokensConsumed}`);

        // 3. Verificar usuários e seus tokens
        const users = await User.find().select('name email visionTokens');
        console.log('\n👥 Usuários e seus tokens:');
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}): ${user.visionTokens} tokens`);
        });

        // 4. Verificar reuniões criadas
        const totalMeetings = await Meeting.countDocuments();
        console.log(`\n🎯 Total de reuniões criadas: ${totalMeetings}`);

        if (totalMeetings > 0) {
            const recentMeetings = await Meeting.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('creator', 'name email');

            console.log('\n📅 Últimas 5 reuniões:');
            recentMeetings.forEach((meeting, index) => {
                console.log(`${index + 1}. ${meeting.title}`);
                console.log(`   - Criador: ${meeting.creator?.name} (${meeting.creator?.email})`);
                console.log(`   - ID: ${meeting.meetingId}`);
                console.log(`   - Data: ${meeting.createdAt.toLocaleString('pt-BR')}`);
                console.log('');
            });
        }

        // 5. Verificar se há discrepância entre reuniões e uso de tokens
        if (totalMeetings > 0 && totalTokenUsage === 0) {
            console.log('⚠️  ALERTA: Existem reuniões criadas mas nenhum registro de uso de tokens!');
            console.log('   Isso indica que o sistema não está registrando o uso de tokens corretamente.');
        } else if (totalMeetings === totalTokenUsage) {
            console.log('✅ OK: Número de reuniões corresponde ao número de registros de uso de tokens');
        } else {
            console.log(`⚠️  Discrepância: ${totalMeetings} reuniões vs ${totalTokenUsage} registros de uso`);
        }

    } catch (error) {
        console.error('❌ Erro ao testar uso de tokens:', error);
    } finally {
        mongoose.connection.close();
    }
}

testTokenUsage();
