const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

console.log('🚀 Servidor SIMPLES iniciando...');
console.log('📊 Porta:', PORT);

app.get('/', (req, res) => {
    res.json({ message: 'Servidor funcionando!', time: new Date().toISOString() });
});

app.get('/test', (req, res) => {
    res.json({ message: 'Teste OK!', time: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor SIMPLES rodando na porta ${PORT}`);
});
