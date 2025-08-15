// Estado da aplicação
let currentScreen = 'name';
let participantName = '';
let isCameraEnabled = false;
let isMicrophoneEnabled = false;
let isWebcamActive = false;
let webcamStream = null;
let isMuted = true;
let isVideoOn = false;
let isCallStarted = false;
let meetingId = '';
let meetingData = null;

// Elementos DOM
const nameScreen = document.getElementById('nameScreen');
const deviceScreen = document.getElementById('deviceScreen');
const callScreen = document.getElementById('callScreen');
const endedScreen = document.getElementById('endedScreen');

// Tela 1: Nome
const participantNameInput = document.getElementById('participantName');
const continueBtn = document.getElementById('continueBtn');

// Tela 2: Dispositivos
const previewVideo = document.getElementById('previewVideo');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const cameraBtn = document.getElementById('cameraBtn');
const microphoneBtn = document.getElementById('microphoneBtn');
const joinBtn = document.getElementById('joinBtn');
const meetingIdElement = document.getElementById('meetingId');

// Tela 3: Chamada
const vslVideo = document.getElementById('vslVideo');
const vslIframe = document.getElementById('vslIframe');
const webcamVideo = document.getElementById('webcamVideo');
const userVideoPlaceholder = document.getElementById('userVideoPlaceholder');
const muteBtn = document.getElementById('muteBtn');
const videoBtn = document.getElementById('videoBtn');
const chatBtn = document.getElementById('chatBtn');
const endCallBtn = document.getElementById('endCallBtn');

// Chat
const chatPopup = document.getElementById('chatPopup');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatMessages = document.getElementById('chatMessages');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO GOOGLE MEET CLONE ===');
    
    // Obter ID da reunião da URL
    const pathParts = window.location.pathname.split('/');
    meetingId = pathParts[pathParts.length - 1];
    
    if (meetingId === 'demo') {
        // Modo demo - usar vídeo padrão
        meetingData = {
            meetingId: 'demo',
            title: 'Demo Meeting',
            video: {
                url: 'https://guiaalpha.fun/wp-content/uploads/2025/07/CRIATIVO-10.mp4'
            }
        };
        initializeDemo();
    } else {
        // Carregar dados da reunião da API
        loadMeetingData();
    }
    
    // Inicializar componentes
    initializeNameScreen();
    initializeDeviceScreen();
    initializeCallScreen();
    initializeChat();
});

