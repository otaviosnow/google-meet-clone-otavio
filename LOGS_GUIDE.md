# Guia de Logs - Diagnóstico de Autoplay

Este documento explica todos os logs implementados no frontend para diagnosticar problemas de autoplay do vídeo VSL.

## 🔍 Logs Implementados

### 1. Inicialização da Aplicação
```
=== INICIANDO GOOGLE MEET CLONE ===
ID da reunião gerado: abc-def-ghi
```

### 2. Solicitação de Permissões
```
=== SOLICITANDO PERMISSÕES ===
User Agent: Mozilla/5.0...
É HTTPS: true/false
É localhost: true/false
🔄 Solicitando permissões de câmera e microfone...
✅ Permissões concedidas com sucesso!
Stream tracks: ["video", "audio"]
🛑 Track parado: video
🛑 Track parado: audio
```

### 3. Simulação de Permissões (Demonstração)
```
=== SIMULANDO PERMISSÕES CONCEDIDAS ===
⚠️ ATENÇÃO: Esta é uma simulação para demonstração
Em produção, isso não deveria acontecer
⏳ Aguardando 2 segundos para mostrar loading...
🔄 Iniciando chamada após simulação...
```

### 4. Início da Chamada
```
=== INICIANDO CHAMADA ===
Estado atual:
- Permissões concedidas: true
- Chamada já iniciada: false
- Webcam ativa: false
- VSL pausado: true
📺 Loading screen escondida
📹 Iniciando webcam automaticamente...
🎬 Iniciando VSL automaticamente...
✅ Chamada iniciada com sucesso!
Estado final:
- Chamada iniciada: true
- Webcam ativa: true
- VSL pausado: false
```

### 5. Inicialização do VSL
```
=== INICIALIZANDO VSL ===
URL do vídeo: https://exemplo.com/video.mp4
Atributos do vídeo:
- autoplay: true
- muted: true
- playsinline: true
- webkit-playsinline: true
✅ VSL inicializado com todos os event listeners
```

### 6. Carregamento do VSL
```
🔄 VSL: Iniciando carregamento
⏱️ VSL: Duração carregada: 120.5
📊 VSL: Metadados carregados
- Duração: 120.5
- Largura: 1920
- Altura: 1080
✅ VSL: Dados carregados e pronto para reprodução
- ReadyState: 4
- NetworkState: 2
▶️ VSL: Pode começar a reproduzir
🎬 VSL: Pode reproduzir sem interrupções
```

### 7. Tentativa de Autoplay
```
=== INICIANDO VSL AUTOMATICAMENTE ===
Estado do vídeo antes do autoplay:
- Pausado: true
- Muted: true
- ReadyState: 4
- NetworkState: 2
- CurrentSrc: https://exemplo.com/video.mp4
- Duration: 120.5
- Volume: 1

=== TENTANDO AUTOPLAY ===
Estado do vídeo antes do play():
- Pausado: true
- Muted: true
- ReadyState: 4
- User Agent: Mozilla/5.0...
- É iOS: false
- É Safari: false
```

### 8. Sucesso do Autoplay
```
✅ AUTOPLAY SUCESSO!
Estado após play():
- Pausado: false
- CurrentTime: 0
- PlaybackRate: 1
▶️ VSL: Reprodução iniciada
- CurrentTime: 0
- PlaybackRate: 1
```

### 9. Falha do Autoplay
```
❌ AUTOPLAY FALHOU: NotAllowedError
Tipo de erro: NotAllowedError
Mensagem de erro: The play() request was interrupted by a call to pause().
🔒 ERRO: Autoplay bloqueado por política do navegador
Solução: Usuário precisa interagir com a página primeiro
📺 Mostrando overlay para interação manual
```

### 10. Início da Webcam
```
=== INICIANDO WEBCAM ===
Solicitando stream de vídeo...
✅ Stream de webcam obtido com sucesso
Tracks disponíveis: ["video"]
✅ Webcam ativada com sucesso
Estado da webcam:
- Ativa: true
- Vídeo ligado: true
- Stream ativo: true
```

