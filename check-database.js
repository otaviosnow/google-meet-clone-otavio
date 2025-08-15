const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
    try {
        console.log('🔍 Verificando configuração do banco de dados...');
        
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-fake';
        console.log('🌐 MongoDB URI:', mongoUri);
        
        // Extrair informações da URI
        const uriParts = mongoUri.split('/');
        const databaseName = uriParts[uriParts.length - 1];
        console.log('📊 Nome do banco:', databaseName);
        
        // Conectar ao MongoDB
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Conectado ao MongoDB');
        console.log('🔗 Conexão:', mongoose.connection.host);
        console.log('📊 Database:', mongoose.connection.name);
        
        // Verificar se conseguimos acessar o banco
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 Coleções disponíveis:');
        collections.forEach((collection, index) => {
            console.log(`${index + 1}. ${collection.name}`);
        });
        
        // Verificar se a coleção 'users' existe
        const usersCollection = collections.find(c => c.name === 'users');
        if (usersCollection) {
            console.log('\n✅ Coleção "users" encontrada');
            
            // Contar documentos na coleção users
            const userCount = await mongoose.connection.db.collection('users').countDocuments();
            console.log(`📊 Total de usuários: ${userCount}`);
            
            // Listar alguns usuários recentes
            const recentUsers = await mongoose.connection.db.collection('users')
                .find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray();
            
            console.log('\n📋 Usuários mais recentes:');
            recentUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email} (${user.name}) - ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}`);
            });
            
        } else {
            console.log('\n❌ Coleção "users" não encontrada');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
            console.log('\n🔌 Conexão com MongoDB fechada');
        }
    }
}

checkDatabase();

