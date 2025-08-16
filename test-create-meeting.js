const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = require('./models/User');
const Video = require('./models/Video');
const Meeting = require('./models/Meeting');
const TokenUsage = require('./models/TokenUsage');

async function testCreateMeeting() {
    try {
        console.log('🧪 Testando criação de reunião...\n');

        // 1. Verificar usuário teste
        const user = await User.findOne({ email: 'teste90@gmail.com' });
        if (!user) {
            console.log('❌ Usuário teste90@gmail.com não encontrado');
            return;
        }
        console.log(`👤 Usuário encontrado: ${user.name} (${user.email})`);
        console.log(`💰 Tokens atuais: ${user.visionTokens}\n`);

        // 2. Verificar vídeos disponíveis
        const videos = await Video.find({ user: user._id });
        console.log(`📹 Vídeos disponíveis: ${videos.length}`);
        
        if (videos.length === 0) {
            console.log('❌ Nenhum vídeo encontrado para o usuário');
            console.log('   Criando vídeo de teste...');
            
            const testVideo = new Video({
                title: 'Vídeo de Teste',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                type: 'url',
                user: user._id
            });
            await testVideo.save();
            console.log('✅ Vídeo de teste criado');
        } else {
            console.log('✅ Vídeos encontrados');
            videos.forEach((video, index) => {
                console.log(`   ${index + 1}. ${video.title} (${video.url})`);
            });
        }

        // 3. Criar reunião de teste
        const videoToUse = videos.length > 0 ? videos[0] : await Video.findOne({ user: user._id });
        if (!videoToUse) {
            console.log('❌ Nenhum vídeo disponível para criar reunião');
            return;
        }

        console.log(`\n🎬 Criando reunião com vídeo: ${videoToUse.title}`);
        
        const meetingId = 'test-' + Math.random().toString(36).substr(2, 9);
        const meetLink = `http://localhost:3000/meet/${meetingId}`;

        const meeting = new Meeting({
            meetingId: meetingId,
            title: 'Reunião de Teste',
            description: 'Reunião criada para testar o sistema de tokens',
            video: videoToUse._id,
            creator: user._id,
            meetLink: meetLink,
            creatorIP: '127.0.0.1',
            status: 'active'
        });

        await meeting.save();
        console.log('✅ Reunião criada com sucesso');

        // 4. Descontar token do usuário
        user.visionTokens -= 1;
        await user.save();
        console.log(`💰 Tokens após desconto: ${user.visionTokens}`);

        // 5. Registrar uso de tokens
        const tokenUsage = new TokenUsage({
            user: user._id,
            meeting: meeting._id,
            tokensUsed: 1,
            action: 'meeting_created',
            description: `Criação da reunião: ${meeting.title}`
        });

        await tokenUsage.save();
        console.log('✅ Uso de tokens registrado');

        // 6. Verificar se foi registrado corretamente
        const totalTokenUsage = await TokenUsage.countDocuments();
        const totalTokensConsumed = await TokenUsage.aggregate([
            { $group: { _id: null, total: { $sum: '$tokensUsed' } } }
        ]);

        console.log(`\n📊 Verificação final:`);
        console.log(`   - Total de registros TokenUsage: ${totalTokenUsage}`);
        console.log(`   - Total de tokens consumidos: ${totalTokensConsumed[0]?.total || 0}`);
        console.log(`   - Reuniões criadas: ${await Meeting.countDocuments()}`);

        console.log('\n✅ Teste concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        mongoose.connection.close();
    }
}

testCreateMeeting();
