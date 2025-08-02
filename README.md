# Google Meet Clone - Chamada Fake

Um clone do Google Meet que simula uma chamada de vídeo com interface idêntica ao original, incluindo tela inicial de configuração de câmera/microfone e reprodução automática de vídeo VSL.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Tela inicial idêntica ao Google Meet** com configuração de câmera/microfone
- **Interface 100% fiel ao Google Meet** com header, controles e layout responsivo
- **Reprodução automática de vídeo VSL** quando entra na chamada
- **Vídeo sem controles** (play, pause, progresso ocultos)
- **Webcam integrada** que aparece como participante na chamada
- **Controles de áudio/vídeo** funcionais com ícones do Google Meet
- **Chat idêntico ao Google Meet** com interface completa
- **Geração dinâmica de ID da reunião**
- **Persistência no localStorage** - volta para a chamada se recarregar
- **Compatibilidade total com iOS** (incluindo Safari)
- **Prevenção de fullscreen** no vídeo VSL
- **Responsivo** para mobile e desktop

### 🎯 Características Técnicas
- **Tela inicial**: Configuração de câmera/microfone antes de entrar
- **Vídeo sem controles**: O VSL não tem pause, play ou controles visíveis
- **Autoplay inteligente**: Inicia automaticamente após entrar na chamada
- **Webcam overlay**: Posicionada sobre o vídeo principal
- **Interface realista**: Visual e comportamento idênticos ao Google Meet
- **localStorage**: Salva estado da chamada para persistência

## 📁 Estrutura do Projeto

```
oi/
├── index.html          # Página principal com tela inicial e chamada
├── script.js           # Lógica JavaScript principal
├── style.css           # Estilos CSS idênticos ao Google Meet
├── ios-fix.js          # Correções específicas para iOS
├── chat_icon_black_bg.png  # Ícone do chat
├── CRIATIVO 6.mp4      # Vídeo de exemplo
├── README.md           # Documentação
└── LOGS_GUIDE.md      # Guia de logs para diagnóstico
```

## 🛠️ Como Usar

### 1. Abrir o Projeto
```bash
# Navegue até a pasta do projeto
cd oi

# Abra o index.html em um servidor local
# Recomendado usar um servidor local para evitar problemas de CORS
```

### 2. Servidor Local (Recomendado)
```bash
# Python 3
python -m http.server 8000

# Node.js (se tiver instalado)
npx serve .

# PHP
php -S localhost:8000
```

### 3. Acessar
Abra o navegador e acesse: `http://localhost:8000`

## 🔧 Funcionamento

### Fluxo da Aplicação
1. **Tela Inicial**: Página idêntica ao Google Meet com preview da câmera
2. **Configuração**: Usuário ativa câmera e/ou microfone
3. **Botão Entrar**: Fica habilitado quando pelo menos um dispositivo está ativo
4. **Chamada**: Interface do Google Meet aparece
5. **Vídeo**: VSL inicia automaticamente
6. **Webcam**: Câmera do usuário aparece como participante
7. **Persistência**: Se recarregar, volta direto para a chamada

### Controles Disponíveis
- **Câmera**: Liga/desliga câmera na tela inicial
- **Microfone**: Liga/desliga microfone na tela inicial
- **Entrar**: Botão para entrar na chamada
- **M (Mudo)**: Controla o áudio do VSL
- **V (Vídeo)**: Liga/desliga a webcam
- **S (Som)**: Liga/desliga o som do VSL
- **Espaço**: Play/pause do VSL
- **ESC**: Fecha o chat

## 🎨 Personalização

### Alterar Vídeo VSL
Edite o arquivo `index.html` na linha 47:
```html
<source src="SEU_VIDEO_URL_AQUI" type="video/mp4">
```

### URLs Suportadas
- **URL direta**: `https://exemplo.com/video.mp4`
- **Google Drive**: `https://drive.google.com/uc?export=download&id=SEU_ID`
- **Dropbox**: `https://dl.dropboxusercontent.com/s/SEU_ARQUIVO.mp4`
- **Arquivo local**: `./videos/meu-video.mp4`

### Estilização
- **Cores**: Edite as variáveis CSS em `style.css`
- **Layout**: Modifique as classes CSS conforme necessário
- **Responsividade**: Ajuste os breakpoints mobile

## 📱 Compatibilidade

### Navegadores Testados
- ✅ Chrome (Desktop/Mobile)
- ✅ Safari (iOS/Mac)
- ✅ Firefox (Desktop/Mobile)
- ✅ Edge (Desktop)
- ✅ Samsung Internet (Android)

### Dispositivos
- ✅ Desktop (Windows/Mac/Linux)
- ✅ Mobile (iOS/Android)
- ✅ Tablet (iPad/Android)

## 🔒 Segurança

### Permissões
- **Câmera**: Necessária para webcam do usuário
- **Microfone**: Necessária para áudio da chamada
- **Armazenamento**: localStorage para persistência da chamada

### Privacidade
- **Sem gravação**: Nenhum vídeo é gravado
- **Sem upload**: Nenhum arquivo é enviado
- **Local apenas**: Tudo funciona no navegador

## 🚀 Próximos Passos

### Para o SaaS Completo
1. **Backend Node.js/Express** com MongoDB
2. **Sistema de autenticação** (login/registro)
3. **Upload de vídeos** para o servidor
4. **Geração de links únicos** para cada chamada
5. **Dashboard do usuário** para gerenciar vídeos
6. **Deploy na VPS** (Render/Hostinger)

### Funcionalidades Futuras
- [ ] Sistema de login/registro
- [ ] Upload de vídeos
- [ ] Geração de links únicos
- [ ] Dashboard administrativo
- [ ] Analytics de visualizações
- [ ] Integração com Google Drive
- [ ] Compartilhamento de links

## 🐛 Troubleshooting

### Problemas Comuns

#### Vídeo não inicia
```javascript
// Verifique se o URL do vídeo está correto
// Teste com um vídeo público primeiro
```

#### Permissões não funcionam
```javascript
// Certifique-se de usar HTTPS ou localhost
// Alguns navegadores bloqueiam permissões em HTTP
```

#### iOS não funciona
```javascript
// O arquivo ios-fix.js já inclui todas as correções
// Teste em Safari iOS
```

#### Webcam não aparece
```javascript
// Verifique se permitiu acesso à câmera
// Clique no botão de vídeo para ativar manualmente
```

#### Tela inicial não aparece
```javascript
// Limpe o localStorage: localStorage.removeItem('googleMeetInCall')
// Recarregue a página
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Teste em diferentes navegadores
3. Certifique-se de usar HTTPS ou localhost
4. Verifique as permissões do navegador
5. Consulte o `LOGS_GUIDE.md` para diagnóstico detalhado

## 📄 Licença

Este projeto é para fins educacionais e de demonstração.

---

**Desenvolvido para criar chamadas fake do Google Meet com interface idêntica ao original e reprodução automática de vídeos VSL.** 