const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkOwnership } = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const Video = require('../models/Video');

const router = express.Router();

// Validações para criação/edição de reunião
const meetingValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição não pode ter mais de 500 caracteres'),
  body('videoId')
    .isMongoId()
    .withMessage('ID do vídeo inválido'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Máximo de participantes deve ser entre 1 e 100'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic deve ser true ou false')
];

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

// GET /api/meetings - Listar reuniões do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    const query = { user: req.user._id };
    
    // Filtrar por status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const meetings = await Meeting.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email')
      .populate('video', 'title url type');

    const total = await Meeting.countDocuments(query);

    res.json({
      meetings: meetings.map(meeting => meeting.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar reuniões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/meetings - Criar nova reunião
router.post('/', authenticateToken, meetingValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, videoId, maxParticipants = 1, isPublic = false, meetLink } = req.body;
    
    console.log('🚀 Criando nova reunião:', {
      title,
      videoId,
      meetLink,
      user: req.user._id
    });

    // Verificar se o vídeo existe e pertence ao usuário
    const video = await Video.findOne({ _id: videoId, user: req.user._id });
    if (!video) {
      console.log('❌ Vídeo não encontrado:', videoId);
      return res.status(404).json({
        error: 'Vídeo não encontrado'
      });
    }

    console.log('✅ Vídeo encontrado:', video.title);

    // Verificar se o vídeo está ativo
    if (!video.isActive) {
      console.log('❌ Vídeo não está ativo');
      return res.status(400).json({
        error: 'Vídeo não está ativo'
      });
    }

    // Extrair o meetingId do meetLink
    const urlParts = meetLink.split('/');
    const meetingIdFromLink = urlParts[urlParts.length - 1].split('?')[0];
    
    console.log('🔗 MeetingId extraído do link:', meetingIdFromLink);

    const meeting = new Meeting({
      user: req.user._id,
      video: videoId,
      title,
      description,
      maxParticipants,
      isPublic,
      meetLink,
      meetingId: meetingIdFromLink // Usar o ID gerado pelo JavaScript
    });

    await meeting.save();
    
    console.log('✅ Reunião criada com sucesso:', {
      id: meeting._id,
      meetingId: meeting.meetingId,
      title: meeting.title
    });

    // Popular dados do vídeo para retorno
    await meeting.populate('video', 'title url type');

    res.status(201).json({
      message: 'Reunião criada com sucesso',
      meeting: meeting.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao criar reunião:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/meetings/:meetingId - Obter reunião por ID público
router.get('/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    console.log('🔍 Buscando reunião com ID:', meetingId);

    const meeting = await Meeting.findOne({ meetingId })
      .populate('user', 'name')
      .populate('video', 'title url type');

    console.log('📋 Resultado da busca:', meeting ? 'Encontrada' : 'Não encontrada');
    
    if (meeting) {
      console.log('📊 Dados da reunião:', {
        id: meeting._id,
        meetingId: meeting.meetingId,
        title: meeting.title,
        isActive: meeting.isActive,
        video: meeting.video ? meeting.video.title : 'N/A'
      });
    }

    if (!meeting) {
      return res.status(404).json({
        error: 'Reunião não encontrada'
      });
    }

    if (!meeting.isActive) {
      return res.status(400).json({
        error: 'Reunião não está ativa'
      });
    }

    res.json({
      meeting: meeting.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao obter reunião:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/meetings/:id/details - Obter detalhes da reunião (para o dono)
router.get('/:id/details', authenticateToken, checkOwnership('Meeting'), async (req, res) => {
  try {
    const meeting = req.resource;
    
    await meeting.populate('video', 'title url type');

    res.json({
      meeting: meeting.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao obter detalhes da reunião:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/meetings/:id - Atualizar reunião
router.put('/:id', authenticateToken, checkOwnership('Meeting'), meetingValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, maxParticipants, isPublic } = req.body;

    const meeting = req.resource;
    
    // Só permitir edição se a reunião não foi iniciada
    if (meeting.startedAt) {
      return res.status(400).json({
        error: 'Não é possível editar uma reunião que já foi iniciada'
      });
    }

    meeting.title = title;
    meeting.description = description;
    meeting.maxParticipants = maxParticipants;
    meeting.isPublic = isPublic;

    await meeting.save();

    res.json({
      message: 'Reunião atualizada com sucesso',
      meeting: meeting.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao atualizar reunião:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/meetings/:id - Deletar reunião
router.delete('/:id', authenticateToken, checkOwnership('Meeting'), async (req, res) => {
  try {
    const meeting = req.resource;

    // Só permitir deletar se a reunião não foi iniciada
    if (meeting.startedAt) {
      return res.status(400).json({
        error: 'Não é possível deletar uma reunião que já foi iniciada'
      });
    }

    await meeting.remove();

    res.json({
      message: 'Reunião deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar reunião:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/meetings/:meetingId/join - Entrar na reunião
router.post('/:meetingId/join', async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ meetingId })
      .populate('video', 'title url type');

    if (!meeting) {
      return res.status(404).json({
        error: 'Reunião não encontrada'
      });
    }

    if (!meeting.isActive) {
      return res.status(400).json({
        error: 'Reunião não está ativa'
      });
    }

    // Incrementar visualizações
    await meeting.incrementViews();

    res.json({
      message: 'Entrou na reunião com sucesso',
      meeting: meeting.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao entrar na reunião:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/meetings/:id/start - Iniciar reunião
router.post('/:id/start', authenticateToken, checkOwnership('Meeting'), async (req, res) => {
  try {
    const meeting = req.resource;

    if (meeting.startedAt) {
      return res.status(400).json({
        error: 'Reunião já foi iniciada'
      });
    }

    await meeting.startMeeting();

    res.json({
      message: 'Reunião iniciada com sucesso',
      meeting: meeting.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao iniciar reunião:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/meetings/:id/end - Encerrar reunião
router.post('/:id/end', authenticateToken, checkOwnership('Meeting'), async (req, res) => {
  try {
    const meeting = req.resource;

    if (!meeting.startedAt) {
      return res.status(400).json({
        error: 'Reunião não foi iniciada'
      });
    }

    if (meeting.endedAt) {
      return res.status(400).json({
        error: 'Reunião já foi encerrada'
      });
    }

    await meeting.endMeeting();

    res.json({
      message: 'Reunião encerrada com sucesso',
      meeting: meeting.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao encerrar reunião:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 