const express = require('express');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkOwnership } = require('../middleware/auth');
const Video = require('../models/Video');

const router = express.Router();

// LOG PARA CONFIRMAR QUE ESTA VERSÃO ESTÁ SENDO USADA
console.log('🚨🚨🚨 COM FORMIDABLE - UPLOAD DE ARQUIVOS 🚨🚨🚨');

// Validações para criação/edição de vídeo
const videoValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição não pode ter mais de 500 caracteres'),
  body('type')
    .isIn(['upload', 'drive', 'url'])
    .withMessage('Tipo deve ser upload, drive ou url'),
  body('url')
    .isURL()
    .withMessage('URL inválida')
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

// GET /api/videos - Listar vídeos do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = { user: req.user._id };
    
    // Adicionar busca se fornecida
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Video.countDocuments(query);

    res.json({
      videos: videos.map(video => video.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/videos - Criar novo vídeo (upload) - COM FORMIDABLE
router.post('/', async (req, res) => {
  console.log('🚨🚨🚨 ROTA /api/videos POST ACESSADA! 🚨🚨🚨');
  console.log('📋 Headers:', req.headers);
  console.log('🔑 Auth Header:', req.headers.authorization);
  
  // Verificar autenticação manualmente
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    req.user = user;
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  // Configurar formidable para upload
  const form = formidable({
    uploadDir: './uploads',
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    filter: function ({name, originalFilename, mimetype}) {
      // Aceitar apenas vídeos
      return mimetype && mimetype.includes('video');
    }
  });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Erro no parse do formulário:', err);
      return res.status(400).json({ error: 'Erro ao processar upload' });
    }
    
    try {
      console.log('🚨🚨🚨 POST /api/videos - REQUISIÇÃO RECEBIDA! 🚨🚨🚨');
      console.log('📋 Fields:', fields);
      console.log('📁 Files:', files);
      console.log('🔑 User:', req.user._id);
      
      const { title, description, type, url } = fields;

      let videoData = {
        user: req.user._id,
        title: title || '',
        description: description || '',
        type: type || 'upload'
      };

      // Se tem arquivo, é upload
      if (files.video && files.video[0]) {
        const videoFile = files.video[0];
        console.log('✅ Arquivo recebido:', videoFile.originalFilename);
        videoData.type = 'upload';
        videoData.url = `/uploads/${videoFile.newFilename}`;
        videoData.filename = videoFile.newFilename;
        videoData.size = videoFile.size;
      } else if (type === 'drive' || type === 'url') {
        // Vídeo do Google Drive ou URL externa
        console.log('🔗 URL recebida:', url);
        videoData.url = url;
      } else {
        console.log('❌ Erro: Arquivo ou URL não encontrado');
        return res.status(400).json({
          error: 'Arquivo de vídeo ou URL é obrigatório'
        });
      }

      const video = new Video(videoData);
      await video.save();

      res.status(201).json({
        message: 'Vídeo criado com sucesso',
        video: video.toPublicJSON()
      });

    } catch (error) {
      console.error('Erro ao criar vídeo:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  });
});

// GET /api/videos/:id - Obter vídeo específico
router.get('/:id', authenticateToken, checkOwnership('Video'), async (req, res) => {
  try {
    res.json({
      video: req.resource.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao obter vídeo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/videos/:id - Atualizar vídeo
router.put('/:id', authenticateToken, checkOwnership('Video'), videoValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, description } = req.body;

    const video = req.resource;
    video.title = title;
    video.description = description;

    await video.save();

    res.json({
      message: 'Vídeo atualizado com sucesso',
      video: video.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/videos/:id - Deletar vídeo
router.delete('/:id', authenticateToken, checkOwnership('Video'), async (req, res) => {
  try {
    const video = req.resource;

    // Se for upload, deletar arquivo físico
    if (video.type === 'upload' && video.filename) {
      const filePath = path.join(process.env.UPLOAD_PATH || './uploads', video.filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await video.remove();

    res.json({
      message: 'Vídeo deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar vídeo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/videos/:id/increment-views - Incrementar visualizações
router.post('/:id/increment-views', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        error: 'Vídeo não encontrado'
      });
    }

    await video.incrementViews();

    res.json({
      message: 'Visualização registrada',
      views: video.views
    });

  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 