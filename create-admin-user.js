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
    default: 100, // Tokens iniciais para admin
    min: [0, 'Tokens não podem ser negativos']
  },
  avatar: {
    type: String,
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: true // Admin por padrão
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

async function createAdminUser() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB!');

    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ 
      email: { $in: ['tavinmktdigital@gmail.com', 'teste2@gmail.com'] },
      isAdmin: true 
    });

    if (existingAdmin) {
      console.log('⚠️ Usuário admin já existe:', existingAdmin.email);
      console.log('📊 Dados do admin existente:');
      console.log('   - Nome:', existingAdmin.name);
      console.log('   - Email:', existingAdmin.email);
      console.log('   - Admin:', existingAdmin.isAdmin);
      console.log('   - Tokens:', existingAdmin.visionTokens);
      console.log('   - Criado em:', existingAdmin.createdAt);
      return;
    }

    // Criar usuário admin
    const adminUser = new User({
      name: 'Administrador CallX',
      email: 'tavinmktdigital@gmail.com',
      password: 'Admin123!', // Senha padrão
      isAdmin: true,
      visionTokens: 1000, // Tokens iniciais para admin
      isActive: true
    });

    await adminUser.save();

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📊 Dados do admin:');
    console.log('   - Nome:', adminUser.name);
    console.log('   - Email:', adminUser.email);
    console.log('   - Senha: Admin123!');
    console.log('   - Admin:', adminUser.isAdmin);
    console.log('   - Tokens:', adminUser.visionTokens);
    console.log('   - ID:', adminUser._id);
    console.log('');
    console.log('🔐 Credenciais de acesso:');
    console.log('   Email: tavinmktdigital@gmail.com');
    console.log('   Senha: Admin123!');
    console.log('');
    console.log('🌐 Acesse o painel admin em: http://localhost:10000/admin');

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;
