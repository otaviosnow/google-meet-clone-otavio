#!/bin/bash

echo "🔍 Verificando arquivos para upload no GitHub..."
echo "================================================"

echo ""
echo "✅ ARQUIVOS QUE DEVEM SER ENVIADOS:"

# Verificar arquivos principais
if [ -f "server-render.js" ]; then
    echo "✅ server-render.js (IMPORTANTE)"
else
    echo "❌ server-render.js - FALTANDO (CRÍTICO)"
fi

if [ -f "package.json" ]; then
    echo "✅ package.json"
    # Verificar se está atualizado
    if grep -q "server-render.js" package.json; then
        echo "✅ package.json está atualizado"
    else
        echo "⚠️  package.json precisa ser atualizado"
    fi
else
    echo "❌ package.json - FALTANDO"
fi

if [ -f "render.yaml" ]; then
    echo "✅ render.yaml"
else
    echo "❌ render.yaml - FALTANDO"
fi

if [ -f ".env.example" ]; then
    echo "✅ .env.example"
else
    echo "❌ .env.example - FALTANDO"
fi

if [ -f ".gitignore" ]; then
    echo "✅ .gitignore"
else
    echo "❌ .gitignore - FALTANDO"
fi

# Verificar pastas
echo ""
echo "📁 PASTAS QUE DEVEM SER ENVIADAS:"

if [ -d "public" ]; then
    echo "✅ public/"
else
    echo "❌ public/ - FALTANDO"
fi

if [ -d "models" ]; then
    echo "✅ models/"
else
    echo "❌ models/ - FALTANDO"
fi

if [ -d "routes" ]; then
    echo "✅ routes/"
else
    echo "❌ routes/ - FALTANDO"
fi

if [ -d "middleware" ]; then
    echo "✅ middleware/"
else
    echo "❌ middleware/ - FALTANDO"
fi

echo ""
echo "❌ ARQUIVOS QUE NÃO DEVEM SER ENVIADOS:"

# Verificar arquivos que NÃO devem ser enviados
if [ -f ".env" ]; then
    echo "🚨 .env ENCONTRADO - NÃO ENVIAR (contém senhas)"
else
    echo "✅ .env não encontrado (correto)"
fi

if [ -d "node_modules" ]; then
    echo "⚠️  node_modules/ ENCONTRADO - NÃO ENVIAR"
else
    echo "✅ node_modules/ não encontrado (correto)"
fi

if [ -d "uploads" ]; then
    echo "⚠️  uploads/ ENCONTRADO - NÃO ENVIAR"
else
    echo "✅ uploads/ não encontrado (correto)"
fi

if [ -f "server.js" ]; then
    echo "⚠️  server.js ENCONTRADO - NÃO ENVIAR (antigo)"
else
    echo "✅ server.js não encontrado (correto)"
fi

if [ -f "server-demo.js" ]; then
    echo "⚠️  server-demo.js ENCONTRADO - NÃO ENVIAR"
else
    echo "✅ server-demo.js não encontrado (correto)"
fi

echo ""
echo "📋 RESUMO:"
echo "=========="

# Contar arquivos importantes
IMPORTANT_FILES=("server-render.js" "package.json" "render.yaml" ".env.example" ".gitignore")
MISSING_FILES=0

for file in "${IMPORTANT_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ $file - FALTANDO"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -eq 0 ]; then
    echo "✅ Todos os arquivos importantes estão presentes"
    echo "🚀 Pronto para upload no GitHub!"
else
    echo "❌ $MISSING_FILES arquivo(s) importante(s) faltando"
    echo "⚠️  Corrija antes de fazer upload"
fi

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Fazer upload apenas dos arquivos ✅"
echo "2. NÃO enviar arquivos ❌"
echo "3. Deploy no Render"
echo "4. Configurar variáveis de ambiente" 