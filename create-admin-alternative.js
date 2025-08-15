const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Modelo User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  visionTokens: {
    type: Number,
    default: 100,
    min: [0, 'Tokens não podem ser negativos']
  },
  avatar: {
    type: String,
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Middleware para hash da senha
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function createAlternativeAdmin() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB!');

    // Criar usuário admin alternativo
    const adminUser = new User({
      name: 'Admin Alternativo',
      email: 'admin@callx.com',
      password: 'Admin123!',
      isAdmin: true,
      visionTokens: 1000,
      isActive: true
    });

    await adminUser.save();

    console.log('✅ Usuário admin alternativo criado com sucesso!');
    console.log('');
    console.log('🔐 CREDENCIAIS ALTERNATIVAS:');
    console.log('   Email: admin@callx.com');
    console.log('   Senha: Admin123!');
    console.log('');
    console.log('🌐 Acesse: https://google-meet-saas-v2.onrender.com/admin');
    console.log('');
    console.log('📋 Teste de login:');
    console.log('   1. Acesse a URL do admin');
    console.log('   2. Digite: admin@callx.com');
    console.log('   3. Digite: Admin123!');
    console.log('   4. Clique em "Acessar Painel"');
    console.log('');
    console.log('🔧 Se ainda não funcionar:');
    console.log('   1. Aguarde 1-2 minutos');
    console.log('   2. Tente novamente');
    console.log('   3. Verifique se o servidor está online');

  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️ Usuário admin@callx.com já existe!');
      console.log('🔄 Redefinindo senha...');
      
      const existingUser = await User.findOne({ email: 'admin@callx.com' });
      existingUser.password = 'Admin123!';
      existingUser.isAdmin = true;
      await existingUser.save();
      
      console.log('✅ Senha redefinida!');
      console.log('');
      console.log('🔐 CREDENCIAIS:');
      console.log('   Email: admin@callx.com');
      console.log('   Senha: Admin123!');
    } else {
      console.error('❌ Erro:', error);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada.');
  }
}

// Executar
createAlternativeAdmin();