// Função para carregar dados da reunião
async function loadMeetingData() {
    try {
        console.log('🔄 Carregando dados da reunião:', meetingId);
        
        // Limpar localStorage para nova reunião
        localStorage.removeItem('googleMeetInCall');
        localStorage.removeItem('googleMeetEnded');
        console.log('🧹 LocalStorage limpo para nova reunião');
        
        const response = await fetch(`/api/meetings/${meetingId}`);
        
        if (response.ok) {
            const result = await response.json();
            meetingData = result.meeting;
            accessInfo = result.accessInfo;
            
            console.log('✅ Reunião carregada:', meetingData);
            console.log('📊 Informações de acesso:', accessInfo);
            
            // Verificar se é o criador ou primeira pessoa adicional
            if (accessInfo.isCreator) {
                console.log('👑 Usuário é o criador da reunião');
            } else if (accessInfo.isFirstAdditional) {
                console.log('🎯 Usuário é a primeira pessoa adicional a acessar');
            } else {
                console.log('👤 Usuário é pessoa adicional já autorizada');
            }
            
            startVSL();
        } else if (response.status === 403) {
            const errorData = await response.json();
            showErrorScreen('Acesso Negado', errorData.error, 'fa-users-slash');
        } else if (response.status === 404) {
            showErrorScreen('Reunião Não Encontrada', 'A reunião solicitada não existe ou foi removida.', 'fa-exclamation-triangle');
        } else {
            showErrorScreen('Erro', 'Ocorreu um erro ao carregar a reunião.', 'fa-exclamation-circle');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados da reunião:', error);
        showErrorScreen('Erro ao carregar reunião');
    }
}

// Função para registrar entrada na reunião
async function registerMeetingJoin() {
    try {
        await fetch(`/api/meetings/${meetingId}/join`, {
            method: 'POST'
        });
        console.log('✅ Entrada na reunião registrada');
    } catch (error) {
        console.error('❌ Erro ao registrar entrada:', error);
    }
}

// Função para inicializar modo demo
function initializeDemo() {
    console.log('🎬 Iniciando modo demo');
    meetingIdElement.textContent = 'demo';
    
    // Verificar se já está na chamada ou encerrada
    const isInCall = localStorage.getItem('googleMeetInCall');
    const isEnded = localStorage.getItem('googleMeetEnded');
    
    if (isEnded === 'true') {
        console.log('🔄 Chamada foi encerrada - mostrando tela de encerramento');
        showEndedScreen();
    } else if (isInCall === 'true') {
        console.log('🔄 Usuário já estava na chamada - restaurando...');
        showCallScreen();
        startCall();
    } else {
        console.log('🆕 Primeira vez - mostrando tela de nome');
        showNameScreen();
    }
}

// Função para mostrar tela de erro
function showErrorScreen(title = 'Erro', message = 'Ocorreu um erro inesperado.', icon = 'fa-exclamation-circle') {
    console.log('❌ Mostrando tela de erro:', title, message);
    
    // Esconder todas as telas
    hideAllScreens();
    
    // Mostrar tela de erro
    endedScreen.style.display = 'flex'; // Assuming endedScreen is the error screen
    
    // Atualizar conteúdo da tela de erro
    const errorTitle = endedScreen.querySelector('.error-title');
    const errorMessage = endedScreen.querySelector('.error-message');
    const errorIcon = endedScreen.querySelector('.error-icon i');
    
    if (errorTitle) errorTitle.textContent = title;
    if (errorMessage) errorMessage.textContent = message;
    if (errorIcon) {
        errorIcon.className = `fas ${icon}`;
    }
}

// Função para mostrar tela de nome
function showNameScreen() {
    currentScreen = 'name';
    nameScreen.style.display = 'flex';
    deviceScreen.style.display = 'none';
    callScreen.style.display = 'none';
    endedScreen.style.display = 'none';
    console.log('📝 Mostrando tela de nome');
}

// Função para mostrar tela de dispositivos
function showDeviceScreen() {
    currentScreen = 'device';
    nameScreen.style.display = 'none';
    deviceScreen.style.display = 'flex';
    callScreen.style.display = 'none';
    endedScreen.style.display = 'none';
    console.log('📱 Mostrando tela de dispositivos');
}

// Função para mostrar tela de chamada
function showCallScreen() {
    currentScreen = 'call';
    nameScreen.style.display = 'none';
    deviceScreen.style.display = 'none';
    callScreen.style.display = 'flex';
    endedScreen.style.display = 'none';
    console.log('📹 Mostrando tela de chamada');
}

// Função para mostrar tela de encerramento
function showEndedScreen() {
    currentScreen = 'ended';
    nameScreen.style.display = 'none';
    deviceScreen.style.display = 'none';
    callScreen.style.display = 'none';
    endedScreen.style.display = 'flex';
    console.log('🏁 Mostrando tela de encerramento');
}

// Inicializar tela de nome
function initializeNameScreen() {
    // Input de nome
    participantNameInput.addEventListener('input', function() {
        const name = this.value.trim();
        continueBtn.disabled = name.length === 0;
    });
    
    // Botão continuar
    continueBtn.addEventListener('click', function() {
        participantName = participantNameInput.value.trim();
        if (participantName.length > 0) {
            console.log('✅ Nome definido:', participantName);
            showDeviceScreen();
        }
    });
    
    // Enter para continuar
    participantNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !continueBtn.disabled) {
            continueBtn.click();
        }
    });
}

// Inicializar tela de dispositivos
function initializeDeviceScreen() {
    // Botão de câmera
    cameraBtn.addEventListener('click', function() {
        toggleCamera();
    });
    
    // Botão de microfone
    microphoneBtn.addEventListener('click', function() {
        toggleMicrophone();
    });
    
    // Botão de entrar
    joinBtn.addEventListener('click', function() {
        joinCall();
    });
}

// Função para alternar câmera
async function toggleCamera() {
    try {
        if (!isCameraEnabled) {
            console.log('📹 Ativando câmera...');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 400 },
                    height: { ideal: 300 },
                    facingMode: 'user'
                },
                audio: false
            });
            
            previewVideo.srcObject = stream;
            previewVideo.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            
            isCameraEnabled = true;
            cameraBtn.classList.add('active');
            cameraBtn.classList.remove('disabled');
            
            console.log('✅ Câmera ativada com sucesso');
            
        } else {
            console.log('📹 Desativando câmera...');
            
            if (previewVideo.srcObject) {
                previewVideo.srcObject.getTracks().forEach(track => track.stop());
            }
            
            previewVideo.srcObject = null;
            previewVideo.style.display = 'none';
            previewPlaceholder.style.display = 'flex';
            
            isCameraEnabled = false;
            cameraBtn.classList.remove('active');
            cameraBtn.classList.add('disabled');
            
            console.log('✅ Câmera desativada');
        }
        
        updateJoinButton();
        
    } catch (error) {
        console.error('❌ Erro ao alternar câmera:', error);
        alert('Erro ao acessar a câmera. Verifique as permissões.');
    }
}

