const mongoose = require('mongoose');
require('dotenv').config();

console.log('🧪 Testando conexão com MongoDB Atlas...');
console.log('📋 String de conexão:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🔗 Host:', mongoose.connection.host);
    process.exit(0);
})
.catch((error) => {
    console.error('❌ Erro ao conectar ao MongoDB Atlas:');
    console.error('📋 Erro:', error.message);
    console.error('🔧 Possíveis soluções:');
    console.error('   1. Verifique se o usuário existe no MongoDB Atlas');
    console.error('   2. Verifique se a senha está correta');
    console.error('   3. Verifique se o IP está liberado no Network Access');
    console.error('   4. Verifique se o cluster está ativo');
    process.exit(1);
}); 