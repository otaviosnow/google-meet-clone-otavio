const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkOwnership } = require('../middleware/auth');
const Video = require('../models/Video');

const router = express.Router();

// LOG PARA CONFIRMAR QUE ESTA VERSÃO ESTÁ SENDO USADA
console.log('🚨🚨🚨 COM MULTER - UPLOAD DE VÍDEOS ATÉ 300MB 🚨🚨🚨');
console.log('📊 Configuração: Máximo 300MB por arquivo, 3 arquivos por vez');

// Configuração do Multer para arquivos grandes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Criar pasta uploads se não existir
    const uploadDir = './uploads';
    console.log('📁 Verificando diretório de upload:', uploadDir);
    
    if (!fs.existsSync(uploadDir)) {
      console.log('📁 Criando diretório de upload:', uploadDir);
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('✅ Diretório de upload criado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao criar diretório de upload:', error);
        return cb(error);
      }
    } else {
      console.log('✅ Diretório de upload já existe');
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📄 Nome do arquivo gerado:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 300 * 1024 * 1024, // 300MB - otimizado para vídeos de 250MB
    files: 3 // Limitar a 3 arquivos por vez
  },
  fileFilter: function (req, file, cb) {
    console.log('🔍 Verificando arquivo:', file.originalname, file.mimetype);
    
    // Aceitar apenas vídeos
    if (file.mimetype.startsWith('video/')) {
      console.log('✅ Arquivo de vídeo aceito:', file.originalname);
      cb(null, true);
    } else {
      console.log('❌ Arquivo rejeitado (não é vídeo):', file.originalname);
      cb(new Error('Apenas arquivos de vídeo são permitidos'), false);
    }
  }
});

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

// Middleware para tratar erros do Multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.log('🚨🚨🚨 ERRO MULTER DETECTADO:', error.code);
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ error: 'Arquivo muito grande. Máximo 300MB.' });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ error: 'Muitos arquivos. Máximo 3 arquivos.' });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ error: 'Campo de arquivo inesperado.' });
      default:
        return res.status(400).json({ error: `Erro de upload: ${error.message}` });
    }
  }
  next(error);
};

// POST /api/videos - Criar novo vídeo (upload) - COM MULTER
router.post('/', authenticateToken, upload.single('video'), handleMulterError, async (req, res) => {
  console.log('🚨🚨🚨 ROTA /api/videos POST ACESSADA! 🚨🚨🚨');
  console.log('📋 Body:', req.body);
  console.log('📁 File:', req.file);
  console.log('🔑 User:', req.user._id);
  console.log('📋 Headers:', req.headers);
  console.log('🔍 Content-Type:', req.headers['content-type']);
  
  try {
    // Verificar limite de 3 vídeos por usuário
    const userVideoCount = await Video.countDocuments({ user: req.user._id });
    if (userVideoCount >= 3) {
      return res.status(400).json({
        error: 'Limite de 3 vídeos atingido. Delete um vídeo para adicionar outro.'
      });
    }

    const { title, type, url } = req.body;

    let videoData = {
      user: req.user._id,
      title: title || '',
      description: '', // Sempre vazio agora
      type: type || 'upload'
    };

    // Se tem arquivo, é upload
    if (req.file) {
      console.log('✅ Arquivo recebido:', req.file.originalname);
      videoData.type = 'upload';
      videoData.url = `/uploads/${req.file.filename}`;
      videoData.filename = req.file.filename;
      videoData.size = req.file.size;
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

// GET /api/videos/upload-info - Obter informações sobre upload
router.get('/upload-info', authenticateToken, async (req, res) => {
  try {
    const userVideoCount = await Video.countDocuments({ user: req.user._id });
    
    res.json({
      maxFileSize: '300MB',
      maxFiles: 3,
      currentVideos: userVideoCount,
      maxVideos: 3,
      remainingSlots: Math.max(0, 3 - userVideoCount),
      supportedFormats: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm']
    });
  } catch (error) {
    console.error('Erro ao obter informações de upload:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
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

    await video.deleteOne();

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

 