// Função para alternar microfone
async function toggleMicrophone() {
    try {
        if (!isMicrophoneEnabled) {
            console.log('🎤 Ativando microfone...');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });
            
            // Parar o stream imediatamente (só precisamos das permissões)
            stream.getTracks().forEach(track => track.stop());
            
            isMicrophoneEnabled = true;
            microphoneBtn.classList.add('active');
            microphoneBtn.classList.remove('disabled');
            
            console.log('✅ Microfone ativado com sucesso');
            
        } else {
            console.log('🎤 Desativando microfone...');
            
            isMicrophoneEnabled = false;
            microphoneBtn.classList.remove('active');
            microphoneBtn.classList.add('disabled');
            
            console.log('✅ Microfone desativado');
        }
        
        updateJoinButton();
        
    } catch (error) {
        console.error('❌ Erro ao alternar microfone:', error);
        alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
}

// Função para atualizar botão de entrar
function updateJoinButton() {
    if (isCameraEnabled || isMicrophoneEnabled) {
        joinBtn.disabled = false;
        console.log('✅ Botão de entrar habilitado');
    } else {
        joinBtn.disabled = true;
        console.log('❌ Botão de entrar desabilitado');
    }
}

// Função para entrar na chamada
function joinCall() {
    console.log('=== ENTRANDO NA CHAMADA ===');
    
    // Salvar no localStorage
    localStorage.setItem('googleMeetInCall', 'true');
    localStorage.removeItem('googleMeetEnded');
    
    // Mostrar tela de chamada
    showCallScreen();
    
    // Iniciar chamada
    startCall();
    
    console.log('✅ Usuário entrou na chamada');
}

// Função para iniciar a chamada
function startCall() {
    console.log('=== INICIANDO CHAMADA ===');
    
    // Iniciar webcam automaticamente se estava ativa
    if (isCameraEnabled) {
        console.log('📹 Iniciando webcam automaticamente...');
        startWebcam();
    }
    
    // Iniciar VSL automaticamente
    console.log('🎬 Iniciando VSL automaticamente...');
    startVSL();
    
    isCallStarted = true;
    
    console.log('✅ Chamada iniciada com sucesso!');
}

