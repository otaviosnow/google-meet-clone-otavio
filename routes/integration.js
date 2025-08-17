const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const IntegrationToken = require('../models/IntegrationToken');
const User = require('../models/User');
const Video = require('../models/Video');
const Meeting = require('../models/Meeting');
const TokenUsage = require('../models/TokenUsage');

const router = express.Router();

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Validações para criação/atualização de token
const tokenValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Nome deve ter entre 2 e 50 caracteres'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Descrição deve ter no máximo 200 caracteres'),
    body('website')
        .optional()
        .trim()
        .isURL()
        .withMessage('Website deve ser uma URL válida'),
    body('allowedOrigins')
        .optional()
        .isArray()
        .withMessage('Origens permitidas deve ser um array'),
    body('webhookUrl')
        .optional()
        .trim()
        .isURL()
        .withMessage('Webhook URL deve ser uma URL válida'),
    body('videos')
        .optional()
        .isArray()
        .withMessage('Vídeos deve ser um array'),
    body('videos.*.video')
        .optional()
        .isMongoId()
        .withMessage('ID do vídeo deve ser válido'),
    body('videos.*.name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Nome do vídeo deve ter entre 1 e 50 caracteres'),
    body('videos.*.description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Descrição do vídeo deve ter no máximo 200 caracteres'),
    body('videos.*.isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault deve ser true ou false'),
    body('videos.*.order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Ordem deve ser um número inteiro positivo')
];

