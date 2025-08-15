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

async function addTeste90Admin() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB!');

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email: 'teste90@gmail.com' });

    if (existingUser) {
      console.log('⚠️ Usuário teste90@gmail.com já existe!');
      console.log('📊 Dados atuais:');
      console.log('   - Nome:', existingUser.name);
      console.log('   - Email:', existingUser.email);
      console.log('   - Admin:', existingUser.isAdmin);
      console.log('   - Tokens:', existingUser.visionTokens);
      console.log('   - Criado em:', existingUser.createdAt);
      
      // Verificar se já é admin
      if (existingUser.isAdmin) {
        console.log('✅ Usuário já é administrador!');
        return;
      }
      
      // Tornar admin se não for
      console.log('🔄 Tornando usuário administrador...');
      existingUser.isAdmin = true;
      existingUser.visionTokens = 1000; // Tokens extras para admin
      await existingUser.save();
      
      console.log('✅ Usuário agora é administrador!');
      console.log('📊 Dados atualizados:');
      console.log('   - Admin:', existingUser.isAdmin);
      console.log('   - Tokens:', existingUser.visionTokens);
      
    } else {
      // Criar novo usuário admin
      console.log('🆕 Criando novo usuário admin teste90@gmail.com...');
      
      const adminUser = new User({
        name: 'Teste90 Admin',
        email: 'teste90@gmail.com',
        password: 'Teste90!', // Senha padrão
        isAdmin: true,
        visionTokens: 1000, // Tokens iniciais para admin
        isActive: true
      });

      await adminUser.save();

      console.log('✅ Usuário admin teste90@gmail.com criado com sucesso!');
      console.log('📊 Dados do novo admin:');
      console.log('   - Nome:', adminUser.name);
      console.log('   - Email:', adminUser.email);
      console.log('   - Senha: Teste90!');
      console.log('   - Admin:', adminUser.isAdmin);
      console.log('   - Tokens:', adminUser.visionTokens);
      console.log('   - ID:', adminUser._id);
    }
    
    console.log('');
    console.log('🔐 Credenciais de acesso:');
    console.log('   Email: teste90@gmail.com');
    console.log('   Senha: Teste90!');
    console.log('');
    console.log('🌐 Acesse o painel admin em: http://localhost:10000/admin');
    console.log('');
    console.log('📋 Lista de admins autorizados:');
    console.log('   - tavinmktdigital@gmail.com');
    console.log('   - teste2@gmail.com');
    console.log('   - teste90@gmail.com');

  } catch (error) {
    console.error('❌ Erro ao adicionar usuário admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addTeste90Admin();
}

module.exports = addTeste90Admin;
