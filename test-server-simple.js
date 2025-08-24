const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

console.log('🚀 Teste de servidor simples');
console.log('📅 Data/Hora:', new Date().toISOString());
console.log('📊 Porta:', PORT);
console.log('🔑 MONGODB_URI:', process.env.MONGODB_URI ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('🔑 MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Configurado' : 'NÃO CONFIGURADO');

app.get('/', (req, res) => {
    res.json({
        message: 'Servidor funcionando!',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

app.get('/test', (req, res) => {
    res.json({
        message: 'Rota de teste funcionando!',
        mongodb: process.env.MONGODB_URI ? 'OK' : 'FALTANDO',
        jwt: process.env.JWT_SECRET ? 'OK' : 'FALTANDO',
        mercadopago: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'OK' : 'FALTANDO'
    });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor de teste rodando na porta ${PORT}`);
});
