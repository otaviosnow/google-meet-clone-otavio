require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');

console.log('🔍 === TESTANDO DIFERENTES SENHAS ===\n');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    try {
        // Buscar usuário
        const user = await User.findOne({ email: 'teste90@gmail.com' });
        
        if (!user) {
            console.log('❌ Usuário não encontrado!');
            return;
        }
        
        console.log('👤 Usuário encontrado:');
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Tokens: ${user.visionTokens}`);
        console.log(`   - Admin: ${user.isAdmin}`);
        
        // Lista de senhas para testar
        const passwordsToTest = [
            '@Teste90',
            'Teste90',
            'teste90',
            '@teste90',
            '123456',
            'password',
            'admin',
            'teste',
            'Teste',
            '@Teste',
            'teste@90',
            'Teste@90'
        ];
        
        console.log('\n🧪 Testando senhas...');
        
        for (const password of passwordsToTest) {
            try {
                const isValid = await user.comparePassword(password);
                console.log(`   - "${password}": ${isValid ? '✅ VÁLIDA' : '❌ inválida'}`);
                
                if (isValid) {
                    console.log(`\n🎉 SENHA ENCONTRADA: "${password}"`);
                    break;
                }
            } catch (error) {
                console.log(`   - "${password}": ❌ erro`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
    
    mongoose.connection.close();
    console.log('\n🔌 Conexão fechada');
})
.catch(err => {
    console.error('❌ Erro de conexão:', err);
    process.exit(1);
});
