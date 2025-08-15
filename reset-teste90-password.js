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

async function resetTeste90Password() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB!');

    // Buscar o usuário teste90
    const user = await User.findOne({ email: 'teste90@gmail.com' });

    if (!user) {
      console.log('❌ Usuário teste90@gmail.com não encontrado!');
      console.log('🆕 Criando novo usuário...');
      
      const newUser = new User({
        name: 'Teste90 Admin',
        email: 'teste90@gmail.com',
        password: 'Teste90!',
        isAdmin: true,
        visionTokens: 1000,
        isActive: true
      });

      await newUser.save();
      console.log('✅ Novo usuário criado com sucesso!');
      
    } else {
      console.log('📊 Dados atuais do usuário:');
      console.log('   - Nome:', user.name);
      console.log('   - Email:', user.email);
      console.log('   - Admin:', user.isAdmin);
      console.log('   - Tokens:', user.visionTokens);
      console.log('   - Criado em:', user.createdAt);
      
      // Redefinir senha
      console.log('🔄 Redefinindo senha...');
      user.password = 'Teste90!';
      user.isAdmin = true; // Garantir que é admin
      user.visionTokens = 1000; // Tokens extras
      await user.save();
      
      console.log('✅ Senha redefinida com sucesso!');
    }
    
    console.log('');
    console.log('🔐 NOVAS CREDENCIAIS:');
    console.log('   Email: teste90@gmail.com');
    console.log('   Senha: Teste90!');
    console.log('');
    console.log('🌐 Acesse: https://google-meet-saas-v2.onrender.com/admin');
    console.log('');
    console.log('📋 Teste de login:');
    console.log('   1. Acesse a URL do admin');
    console.log('   2. Digite: teste90@gmail.com');
    console.log('   3. Digite: Teste90!');
    console.log('   4. Clique em "Acessar Painel"');

  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  resetTeste90Password();
}

module.exports = resetTeste90Password;
