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

async function checkUserSync() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB!');

    // Buscar o usuário teste90
    const user = await User.findOne({ email: 'teste90@gmail.com' }).select('+password');

    if (!user) {
      console.log('❌ Usuário teste90@gmail.com não encontrado!');
      return;
    }

    console.log('📊 Dados do usuário no banco:');
    console.log('   - Nome:', user.name);
    console.log('   - Email:', user.email);
    console.log('   - Admin:', user.isAdmin);
    console.log('   - Tokens:', user.visionTokens);
    console.log('   - Ativo:', user.isActive);
    console.log('   - Senha hash:', user.password ? '✅ Existe' : '❌ Não existe');
    console.log('   - Criado em:', user.createdAt);
    console.log('   - Atualizado em:', user.updatedAt);
    
    // Testar se a senha atual funciona
    console.log('');
    console.log('🔐 Testando senha atual...');
    
    const testPassword = 'Teste90!';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    if (isPasswordValid) {
      console.log('✅ Senha "Teste90!" está correta!');
    } else {
      console.log('❌ Senha "Teste90!" está incorreta');
      console.log('🔄 Redefinindo senha novamente...');
      
      user.password = testPassword;
      await user.save();
      
      console.log('✅ Senha redefinida!');
    }
    
    console.log('');
    console.log('🔐 CREDENCIAIS FINAIS:');
    console.log('   Email: teste90@gmail.com');
    console.log('   Senha: Teste90!');
    console.log('');
    console.log('🌐 Teste agora:');
    console.log('   https://google-meet-saas-v2.onrender.com/admin');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada.');
  }
}

// Executar verificação
checkUserSync();
