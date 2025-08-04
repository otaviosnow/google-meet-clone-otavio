#!/bin/bash

echo "📋 Arquivos que PRECISAM ser enviados para o GitHub:"
echo "=================================================="

echo ""
echo "🚨 CRÍTICO - Estes arquivos devem estar no repositório:"

# Verificar arquivos críticos
CRITICAL_FILES=("server-render.js" "package.json" "render.yaml" ".env.example" ".gitignore")
MISSING_CRITICAL=0

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file (existe localmente)"
    else
        echo "❌ $file - FALTANDO"
        MISSING_CRITICAL=$((MISSING_CRITICAL + 1))
    fi
done

echo ""
echo "📁 Pastas que devem ser enviadas:"
FOLDERS=("public" "models" "routes" "middleware")
MISSING_FOLDERS=0

for folder in "${FOLDERS[@]}"; do
    if [ -d "$folder" ]; then
        echo "✅ $folder/ (existe localmente)"
    else
        echo "❌ $folder/ - FALTANDO"
        MISSING_FOLDERS=$((MISSING_FOLDERS + 1))
    fi
done

echo ""
echo "❌ Arquivos que NÃO devem ser enviados:"
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

echo ""
echo "📋 INSTRUÇÕES PARA UPLOAD:"
echo "=========================="

if [ $MISSING_CRITICAL -eq 0 ] && [ $MISSING_FOLDERS -eq 0 ]; then
    echo "✅ Todos os arquivos necessários estão presentes"
    echo ""
    echo "🔧 PASSO A PASSO:"
    echo "1. Acesse: https://github.com/otaviosnow/google-meet-fake-saas"
    echo "2. Clique em 'Add file' → 'Upload files'"
    echo "3. Arraste os seguintes arquivos:"
    echo "   - server-render.js"
    echo "   - package.json"
    echo "   - render.yaml"
    echo "   - .env.example"
    echo "   - .gitignore"
    echo "   - Pasta public/ (toda)"
    echo "   - Pasta models/ (toda)"
    echo "   - Pasta routes/ (toda)"
    echo "   - Pasta middleware/ (toda)"
    echo "4. NÃO envie: .env, node_modules/, uploads/"
    echo "5. Clique 'Commit changes'"
    echo ""
    echo "🎯 Após o upload, o Render fará deploy automático"
else
    echo "❌ Alguns arquivos estão faltando"
    echo "⚠️  Corrija antes de fazer upload"
fi

echo ""
echo "🔍 Para verificar se funcionou:"
echo "1. Acesse o repositório no GitHub"
echo "2. Verifique se server-render.js está lá"
echo "3. Aguarde o deploy automático no Render"
echo "4. Teste: https://seu-app.onrender.com/api/test" 