// Função para iniciar VSL
function startVSL() {
    console.log('🎬 Iniciando VSL...');
    
    if (!meetingData || !meetingData.video) {
        console.error('❌ Dados do vídeo não encontrados');
        return;
    }
    
    const videoUrl = meetingData.video.url;
    console.log('📹 URL do vídeo:', videoUrl);
    
    // Verificar se é um vídeo do YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = extractYouTubeId(videoUrl);
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0`;
        
        console.log('🎥 Configurando vídeo do YouTube:', embedUrl);
        
        vslIframe.src = embedUrl;
        vslIframe.style.display = 'block';
        vslVideo.style.display = 'none';
        
        // Adicionar listener para detectar quando o vídeo termina
        vslIframe.onload = function() {
            console.log('✅ Iframe do YouTube carregado');
            // Para YouTube, vamos usar um timer baseado no tempo estimado do vídeo
            // Como não podemos detectar diretamente o fim do vídeo do YouTube via iframe,
            // vamos usar um timeout de 20 minutos como fallback
            setTimeout(() => {
                console.log('⏰ Timeout do YouTube atingido - encerrando reunião');
                endCallAndDeleteMeeting();
            }, 20 * 60 * 1000); // 20 minutos
        };
        
    } else {
        // Vídeo local ou de outra fonte
        console.log('🎥 Configurando vídeo local:', videoUrl);
        
        vslVideo.src = videoUrl;
        vslVideo.style.display = 'block';
        vslIframe.style.display = 'none';
        
        // Adicionar listener para detectar quando o vídeo termina
        vslVideo.addEventListener('ended', function() {
            console.log('🎬 Vídeo terminou - encerrando reunião');
            endCallAndDeleteMeeting();
        });
        
        // Adicionar listener para erros de vídeo
        vslVideo.addEventListener('error', function(e) {
            console.error('❌ Erro no vídeo:', e);
            showErrorScreen('Erro no Vídeo', 'Não foi possível reproduzir o vídeo.', 'fa-video-slash');
        });
        
        // Iniciar reprodução
        vslVideo.play().catch(error => {
            console.error('❌ Erro ao reproduzir vídeo:', error);
            showErrorScreen('Erro de Reprodução', 'Não foi possível reproduzir o vídeo automaticamente.', 'fa-play-circle');
        });
    }
    
    // Verificar se já está na chamada ou encerrada
    const isInCall = localStorage.getItem('googleMeetInCall');
    const isEnded = localStorage.getItem('googleMeetEnded');
    
    if (isEnded === 'true') {
        console.log('🔄 Chamada foi encerrada - mostrando tela de encerramento');
        showEndedScreen();
    } else if (isInCall === 'true') {
        console.log('🔄 Usuário já estava na chamada - restaurando...');
        showCallScreen();
        startCall();
    } else {
        console.log('🆕 Primeira vez - mostrando tela de nome');
        showNameScreen();
    }
}

// Função para tentar autoplay
function attemptAutoplay() {
    console.log('=== TENTANDO AUTOPLAY ===');
    
    // Garantir que o vídeo não está mutado
    vslVideo.muted = false;
    vslVideo.volume = 1.0;
    
    const playPromise = vslVideo.play();
    
    if (playPromise !== undefined) {
        playPromise.then(function() {
            console.log('✅ AUTOPLAY SUCESSO!');
            console.log('🔊 Volume:', vslVideo.volume);
            console.log('🔇 Muted:', vslVideo.muted);
        }).catch(function(error) {
            console.error('❌ AUTOPLAY FALHOU:', error);
            // Se falhar por causa do som, tentar sem som
            if (error.name === 'NotAllowedError') {
                console.log('🔄 Tentando reproduzir sem som...');
                vslVideo.muted = true;
                vslVideo.play().then(function() {
                    console.log('✅ AUTOPLAY SEM SOM SUCESSO!');
                }).catch(function(muteError) {
                    console.error('❌ AUTOPLAY SEM SOM TAMBÉM FALHOU:', muteError);
                });
            }
        });
    }
}

// Função para iniciar webcam
async function startWebcam() {
    try {
        console.log('=== INICIANDO WEBCAM ===');
        
        webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: 'user'
            }, 
            audio: false 
        });
        
        console.log('✅ Stream de webcam obtido com sucesso');
        
        webcamVideo.srcObject = webcamStream;
        webcamVideo.style.display = 'block';
        userVideoPlaceholder.style.display = 'none';
        
        isWebcamActive = true;
        isVideoOn = true;
        
        // Atualizar o botão de vídeo
        updateVideoButton();
        
        console.log('✅ Webcam ativada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao acessar a webcam:', error);
        alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
}

// Função para parar webcam
function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    
    webcamVideo.srcObject = null;
    webcamVideo.style.display = 'none';
    userVideoPlaceholder.style.display = 'flex';
    
    isWebcamActive = false;
    isVideoOn = false;
    
    // Atualizar o botão de vídeo
    updateVideoButton();
    
    console.log('Webcam desativada');
}

// Inicializar tela de chamada
function initializeCallScreen() {
    // Botão de mudo
    muteBtn.addEventListener('click', function() {
        isMuted = !isMuted;
        updateMuteButton();
        console.log('Microfone:', isMuted ? 'Mutado' : 'Ativado');
    });

    // Botão de vídeo
    videoBtn.addEventListener('click', function() {
        if (isWebcamActive) {
            stopWebcam();
        } else {
            startWebcam();
        }
    });

    // Botão de encerrar chamada
    endCallBtn.addEventListener('click', function() {
        if (confirm('Deseja realmente encerrar a chamada?')) {
            endCall();
        }
    });

    // Inicializar estados dos botões
    updateMuteButton();
    updateVideoButton();
}

// Função para encerrar chamada
function endCall() {
    console.log('=== ENCERRANDO CHAMADA ===');
    
    // Limpar localStorage e marcar como encerrada
    localStorage.removeItem('googleMeetInCall');
    localStorage.setItem('googleMeetEnded', 'true');
    
    // Parar webcam
    stopWebcam();
    
    // Pausar VSL
    vslVideo.pause();
    
    // Resetar estado
    isCameraEnabled = false;
    isMicrophoneEnabled = false;
    isCallStarted = false;
    
    // Mostrar tela de encerramento
    showEndedScreen();
    
    console.log('✅ Chamada encerrada');
}

// Função para atualizar botão de mudo
function updateMuteButton() {
    if (isMuted) {
        muteBtn.classList.add('muted');
        muteBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                <path d="m23 9-6 6" stroke="currentColor" stroke-width="2"/>
                <path d="m17 9 6 6" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    } else {
        muteBtn.classList.remove('muted');
        muteBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
        `;
    }
}

