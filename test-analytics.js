const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = require('./models/User');
const Meeting = require('./models/Meeting');
const TokenUsage = require('./models/TokenUsage');

async function testAnalytics() {
    try {
        console.log('🔍 Testando API de Analytics...\n');

        // 1. Verificar dados básicos
        const totalUsers = await User.countDocuments();
        const totalMeetings = await Meeting.countDocuments();
        const totalTokens = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$visionTokens' } } }
        ]);
        const tokensConsumed = await TokenUsage.aggregate([
            { $group: { _id: null, total: { $sum: '$tokensUsed' } } }
        ]);

        console.log('📊 Dados básicos:');
        console.log(`   - Total de usuários: ${totalUsers}`);
        console.log(`   - Total de reuniões: ${totalMeetings}`);
        console.log(`   - Total de tokens disponíveis: ${totalTokens[0]?.total || 0}`);
        console.log(`   - Total de tokens consumidos: ${tokensConsumed[0]?.total || 0}`);

        // 2. Verificar usuários admin
        const adminUsers = await User.find({ isAdmin: true }).select('name email');
        console.log(`\n👑 Usuários admin: ${adminUsers.length}`);
        adminUsers.forEach(user => {
            console.log(`   - ${user.name} (${user.email})`);
        });

        // 3. Verificar se há dados suficientes para analytics
        if (totalUsers === 0) {
            console.log('\n⚠️  Nenhum usuário encontrado - Analytics pode estar vazio');
        }
        
        if (totalMeetings === 0) {
            console.log('\n⚠️  Nenhuma reunião encontrada - Analytics pode estar vazio');
        }

        if (tokensConsumed[0]?.total === 0) {
            console.log('\n⚠️  Nenhum token consumido - Analytics pode estar vazio');
        }

        // 4. Simular dados de analytics
        console.log('\n📈 Simulação de dados de analytics:');
        
        // Estatísticas do período atual (30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const recentMeetings = await Meeting.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const recentTokens = await TokenUsage.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        console.log(`   - Usuários nos últimos 30 dias: ${recentUsers}`);
        console.log(`   - Reuniões nos últimos 30 dias: ${recentMeetings}`);
        console.log(`   - Tokens consumidos nos últimos 30 dias: ${recentTokens}`);

        // 5. Verificar se a API retornaria dados
        const mockStats = {
            totalUsers,
            totalMeetings,
            totalTokens: tokensConsumed[0]?.total || 0,
            totalRevenue: (tokensConsumed[0]?.total || 0) * 2, // R$ 2,00 por token
            usersChange: 0,
            meetingsChange: 0,
            tokensChange: 0,
            revenueChange: 0
        };

        console.log('\n📊 Dados que a API retornaria:');
        console.log(JSON.stringify(mockStats, null, 2));

        // 6. Verificar se há problemas potenciais
        console.log('\n🔍 Diagnóstico:');
        
        if (totalUsers === 0) {
            console.log('❌ Problema: Nenhum usuário no sistema');
        } else {
            console.log('✅ OK: Usuários encontrados');
        }
        
        if (totalMeetings === 0) {
            console.log('❌ Problema: Nenhuma reunião criada');
        } else {
            console.log('✅ OK: Reuniões encontradas');
        }
        
        if (tokensConsumed[0]?.total === 0) {
            console.log('❌ Problema: Nenhum token consumido registrado');
        } else {
            console.log('✅ OK: Tokens consumidos registrados');
        }

        if (adminUsers.length === 0) {
            console.log('❌ Problema: Nenhum usuário admin encontrado');
        } else {
            console.log('✅ OK: Usuários admin encontrados');
        }

        console.log('\n💡 Soluções:');
        if (totalUsers === 0) {
            console.log('   - Criar usuários de teste');
        }
        if (totalMeetings === 0) {
            console.log('   - Criar reuniões de teste');
        }
        if (tokensConsumed[0]?.total === 0) {
            console.log('   - Verificar se o sistema está registrando uso de tokens');
        }

    } catch (error) {
        console.error('❌ Erro ao testar analytics:', error);
    } finally {
        mongoose.connection.close();
    }
}

testAnalytics();
