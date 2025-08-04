# Google Meet Fake - SaaS

Um SaaS completo para criar chamadas fake do Google Meet. Os usuários podem fazer upload de vídeos, criar reuniões e gerar links únicos que simulam reuniões do Google Meet com reprodução automática.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Sistema de autenticação** completo (registro/login)
- **Upload de vídeos** (MP4, WebM, etc.)
- **Suporte a Google Drive** e URLs externas
- **Dashboard completo** para gerenciar vídeos e reuniões
- **Geração de links únicos** para cada reunião
- **Reprodução automática** de vídeo quando entra na chamada
- **Interface idêntica ao Google Meet** com todas as telas
- **Webcam integrada** que aparece como participante
- **Chat funcional** durante a chamada
- **Responsivo** para desktop e mobile
- **Compatibilidade total com iOS** (Safari)
- **API REST completa** com MongoDB
- **Segurança** com JWT, rate limiting e validações

### 🎯 Características Técnicas
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: HTML5 + CSS3 + JavaScript puro
- **Autenticação**: JWT (JSON Web Tokens)
- **Upload**: Multer para arquivos de vídeo
- **Segurança**: Helmet, CORS, Rate Limiting
- **Banco de dados**: MongoDB com Mongoose
- **Deploy**: Pronto para Render/Hostinger

## 📁 Estrutura do Projeto

```
google-meet-fake-saas/
├── server.js                 # Servidor principal
├── package.json             # Dependências Node.js
├── env.example             # Exemplo de variáveis de ambiente
├── models/                 # Modelos MongoDB
│   ├── User.js            # Modelo de usuário
│   ├── Video.js           # Modelo de vídeo
│   └── Meeting.js         # Modelo de reunião
├── routes/                 # Rotas da API
│   ├── auth.js            # Autenticação
│   ├── users.js           # Usuários
│   ├── videos.js          # Vídeos
│   └── meetings.js        # Reuniões
├── middleware/             # Middlewares
│   └── auth.js            # Autenticação JWT
├── public/                 # Frontend
│   ├── index.html         # Dashboard principal
│   ├── meet.html          # Página de chamada
│   ├── css/               # Estilos
│   │   ├── style.css      # Dashboard
│   │   └── meet.css       # Chamada
│   ├── js/                # JavaScript
│   │   ├── app.js         # Dashboard
│   │   └── meet.js        # Chamada
│   └── images/            # Imagens
├── uploads/               # Vídeos enviados (criado automaticamente)
└── README_SAAS.md         # Este arquivo
```

## 🛠️ Instalação

### 1. Pré-requisitos
- Node.js 16+ 
- MongoDB (local ou Atlas)
- Git

### 2. Clone o repositório
```bash
git clone <seu-repositorio>
cd google-meet-fake-saas
```

### 3. Instale as dependências
```bash
npm install
```

### 4. Configure as variáveis de ambiente
```bash
cp env.example .env
```

Edite o arquivo `.env`:
```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/google-meet-fake
# Para produção: mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=100000000

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Inicie o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 6. Acesse a aplicação
Abra o navegador e acesse: `http://localhost:3000`

## 🚀 Deploy

### Render (Recomendado)

1. **Crie uma conta no Render**
2. **Conecte seu repositório GitHub**
3. **Configure as variáveis de ambiente**:
   - `MONGODB_URI`: Sua string de conexão MongoDB Atlas
   - `JWT_SECRET`: Chave secreta para JWT
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: Sua URL do Render

4. **Deploy automático** - Render fará o deploy automaticamente

### Hostinger

1. **Acesse o painel do Hostinger**
2. **Configure Node.js** na seção de aplicações
3. **Faça upload dos arquivos** via FTP ou Git
4. **Configure as variáveis de ambiente** no painel
5. **Inicie a aplicação**

### MongoDB Atlas (Banco de dados)

1. **Crie uma conta no MongoDB Atlas**
2. **Crie um cluster** (gratuito)
3. **Configure o IP** (0.0.0.0/0 para qualquer IP)
4. **Crie um usuário** com senha
5. **Copie a string de conexão** e use no `MONGODB_URI`

## 📱 Como Usar

### 1. Registro/Login
- Acesse a página inicial
- Clique em "Registrar" ou "Entrar"
- Preencha os dados e crie sua conta

### 2. Dashboard
Após o login, você terá acesso ao dashboard com:

