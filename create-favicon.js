const sharp = require('sharp');
const fs = require('fs');

// Ler o SVG
const svgBuffer = fs.readFileSync('public/favicon.svg');

// Converter para PNG 32x32
sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer()
    .then(buffer => {
        // Salvar como PNG primeiro
        fs.writeFileSync('public/favicon.png', buffer);
        console.log('✅ Favicon PNG criado com sucesso!');
        
        // Também salvar como ICO (mesmo arquivo, mas com extensão .ico)
        fs.writeFileSync('public/favicon.ico', buffer);
        console.log('✅ Favicon ICO criado com sucesso!');
    })
    .catch(err => {
        console.error('❌ Erro ao criar favicon:', err);
    });
