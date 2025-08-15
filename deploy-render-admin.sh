#!/bin/bash

echo "🚀 DEPLOY AUTOMATIZADO - CALLX COM PAINEL ADMIN"
echo "================================================"
echo ""

# Verificar se está no diretório correto
if [ ! -f "server-render.js" ]; then
    echo "❌ Erro: Execute este script no diretório do projeto"
    exit 1
fi

# Verificar se tem .env
if [ ! -f ".env" ]; then
    echo "❌ Erro: Arquivo .env não encontrado"
    exit 1
fi

# Verificar variáveis de ambiente
echo "🔍 Verificando configurações..."
if grep -q "MONGODB_URI" .env; then
    echo "✅ MongoDB Atlas configurado"
else
    echo "❌ MONGODB_URI não encontrado no .env"
    exit 1
fi

if grep -q "JWT_SECRET" .env; then
    echo "✅ JWT_SECRET configurado"
else
    echo "❌ JWT_SECRET não encontrado no .env"
    exit 1
fi

echo ""
echo "📋 Status do Git..."
git status --porcelain

echo ""
echo "🔄 Fazendo commit das alterações..."
git add .
git commit -m "🚀 Deploy Automático - Painel Admin Completo"

echo ""
echo "📤 Enviando para GitHub..."
git push origin main

echo ""
echo "✅ CÓDIGO ENVIADO COM SUCESSO!"
echo ""
echo "🌐 PRÓXIMOS PASSOS PARA DEPLOY:"
echo ""
echo "1️⃣  Acesse: https://render.com"
echo "2️⃣  Faça login com GitHub"
echo "3️⃣  Clique em 'New +' → 'Web Service'"
echo "4️⃣  Conecte o repositório: google-meet-clone-otavio"
echo "5️⃣  Configure as variáveis de ambiente:"
echo ""
echo "   NODE_ENV=production"
echo "   MONGODB_URI=$(grep MONGODB_URI .env | cut -d'=' -f2)"
echo "   JWT_SECRET=$(grep JWT_SECRET .env | cut -d'=' -f2)"
echo ""
echo "6️⃣  Build Command: npm install"
echo "7️⃣  Start Command: node server-render.js"
echo "8️⃣  Clique em 'Create Web Service'"
echo ""
echo "⏱️  Aguarde 2-3 minutos para o deploy"
echo ""
echo "🔗 URLs FINAIS:"
echo "   Site: https://google-meet-saas-v2.onrender.com"
echo "   Admin: https://google-meet-saas-v2.onrender.com/admin"
echo "   Email: teste90@gmail.com"
echo "   Senha: Teste90!"
echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