// GET /api/integration/tokens - Listar tokens do usuário
router.get('/tokens', authenticateToken, async (req, res) => {
    try {
        console.log('🔗 [INTEGRATION] Listando tokens do usuário:', req.user._id);
        
        // Primeiro, vamos verificar se existem tokens sem populate
        const rawTokens = await IntegrationToken.find({ user: req.user._id });
        console.log(`🔍 [INTEGRATION] Tokens brutos encontrados: ${rawTokens.length}`);
        console.log('🔍 [INTEGRATION] IDs dos tokens brutos:', rawTokens.map(t => t._id));
        
        const tokens = await IntegrationToken.find({ user: req.user._id })
            .populate('videos.video', 'title url')
            .sort({ createdAt: -1 });

        console.log(`✅ [INTEGRATION] ${tokens.length} tokens encontrados após populate`);
        console.log('🔍 [INTEGRATION] Tokens encontrados:', tokens.map(t => ({
            id: t._id,
            name: t.name,
            token: t.token,
            user: t.user
        })));

        res.json({
            tokens: tokens.map(token => token.toPublicJSON())
        });

    } catch (error) {
        console.error('❌ [INTEGRATION] Erro ao listar tokens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/integration/tokens - Criar novo token
router.post('/tokens', authenticateToken, tokenValidation, handleValidationErrors, async (req, res) => {
    try {
        console.log('🔗 [INTEGRATION] Criando novo token para usuário:', req.user._id);
        console.log('📝 [INTEGRATION] Dados recebidos:', req.body);

        const { name, description, website, allowedOrigins, webhookUrl, videos } = req.body;

        // Verificar se os vídeos pertencem ao usuário (se fornecidos)
        if (videos && videos.length > 0) {
            for (const videoConfig of videos) {
                if (videoConfig.video) {
                    const video = await Video.findOne({ _id: videoConfig.video, user: req.user._id });
                    if (!video) {
                        return res.status(400).json({ 
                            error: `Vídeo ${videoConfig.video} não encontrado ou não pertence ao usuário` 
                        });
                    }
                }
            }
        }

        // Gerar token único manualmente
        const crypto = require('crypto');
        const prefix = 'int_';
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(8).toString('hex');
        const generatedToken = `${prefix}${timestamp}_${random}`;

        console.log('🔑 [INTEGRATION] Token gerado:', generatedToken);

        const token = new IntegrationToken({
            user: req.user._id,
            token: generatedToken,
            name,
            description,
            website,
            allowedOrigins,
            webhookUrl,
            videos
        });

        await token.save();

        console.log('✅ [INTEGRATION] Token criado com sucesso:', token._id);
        console.log('🔍 [INTEGRATION] Token salvo:', {
            id: token._id,
            name: token.name,
            token: token.token,
            user: token.user,
            createdAt: token.createdAt
        });
        
        // Verificar se o token foi realmente salvo
        const savedToken = await IntegrationToken.findById(token._id);
        console.log('🔍 [INTEGRATION] Token verificado após salvar:', savedToken ? 'ENCONTRADO' : 'NÃO ENCONTRADO');

        res.status(201).json({
            message: 'Token de integração criado com sucesso',
            token: token.toPublicJSON()
        });

    } catch (error) {
        console.error('❌ [INTEGRATION] Erro ao criar token:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// PUT /api/integration/tokens/:tokenId - Atualizar token
router.put('/tokens/:tokenId', authenticateToken, tokenValidation, handleValidationErrors, async (req, res) => {
    try {
        const { tokenId } = req.params;
        const { name, description, website, allowedOrigins, webhookUrl, videos, isActive } = req.body;

        console.log('🔗 [INTEGRATION] Atualizando token:', tokenId);
        console.log('📝 [INTEGRATION] Dados recebidos:', req.body);

        const token = await IntegrationToken.findOne({ _id: tokenId, user: req.user._id });
        if (!token) {
            return res.status(404).json({ error: 'Token não encontrado' });
        }

        // Verificar se os vídeos pertencem ao usuário (se fornecidos)
        if (videos && videos.length > 0) {
            for (const videoConfig of videos) {
                if (videoConfig.video) {
                    const video = await Video.findOne({ _id: videoConfig.video, user: req.user._id });
                    if (!video) {
                        return res.status(400).json({ 
                            error: `Vídeo ${videoConfig.video} não encontrado ou não pertence ao usuário` 
                        });
                    }
                }
            }
        }

        // Atualizar campos
        if (name !== undefined) token.name = name;
        if (description !== undefined) token.description = description;
        if (website !== undefined) token.website = website;
        if (allowedOrigins !== undefined) token.allowedOrigins = allowedOrigins;
        if (webhookUrl !== undefined) token.webhookUrl = webhookUrl;
        if (videos !== undefined) token.videos = videos;
        if (isActive !== undefined) token.isActive = isActive;

        await token.save();

        console.log('✅ [INTEGRATION] Token atualizado com sucesso');

        res.json({
            message: 'Token atualizado com sucesso',
            token: token.toPublicJSON()
        });

    } catch (error) {
        console.error('❌ [INTEGRATION] Erro ao atualizar token:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DELETE /api/integration/tokens/:tokenId - Deletar token
router.delete('/tokens/:tokenId', authenticateToken, async (req, res) => {
    try {
        const { tokenId } = req.params;

        console.log('🔗 [INTEGRATION] Deletando token:', tokenId);

        const token = await IntegrationToken.findOneAndDelete({ _id: tokenId, user: req.user._id });
        if (!token) {
            return res.status(404).json({ error: 'Token não encontrado' });
        }

        console.log('✅ [INTEGRATION] Token deletado com sucesso');

        res.json({ message: 'Token deletado com sucesso' });

    } catch (error) {
        console.error('❌ [INTEGRATION] Erro ao deletar token:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/integration/create-meeting - API pública para criar reunião
router.post('/create-meeting', async (req, res) => {
    try {
        const { token, title, videoId, redirectUrl, customerInfo } = req.body;
        const origin = req.headers.origin || req.headers.referer;

        console.log('🔗 [INTEGRATION] Requisição de criação de reunião externa');
        console.log('📝 [INTEGRATION] Dados recebidos:', { token, title, videoId, redirectUrl, origin });

        if (!token) {
            return res.status(400).json({ error: 'Token de integração é obrigatório' });
        }

        // Buscar token de integração
        const integrationToken = await IntegrationToken.findOne({ token, isActive: true })
            .populate('user', 'name email visionTokens')
            .populate('videos.video');

        if (!integrationToken) {
            return res.status(401).json({ error: 'Token de integração inválido ou inativo' });
        }

        // Verificar se o usuário tem tokens suficientes
        if (integrationToken.user.visionTokens < 1) {
            return res.status(402).json({ 
                error: 'Tokens insuficientes para criar reunião',
                needsTokens: true,
                tokenPrice: 2.00
            });
        }

        // Proteção contra criação de reuniões duplicadas muito rapidamente
        const fiveSecondsAgo = new Date(Date.now() - 5000);
        
        // Identificar usuário único por IP + User Agent
        const userIdentifier = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'unknown';
        const uniqueUserKey = `${userIdentifier}-${userAgent}`;
        
        console.log('🔍 [INTEGRATION] Identificador do usuário:', uniqueUserKey);
        
        // Verificar reuniões recentes do mesmo usuário
        const recentMeetings = await Meeting.countDocuments({
            creator: integrationToken.user._id,
            'integrationData.tokenId': integrationToken._id,
            'integrationData.userIdentifier': uniqueUserKey,
            createdAt: { $gte: fiveSecondsAgo }
        });

        if (recentMeetings > 0) {
            console.log('⚠️ [INTEGRATION] Tentativa de criação duplicada detectada para usuário:', uniqueUserKey);
            return res.status(429).json({ 
                error: 'Aguarde alguns segundos antes de criar outra reunião',
                retryAfter: 5
            });
        }

        // Proteção adicional: Rate limiting global por token (máximo 10 reuniões por minuto)
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const recentMeetingsGlobal = await Meeting.countDocuments({
            creator: integrationToken.user._id,
            'integrationData.tokenId': integrationToken._id,
            createdAt: { $gte: oneMinuteAgo }
        });

        if (recentMeetingsGlobal >= 10) {
            console.log('🚫 [INTEGRATION] Rate limit excedido para token:', integrationToken.token);
            return res.status(429).json({ 
                error: 'Limite de reuniões excedido. Tente novamente em alguns minutos.',
                retryAfter: 60
            });
        }

        // Validar origem (se configurada)
        if (!integrationToken.isOriginAllowed(origin)) {
            console.log('❌ [INTEGRATION] Origem não permitida:', origin);
            return res.status(403).json({ error: 'Origem não permitida' });
        }

        // Determinar vídeo a usar
        let videoToUse = null;
        let videoConfig = null;
        
        if (videoId) {
            // Buscar vídeo específico na lista de vídeos configurados
            videoConfig = integrationToken.videos.find(v => v.video._id.toString() === videoId);
            if (videoConfig) {
                videoToUse = videoConfig.video;
            }
        }
        
        // Se não encontrou vídeo específico, usar o padrão
        if (!videoToUse) {
            videoConfig = integrationToken.videos.find(v => v.isDefault);
            if (videoConfig) {
                videoToUse = videoConfig.video;
            }
        }
        
        // Se ainda não encontrou, usar o primeiro vídeo disponível
        if (!videoToUse && integrationToken.videos.length > 0) {
            videoConfig = integrationToken.videos[0];
            videoToUse = videoConfig.video;
        }
        
        if (!videoToUse) {
            return res.status(400).json({ error: 'Nenhum vídeo disponível para a reunião' });
        }

        // Criar reunião
        const meetingId = 'ext-' + Math.random().toString(36).substr(2, 9);
        const meetLink = `${req.protocol}://${req.get('host')}/meet/${meetingId}?video=${encodeURIComponent(videoToUse.url)}`;

        const meeting = new Meeting({
            meetingId: meetingId,
            title: title || `Reunião via ${integrationToken.name}`,
            description: `Criada via integração: ${integrationToken.name}`,
            video: videoToUse._id,
            creator: integrationToken.user._id,
            meetLink: meetLink,
            creatorIP: req.ip || req.connection.remoteAddress,
            status: 'active',
            integrationData: {
                tokenId: integrationToken._id,
                origin: origin,
                redirectUrl: redirectUrl,
                customerInfo: customerInfo,
                userIdentifier: uniqueUserKey
            }
        });

        await meeting.save();

        // Descontar token do usuário
        const user = await User.findById(integrationToken.user._id);
        user.visionTokens -= 1;
        await user.save();

        // Registrar uso de tokens
        const tokenUsage = new TokenUsage({
            user: integrationToken.user._id,
            meeting: meeting._id,
            tokensUsed: 1,
            action: 'meeting_created',
            description: `Criação via integração: ${integrationToken.name}`
        });
        await tokenUsage.save();

        // Incrementar contador de uso do token de integração
        await integrationToken.incrementUsage();

        console.log('✅ [INTEGRATION] Reunião criada com sucesso:', meetingId);

        // Enviar webhook se configurado
        if (integrationToken.webhookUrl) {
            try {
                const webhookData = {
                    event: 'meeting_created',
                    meetingId: meeting.meetingId,
                    meetLink: meeting.meetLink,
                    title: meeting.title,
                    createdAt: meeting.createdAt,
                    integrationToken: integrationToken.name,
                    customerInfo: customerInfo
                };

                fetch(integrationToken.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookData)
                }).catch(err => {
                    console.error('❌ [INTEGRATION] Erro ao enviar webhook:', err);
                });
            } catch (error) {
                console.error('❌ [INTEGRATION] Erro ao enviar webhook:', error);
            }
        }

        // Retornar resposta
        const response = {
            success: true,
            meetingId: meeting.meetingId,
            meetLink: meeting.meetLink,
            title: meeting.title,
            createdAt: meeting.createdAt
        };

        // Se há URL de redirecionamento, incluir na resposta
        if (redirectUrl) {
            response.redirectUrl = `${redirectUrl}?meetingId=${meeting.meetingId}&meetLink=${encodeURIComponent(meeting.meetLink)}`;
        }

        res.json(response);

    } catch (error) {
        console.error('❌ [INTEGRATION] Erro ao criar reunião:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/integration/tokens/:tokenId/videos - Listar vídeos disponíveis do token
router.get('/tokens/:tokenId/videos', async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await IntegrationToken.findOne({ _id: tokenId, isActive: true })
            .populate('videos.video', 'title url type');

        if (!token) {
            return res.status(404).json({ error: 'Token não encontrado ou inativo' });
        }

        const videos = token.videos
            .filter(v => v.video) // Filtrar vídeos válidos
            .map(v => ({
                id: v.video._id,
                name: v.name,
                description: v.description,
                isDefault: v.isDefault,
                order: v.order,
                video: {
                    title: v.video.title,
                    url: v.video.url,
                    type: v.video.type
                }
            }))
            .sort((a, b) => a.order - b.order);

        res.json({
            tokenName: token.name,
            videos
        });

    } catch (error) {
        console.error('❌ [INTEGRATION] Erro ao listar vídeos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/integration/tokens/:tokenId/stats - Estatísticas do token
router.get('/tokens/:tokenId/stats', authenticateToken, async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await IntegrationToken.findOne({ _id: tokenId, user: req.user._id });
        if (!token) {
            return res.status(404).json({ error: 'Token não encontrado' });
        }

        // Buscar reuniões criadas via este token
        const meetings = await Meeting.find({ 
            'integrationData.tokenId': tokenId 
        }).sort({ createdAt: -1 });

        const stats = {
            token: token.toIntegrationJSON(),
            totalMeetings: meetings.length,
            recentMeetings: meetings.slice(0, 10).map(meeting => ({
                id: meeting.meetingId,
                title: meeting.title,
                createdAt: meeting.createdAt,
                status: meeting.status
            }))
        };

        res.json(stats);

    } catch (error) {
        console.error('❌ [INTEGRATION] Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