// Função para atualizar botão de vídeo
function updateVideoButton() {
    if (isVideoOn && isWebcamActive) {
        // Vídeo ligado
        videoBtn.classList.remove('disabled');
        videoBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12m-3.2 0a3.2 3.2 0 1 1 6.4 0a3.2 3.2 0 1 1 -6.4 0"/>
                <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            </svg>
        `;
    } else {
        // Vídeo desligado
        videoBtn.classList.add('disabled');
        videoBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12m-3.2 0a3.2 3.2 0 1 1 6.4 0a3.2 3.2 0 1 1 -6.4 0"/>
                <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                <path d="m1 1 22 22" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    }
}

// Inicializar chat
function initializeChat() {
    let isChatOpen = false;
    let chatMessages = [];

    // Botão de chat
    chatBtn.addEventListener('click', function() {
        toggleChat();
    });

    // Fechar chat
    chatCloseBtn.addEventListener('click', function() {
        closeChat();
    });

    // Enviar mensagem
    chatSendBtn.addEventListener('click', function() {
        sendMessage();
    });

    // Enter para enviar
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function toggleChat() {
        if (isChatOpen) {
            closeChat();
        } else {
            openChat();
        }
    }

    function openChat() {
        isChatOpen = true;
        chatPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            chatInput.focus();
        }, 300);
        
        console.log('Chat aberto');
    }

    function closeChat() {
        isChatOpen = false;
        chatPopup.classList.remove('active');
        document.body.style.overflow = '';
        
        console.log('Chat fechado');
    }

    function sendMessage() {
        const messageText = chatInput.value.trim();
        
        if (messageText === '') {
            return;
        }
        
        // Criar mensagem
        const message = {
            id: Date.now(),
            text: messageText,
            timestamp: new Date(),
            own: true
        };
        
        // Adicionar à lista
        chatMessages.push(message);
        
        // Exibir mensagem
        displayMessage(message);
        
        // Limpar input
        chatInput.value = '';
        
        // Simular resposta
        setTimeout(() => {
            simulateResponse();
        }, 1000);
        
        console.log('Mensagem enviada:', messageText);
    }

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.own ? 'own' : ''}`;
        messageElement.textContent = message.text;
        
        chatMessages.appendChild(messageElement);
        
        // Scroll para baixo
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function simulateResponse() {
        const responses = [
            'Mensagem recebida!',
            'Obrigado pela mensagem.',
            'Entendi.',
            'Perfeito!',
            'Certo, vou verificar isso.'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMessage = {
            id: Date.now(),
            text: randomResponse,
            timestamp: new Date(),
            own: false
        };
        
        chatMessages.push(responseMessage);
        displayMessage(responseMessage);
    }
}

// Suporte a teclado
document.addEventListener('keydown', function(event) {
    switch(event.code) {
        case 'KeyM':
            // Tecla M para mudo
            if (currentScreen === 'call') {
                isMuted = !isMuted;
                vslVideo.muted = isMuted;
                updateMuteButton();
            }
            break;
        case 'KeyV':
            // Tecla V para vídeo
            if (currentScreen === 'call') {
                if (isWebcamActive) {
                    stopWebcam();
                } else {
                    startWebcam();
                }
            }
            break;
        case 'Escape':
            // ESC para fechar chat
            if (chatPopup.classList.contains('active')) {
                chatPopup.classList.remove('active');
                document.body.style.overflow = '';
            }
            break;
    }
});

// Função para encerrar chamada e deletar reunião
async function endCallAndDeleteMeeting() {
    console.log('🔚 Encerrando chamada e deletando reunião...');
    
    try {
        // Primeiro, marcar a reunião como encerrada
        const endResponse = await fetch(`/api/meetings/${meetingId}/end-video`, {
            method: 'POST'
        });
        
        if (endResponse.ok) {
            console.log('✅ Reunião marcada como encerrada');
        } else {
            console.error('❌ Erro ao encerrar reunião:', await endResponse.text());
        }
        
        // Mostrar tela de encerramento
        showEndedScreen();
        
        // Limpar localStorage
        localStorage.removeItem('googleMeetInCall');
        localStorage.setItem('googleMeetEnded', 'true');
        
    } catch (error) {
        console.error('❌ Erro ao encerrar reunião:', error);
        showErrorScreen('Erro', 'Erro ao encerrar a reunião.', 'fa-exclamation-circle');
    }
}

// Função para extrair ID do YouTube
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

console.log('Google Meet Clone inicializado com sucesso!'); 