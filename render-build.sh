#!/bin/bash

echo "🚀 Iniciando build do Render..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se server-render.js existe
if [ ! -f "server-render.js" ]; then
    echo "❌ ERRO: server-render.js não encontrado!"
    exit 1
fi

# Verificar se package.json está correto
if ! grep -q '"start": "node server-render.js"' package.json; then
    echo "❌ ERRO: package.json não está configurado corretamente!"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "📋 Arquivo principal: server-render.js"
echo "🚀 Comando de start: npm start" 