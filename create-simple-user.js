require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createSimpleUser() {
    try {
        console.log('🔍 Conectando ao MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB Atlas!');

        // Deletar usuário existente
        await User.deleteOne({ email: 'teste90@gmail.com' });
        console.log('🗑️ Usuário anterior deletado');

        // Criar hash com senha simples
        const simplePassword = '123456';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(simplePassword, salt);
        
        console.log('🔐 Hash gerado:', hashedPassword);
        console.log('🔑 Senha original:', simplePassword);

        // Testar o hash imediatamente
        const testResult = await bcrypt.compare(simplePassword, hashedPassword);
        console.log('🧪 Teste imediato:', testResult ? '✅ VÁLIDO' : '❌ inválido');

        // Criar usuário
        const newUser = new User({
            name: 'Teste 90',
            email: 'teste90@gmail.com',
            password: hashedPassword,
            isAdmin: true,
            isBanned: false,
            visionTokens: 1000,
            isActive: true
        });

        await newUser.save();
        console.log('✅ Usuário criado!');

        // Testar login via API
        console.log('\n🌐 Testando login online...');
        const https = require('https');
        
        const postData = JSON.stringify({
            email: 'teste90@gmail.com',
            password: '123456'
        });

        const options = {
            hostname: 'google-meet-saas-v2.onrender.com',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log('📡 Status:', res.statusCode);
                console.log('📡 Response:', data);
            });
        });

        req.write(postData);
        req.end();

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

createSimpleUser();
