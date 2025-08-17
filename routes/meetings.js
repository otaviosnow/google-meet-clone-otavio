const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const Video = require('../models/Video');
const User = require('../models/User');
const TokenUsage = require('../models/TokenUsage');

const router = express.Router();

// Criar nova reunião
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, videoId } = req.body;
        
        if (!title || !videoId) {
            return res.status(400).json({ error: 'Título e vídeo são obrigatórios' });
        }

        // Verificar se o vídeo existe e pertence ao usuário
        const video = await Video.findOne({ _id: videoId, user: req.user._id });
        if (!video) {
            return res.status(404).json({ error: 'Vídeo não encontrado' });
        }

        // Gerar ID da reunião
        const meetingId = 'meet-' + Math.random().toString(36).substr(2, 9);
        const meetLink = `${req.protocol}://${req.get('host')}/meet/${meetingId}`;
        
        // Obter IP do criador
        const creatorIP = req.ip || req.connection.remoteAddress;

        const meeting = new Meeting({
            meetingId: meetingId,
            title,
            description: '',
            video: videoId,
            creator: req.user._id,
            meetLink: meetLink,
            creatorIP: creatorIP,
            status: 'active'
        });

        await meeting.save();

        // Descontar 1 token do usuário
        const user = await User.findById(req.user._id);
        if (user.visionTokens < 1) {
            return res.status(400).json({ 
                error: 'Tokens insuficientes. Você precisa de 1 token para criar uma reunião.',
                needsTokens: true,
                tokenPrice: 2.00
            });
        }
        
        user.visionTokens -= 1;
        await user.save();

        // Registrar uso de tokens
        console.log('📝 [MEETING] Registrando uso de tokens...');
        console.log('   - User ID:', req.user._id);
        console.log('   - Meeting ID:', meeting._id);
        console.log('   - Tokens to use:', 1);
        
        const tokenUsage = new TokenUsage({
            user: req.user._id,
            meeting: meeting._id,
            tokensUsed: 1,
            action: 'meeting_created',
            description: `Criação da reunião: ${title}`
        });
        
        console.log('📝 [MEETING] TokenUsage criado, salvando...');
        await tokenUsage.save();
        console.log('✅ [MEETING] TokenUsage salvo com sucesso - ID:', tokenUsage._id);

        console.log(`✅ Reunião criada: ${meetingId} - Tokens descontados: ${user.visionTokens + 1} → ${user.visionTokens}`);

        // Popular dados do vídeo para retorno
        await meeting.populate('video', 'title url type');

        res.status(201).json({
            message: 'Reunião criada com sucesso',
            meeting: meeting,
            tokensRemaining: user.visionTokens
        });

    } catch (error) {
        console.error('Erro ao criar reunião:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Obter reunião por ID
router.get('/:meetingId', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const userIP = req.ip || req.connection.remoteAddress;

        console.log(`🔍 Buscando reunião: ${meetingId} - IP: ${userIP}`);

        const meeting = await Meeting.findOne({ meetingId }).populate('video', 'title url type');
        
        if (!meeting) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }

        // Verificar se o IP pode acessar a reunião
        if (!meeting.canAccess(userIP)) {
            console.log(`❌ Acesso negado para IP: ${userIP} - Reunião: ${meetingId}`);
            return res.status(403).json({ 
                error: 'Acesso negado. Esta reunião já está sendo utilizada por outra pessoa ou foi encerrada.' 
            });
        }

        // Autorizar acesso
        const accessResult = meeting.authorizeAccess(userIP);
        
        if (!accessResult.authorized) {
            console.log(`❌ Acesso não autorizado: ${accessResult.reason}`);
            return res.status(403).json({ error: accessResult.reason });
        }

        await meeting.save();

        console.log(`✅ Reunião acessada: ${meetingId} - IP: ${userIP} - Criador: ${accessResult.isCreator}`);

        res.json({
            meeting: meeting,
            accessInfo: {
                isCreator: accessResult.isCreator,
                isFirstAdditional: accessResult.isFirstAdditional || false
            }
        });

    } catch (error) {
        console.error('Erro ao buscar reunião:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar reuniões do usuário
router.get('/', authenticateToken, async (req, res) => {
    try {
        const meetings = await Meeting.find({ creator: req.user._id })
            .populate('video', 'title url type')
            .sort({ createdAt: -1 });

        res.json(meetings);
    } catch (error) {
        console.error('Erro ao listar reuniões:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Encerrar reunião
router.post('/:meetingId/end', authenticateToken, async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        const meeting = await Meeting.findOne({ meetingId, creator: req.user._id });
        
        if (!meeting) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }

        await meeting.endMeeting();
        
        console.log(`🔚 Reunião encerrada: ${meetingId}`);
        
        res.json({ message: 'Reunião encerrada com sucesso' });
    } catch (error) {
        console.error('Erro ao encerrar reunião:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar duração do vídeo (sem autenticação)
router.post('/:meetingId/video-duration', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { duration, durationMs } = req.body;
        
        console.log(`⏱️ Recebendo duração do vídeo para reunião: ${meetingId}`);
        console.log(`   - Duração: ${duration} segundos`);
        console.log(`   - Duração (ms): ${durationMs} ms`);
        
        const meeting = await Meeting.findOne({ meetingId });
        
        if (!meeting) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }

        // Atualizar a duração do vídeo
        await meeting.updateVideoDuration(durationMs);
        
        console.log(`✅ Duração do vídeo atualizada: ${meetingId} - ${duration} segundos`);
        
        res.json({ 
            message: 'Duração do vídeo atualizada com sucesso',
            duration: duration,
            durationMs: durationMs
        });
    } catch (error) {
        console.error('Erro ao atualizar duração do vídeo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Encerrar reunião quando vídeo termina (sem autenticação)
router.post('/:meetingId/end-video', async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        const meeting = await Meeting.findOne({ meetingId });
        
        if (!meeting) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }

        await meeting.endByVideoCompletion();
        
        console.log(`🎬 Reunião encerrada por término do vídeo: ${meetingId}`);
        
        res.json({ message: 'Reunião encerrada com sucesso' });
    } catch (error) {
        console.error('Erro ao encerrar reunião por vídeo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar reunião
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, creator: req.user._id });
        
        if (!meeting) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }

        await meeting.deleteOne();
        res.json({ message: 'Reunião deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar reunião:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router; 