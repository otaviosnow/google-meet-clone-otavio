const Meeting = require('../models/Meeting');

/**
 * Limpa reuniões expiradas do banco de dados
 * Remove apenas reuniões que foram encerradas há mais de 24 horas
 */
async function cleanupExpiredMeetings() {
    try {
        console.log('🧹 Iniciando limpeza de reuniões expiradas...');
        
        // Calcular data limite (24 horas atrás)
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - 24);
        
        // Buscar reuniões encerradas há mais de 24 horas
        const expiredMeetings = await Meeting.find({
            status: 'ended',
            endedAt: { $lt: cutoffDate }
        });
        
        console.log(`📊 Encontradas ${expiredMeetings.length} reuniões expiradas para remoção`);
        
        if (expiredMeetings.length > 0) {
            // Remover reuniões expiradas
            const result = await Meeting.deleteMany({
                status: 'ended',
                endedAt: { $lt: cutoffDate }
            });
            
            console.log(`✅ Removidas ${result.deletedCount} reuniões expiradas`);
            
            // Log detalhado das reuniões removidas
            expiredMeetings.forEach(meeting => {
                console.log(`   - Removida: ${meeting.meetingId} (encerrada em ${meeting.endedAt.toLocaleString('pt-BR')})`);
            });
        } else {
            console.log('✅ Nenhuma reunião expirada encontrada para remoção');
        }
        
        return {
            success: true,
            removedCount: expiredMeetings.length,
            cutoffDate: cutoffDate
        };
        
    } catch (error) {
        console.error('❌ Erro ao limpar reuniões expiradas:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verifica e marca reuniões como expiradas baseado no tempo
 */
async function checkAndMarkExpiredMeetings() {
    try {
        console.log('⏰ Verificando reuniões que devem ser marcadas como expiradas...');
        
        // Buscar reuniões ativas que podem ter expirado
        const activeMeetings = await Meeting.find({
            status: 'active',
            startedAt: { $exists: true, $ne: null }
        });
        
        let markedAsExpired = 0;
        
        for (const meeting of activeMeetings) {
            if (meeting.isExpired()) {
                console.log(`⏰ Marcando reunião como expirada: ${meeting.meetingId}`);
                meeting.status = 'ended';
                meeting.endedAt = new Date();
                await meeting.save();
                markedAsExpired++;
            }
        }
        
        console.log(`✅ ${markedAsExpired} reuniões marcadas como expiradas`);
        
        return {
            success: true,
            markedAsExpired
        };
        
    } catch (error) {
        console.error('❌ Erro ao verificar reuniões expiradas:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Executa limpeza completa: marca como expiradas e remove antigas
 */
async function runCompleteCleanup() {
    try {
        console.log('🔄 Iniciando limpeza completa do sistema...');
        
        // Primeiro, marcar reuniões como expiradas
        const markResult = await checkAndMarkExpiredMeetings();
        
        // Depois, remover reuniões antigas
        const cleanupResult = await cleanupExpiredMeetings();
        
        console.log('✅ Limpeza completa concluída');
        
        return {
            success: true,
            markedAsExpired: markResult.markedAsExpired || 0,
            removedCount: cleanupResult.removedCount || 0
        };
        
    } catch (error) {
        console.error('❌ Erro na limpeza completa:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    cleanupExpiredMeetings,
    checkAndMarkExpiredMeetings,
    runCompleteCleanup
};
