#!/bin/bash

echo "🚀 Instalando Google Meet Fake SaaS..."
echo "======================================"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 16+ primeiro."
    echo "📥 Download: https://nodejs.org/"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão 16+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado"
    exit 1
fi

echo "✅ npm $(npm -v) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"

# Criar pasta uploads se não existir
if [ ! -d "uploads" ]; then
    echo "📁 Criando pasta uploads..."
    mkdir uploads
fi

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    echo "⚙️ Criando arquivo .env..."
    cp env.example .env
    echo "✅ Arquivo .env criado"
    echo "📝 IMPORTANTE: Edite o arquivo .env com suas configurações"
else
    echo "✅ Arquivo .env já existe"
fi

# Verificar se MongoDB está rodando (opcional)
echo "🔍 Verificando MongoDB..."
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB está rodando"
    else
        echo "⚠️ MongoDB não está rodando"
        echo "💡 Para usar MongoDB local, inicie com: mongod"
        echo "💡 Ou use MongoDB Atlas (recomendado para produção)"
    fi
else
    echo "⚠️ MongoDB não encontrado"
    echo "💡 Instale MongoDB ou use MongoDB Atlas"
fi

echo ""
echo "🎉 Instalação concluída!"
echo "========================"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo .env com suas configurações"
echo "2. Configure o MongoDB (local ou Atlas)"
echo "3. Execute: npm run dev"
echo "4. Acesse: http://localhost:3000"
echo ""
echo "📚 Documentação completa: README_SAAS.md"
echo ""
echo "🚀 Para iniciar o servidor:"
echo "   npm run dev    # Desenvolvimento"
echo "   npm start      # Produção" 