const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando diretório de uploads...');

const uploadsPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/uploads'  // Render com disco persistente
    : './uploads';                       // Desenvolvimento local

console.log('📁 Caminho do diretório:', uploadsPath);

// Verificar se o diretório existe
if (!fs.existsSync(uploadsPath)) {
    console.log('❌ Diretório não existe, criando...');
    try {
        fs.mkdirSync(uploadsPath, { recursive: true });
        console.log('✅ Diretório criado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao criar diretório:', error);
        process.exit(1);
    }
} else {
    console.log('✅ Diretório já existe');
    
    // Listar arquivos no diretório
    try {
        const files = fs.readdirSync(uploadsPath);
        console.log('📄 Arquivos encontrados:', files.length);
        if (files.length > 0) {
            console.log('📋 Lista de arquivos:');
            files.forEach(file => {
                const filePath = path.join(uploadsPath, file);
                const stats = fs.statSync(filePath);
                console.log(`   - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            });
        }
    } catch (error) {
        console.error('❌ Erro ao listar arquivos:', error);
    }
}

console.log('✅ Verificação concluída!');
