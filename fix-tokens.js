require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');

console.log('🔗 Conectando ao MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado ao MongoDB com sucesso!');
    
    try {
        // Buscar usuário
        const user = await User.findOne({ email: 'teste90@gmail.com' });
        if (user) {
            console.log('👤 Usuário encontrado:');
            console.log('   - ID:', user._id);
            console.log('   - Nome:', user.name);
            console.log('   - Email:', user.email);
            console.log('   - Tokens atuais:', user.visionTokens);
            console.log('   - Admin:', user.isAdmin);
            console.log('   - Ativo:', user.isActive);
            
            // Corrigir tokens
            console.log('\n🔄 Corrigindo tokens...');
            user.visionTokens = 1100;
            user.isAdmin = true;
            await user.save();
            
            console.log('✅ Tokens corrigidos para:', user.visionTokens);
            
            // Verificar se foi salvo corretamente
            const updatedUser = await User.findById(user._id);
            console.log('✅ Verificação pós-salvamento:');
            console.log('   - Tokens:', updatedUser.visionTokens);
            console.log('   - Admin:', updatedUser.isAdmin);
            
            // Testar toPublicJSON
            console.log('\n📤 Testando toPublicJSON():');
            const publicData = updatedUser.toPublicJSON();
            console.log('   - Tokens no toPublicJSON:', publicData.visionTokens);
            
        } else {
            console.log('❌ Usuário teste90@gmail.com não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
    }
    
    mongoose.connection.close();
    console.log('🔌 Conexão fechada');
})
.catch(err => {
    console.error('❌ Erro de conexão:', err);
    process.exit(1);
});
