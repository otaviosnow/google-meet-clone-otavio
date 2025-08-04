#!/bin/bash

echo "🚀 Iniciando deploy no Render..."

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git não está instalado. Instalando..."
    echo "📦 Instalando Xcode Command Line Tools..."
    xcode-select --install
    echo "⏳ Aguarde a instalação terminar e execute o script novamente."
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "server-auth.js" ]; then
    echo "❌ Arquivo server-auth.js não encontrado. Execute este script no diretório do projeto."
    exit 1
fi

echo "✅ Git encontrado. Continuando..."

# Inicializar Git se não existir
if [ ! -d ".git" ]; then
    echo "📁 Inicializando Git..."
    git init
fi

# Verificar arquivos que serão enviados
echo "📋 Verificando arquivos..."
echo "✅ Arquivos que serão enviados:"
ls -la | grep -E "\.(js|json|md|html|css)$|^(public|models|routes|middleware)$"

# Adicionar arquivos
echo "📤 Adicionando arquivos ao Git..."
git add .

# Verificar status
echo "📊 Status do Git:"
git status

# Fazer commit
echo "💾 Fazendo commit..."
git commit -m "Deploy Google Meet Fake SaaS - $(date)"

# Verificar se já tem remote
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 Configurando repositório remoto..."
    echo "📝 IMPORTANTE: Crie um repositório no GitHub primeiro!"
    echo "🌐 Acesse: https://github.com/new"
    echo "📝 Nome: google-meet-fake-saas"
    echo "📝 Deixe público"
    echo "📝 NÃO inicialize com README"
    echo ""
    read -p "Digite a URL do seu repositório GitHub: " github_url
    
    if [ -z "$github_url" ]; then
        echo "❌ URL não fornecida. Deploy cancelado."
        exit 1
    fi
    
    git remote add origin "$github_url"
fi

# Enviar para GitHub
echo "🚀 Enviando para GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Código enviado para GitHub!"
echo ""
echo "🎯 Próximos passos:"
echo "1. 🌐 Acesse: https://dashboard.render.com"
echo "2. ➕ Clique 'New +' → 'Web Service'"
echo "3. 🔗 Conecte ao GitHub"
echo "4. 📁 Selecione o repositório: google-meet-fake-saas"
echo "5. ⚙️ Configure:"
echo "   - Name: google-meet-fake-saas"
echo "   - Build Command: npm install"
echo "   - Start Command: node server-auth.js"
echo "6. 🔧 Configure variáveis de ambiente:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - MONGODB_URI=mongodb+srv://tavinmktdigital:otaviosnow2012@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority"
echo "   - JWT_SECRET=chave_secreta_muito_segura_123456"
echo ""
echo "🎉 Deploy configurado com sucesso!" 