#### **Meus Vídeos**
- Adicione vídeos via upload do computador
- Use links do Google Drive
- URLs externas de vídeos
- Gerencie seus vídeos (editar, deletar)

#### **Minhas Reuniões**
- Crie reuniões selecionando um vídeo
- Configure título, descrição e participantes
- Copie os links únicos gerados
- Gerencie suas reuniões

#### **Meu Perfil**
- Veja estatísticas (vídeos, reuniões, visualizações)
- Atualize dados do perfil
- Altere senha

### 3. Chamadas
- Compartilhe os links gerados
- Quem acessar verá a interface do Google Meet
- Vídeo inicia automaticamente
- Webcam opcional do participante
- Chat funcional durante a chamada

## 🔧 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário atual

### Vídeos
- `GET /api/videos` - Listar vídeos do usuário
- `POST /api/videos` - Criar novo vídeo
- `GET /api/videos/:id` - Obter vídeo específico
- `PUT /api/videos/:id` - Atualizar vídeo
- `DELETE /api/videos/:id` - Deletar vídeo

### Reuniões
- `GET /api/meetings` - Listar reuniões do usuário
- `POST /api/meetings` - Criar nova reunião
- `GET /api/meetings/:meetingId` - Obter reunião pública
- `PUT /api/meetings/:id` - Atualizar reunião
- `DELETE /api/meetings/:id` - Deletar reunião

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `PUT /api/users/password` - Alterar senha
- `GET /api/users/stats` - Estatísticas

## 🎨 Personalização

### Cores e Estilo
Edite os arquivos CSS em `public/css/`:
- `style.css` - Dashboard
- `meet.css` - Interface da chamada

### Logo
Substitua `public/images/meet-logo.png` pelo seu logo

### Vídeo Padrão
Para o modo demo, edite em `public/js/meet.js`:
```javascript
video: {
    url: 'https://seu-video.mp4'
}
```

## 🔒 Segurança

### Implementado
- ✅ JWT para autenticação
- ✅ Hash de senhas com bcrypt
- ✅ Rate limiting
- ✅ Validação de dados
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Sanitização de inputs

### Recomendações
- Use HTTPS em produção
- Configure firewall adequado
- Monitore logs de acesso
- Faça backup regular do MongoDB
- Atualize dependências regularmente

## 📊 Monitoramento

### Logs
O servidor gera logs detalhados:
- Conexão com MongoDB
- Requisições da API
- Erros de autenticação
- Upload de arquivos

### Métricas
- Visualizações por reunião
- Vídeos mais populares
- Usuários ativos
- Tempo de sessão

## 🐛 Troubleshooting

### Problemas Comuns

#### Vídeo não inicia
```javascript
// Verifique se o URL está acessível
// Teste com um vídeo público primeiro
// Verifique se o formato é suportado
```

#### Upload não funciona
```javascript
// Verifique permissões da pasta uploads/
// Confirme tamanho máximo do arquivo
// Verifique se o formato é aceito
```

#### MongoDB não conecta
```javascript
// Verifique a string de conexão
// Confirme se o IP está liberado
// Teste com MongoDB Compass
```

#### Deploy não funciona
```javascript
// Verifique variáveis de ambiente
// Confirme se o PORT está correto
// Verifique logs do Render/Hostinger
```

## 🚀 Próximos Passos

### Funcionalidades Futuras
- [ ] Integração com Google Drive API
- [ ] Analytics avançado
- [ ] Notificações em tempo real
- [ ] Compartilhamento em redes sociais
- [ ] Templates de vídeo
- [ ] Sistema de planos/pagamentos
- [ ] API pública para desenvolvedores
- [ ] App mobile (React Native)

### Melhorias Técnicas
- [ ] Cache com Redis
- [ ] CDN para vídeos
- [ ] Compressão de vídeo
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoramento com Sentry
- [ ] Backup automático

## 📞 Suporte

Para dúvidas ou problemas:

1. **Verifique os logs** do servidor
2. **Teste em diferentes navegadores**
3. **Confirme as variáveis de ambiente**
4. **Verifique a conexão com MongoDB**
5. **Teste o upload de arquivos**

## 📄 Licença

Este projeto é para fins educacionais e comerciais.

---

**Desenvolvido para criar chamadas fake do Google Meet com interface idêntica ao original e sistema completo de SaaS.** 