const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Modelo User
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isActive: Boolean,
  lastLogin: Date,
  visionTokens: Number,
  avatar: String,
  isAdmin: Boolean,
  isBanned: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function fixAdminLogin() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB!');

    // Verificar se o usuário principal existe
    let user = await User.findOne({ email: 'tavinmktdigital@gmail.com' });

    if (!user) {
      console.log('🆕 Criando usuário admin principal...');
      user = new User({
        name: 'Otávio Admin',
        email: 'tavinmktdigital@gmail.com',
        password: 'Admin123!',
        isAdmin: true,
        visionTokens: 1000,
        isActive: true
      });
    } else {
      console.log('🔄 Redefinindo senha do admin principal...');
      user.password = 'Admin123!';
      user.isAdmin = true;
      user.visionTokens = 1000;
      user.isActive = true;
    }

    await user.save();

    console.log('✅ Usuário admin principal configurado!');
    console.log('');
    console.log('🔐 CREDENCIAIS PRINCIPAIS:');
    console.log('   Email: tavinmktdigital@gmail.com');
    console.log('   Senha: Admin123!');
    console.log('');
    console.log('🌐 Acesse: https://google-meet-saas-v2.onrender.com/admin');
    console.log('');
    console.log('📋 Teste de login:');
    console.log('   1. Acesse a URL do admin');
    console.log('   2. Digite: tavinmktdigital@gmail.com');
    console.log('   3. Digite: Admin123!');
    console.log('   4. Clique em "Acessar Painel"');
    console.log('');
    console.log('✅ Este usuário DEVE funcionar pois:');
    console.log('   - É o primeiro da lista de autorizados');
    console.log('   - Senha simples e sem caracteres especiais');
    console.log('   - Email principal do sistema');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada.');
  }
}

// Executar
fixAdminLogin();