## 🚨 Tipos de Erro Comuns

### Erros de Permissões
- **NotAllowedError**: Usuário negou permissões
- **NotFoundError**: Dispositivo não encontrado
- **NotReadableError**: Dispositivo já em uso
- **OverconstrainedError**: Configuração não suportada

### Erros de Autoplay
- **NotAllowedError**: Autoplay bloqueado por política do navegador
- **NotSupportedError**: Formato de vídeo não suportado
- **NetworkError**: Problema de rede ao carregar vídeo
- **AbortError**: Reprodução abortada

### Erros de Webcam
- **NotAllowedError**: Permissão de câmera negada
- **NotFoundError**: Câmera não encontrada
- **NotReadableError**: Câmera já em uso
- **OverconstrainedError**: Configuração de câmera não suportada

## 🔧 Como Usar os Logs

### 1. Abrir Console do Navegador
- **Chrome/Edge**: F12 → Console
- **Firefox**: F12 → Console
- **Safari**: Desenvolvedor → Console

### 2. Filtrar Logs
```javascript
// Filtrar apenas logs de VSL
console.log = function() {
    if (arguments[0].includes('VSL')) {
        console.log.apply(console, arguments);
    }
};

// Filtrar apenas erros
console.error = function() {
    console.error.apply(console, arguments);
};
```

### 3. Salvar Logs
```javascript
// Capturar todos os logs
const logs = [];
const originalLog = console.log;
console.log = function() {
    logs.push({
        timestamp: new Date().toISOString(),
        type: 'log',
        message: Array.from(arguments).join(' ')
    });
    originalLog.apply(console, arguments);
};

// Salvar logs
function saveLogs() {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'autoplay-logs.json';
    a.click();
}
```

## 📊 Estados do Vídeo

### ReadyState
- **0**: HAVE_NOTHING - Nenhuma informação
- **1**: HAVE_METADATA - Metadados carregados
- **2**: HAVE_CURRENT_DATA - Dados atuais disponíveis
- **3**: HAVE_FUTURE_DATA - Dados futuros disponíveis
- **4**: HAVE_ENOUGH_DATA - Dados suficientes para reprodução

### NetworkState
- **0**: NETWORK_EMPTY - Vídeo não inicializado
- **1**: NETWORK_IDLE - Vídeo selecionado mas não carregando
- **2**: NETWORK_LOADING - Vídeo carregando
- **3**: NETWORK_NO_SOURCE - Vídeo não encontrado

## 🎯 Diagnóstico de Problemas

### Vídeo não inicia automaticamente
1. Verificar se `ReadyState` é 4
2. Verificar se não há erros de rede
3. Verificar se o navegador suporta autoplay
4. Verificar se o usuário interagiu com a página

### Permissões não funcionam
1. Verificar se é HTTPS ou localhost
2. Verificar se o navegador suporta getUserMedia
3. Verificar se há dispositivos disponíveis
4. Verificar se não há conflitos de permissão

### iOS não funciona
1. Verificar se todos os atributos iOS estão presentes
2. Verificar se o vídeo está muted
3. Verificar se o usuário interagiu com a página
4. Verificar se não há bloqueios do Safari

## 📱 Compatibilidade por Navegador

### Chrome
- ✅ Autoplay com muted
- ✅ Permissões funcionam
- ✅ Webcam funciona

### Safari (iOS)
- ⚠️ Autoplay limitado
- ✅ Permissões funcionam
- ✅ Webcam funciona

### Firefox
- ✅ Autoplay com muted
- ✅ Permissões funcionam
- ✅ Webcam funciona

### Edge
- ✅ Autoplay com muted
- ✅ Permissões funcionam
- ✅ Webcam funciona

---

**Use estes logs para diagnosticar problemas de autoplay e permissões em diferentes navegadores e dispositivos.** 