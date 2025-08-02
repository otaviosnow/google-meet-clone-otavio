// Estado da aplicação
let isMuted = true;
let isVideoOn = false;
let isWebcamActive = false;
let webcamStream = null;
let isSoundOn = false;
let isPermissionsGranted = false;
let isCallStarted = false;

// Elementos DOM
const vslVideo = document.getElementById('vslVideo');
const videoOverlay = document.getElementById('videoOverlay');
const webcamContainer = document.getElementById('webcamContainer');
const webcamVideo = document.getElementById('webcamVideo');
const webcamPlaceholder = document.getElementById('webcamPlaceholder');
const muteBtn = document.getElementById('muteBtn');
const videoBtn = document.getElementById('videoBtn');
const endCallBtn = document.getElementById('endCallBtn');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const videoControls = document.getElementById('videoControls');
const participantsBtn = document.getElementById('participantsBtn');
const permissionsModal = document.getElementById('permissionsModal');
const loadingScreen = document.getElementById('loadingScreen');
const allowPermissionsBtn = document.getElementById('allowPermissionsBtn');
const denyPermissionsBtn = document.getElementById('denyPermissionsBtn');
const meetingName = document.getElementById('meetingName');

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando Google Meet Clone...');
    
    // Gerar ID da reunião dinamicamente
    generateMeetingId();
    
    // Inicializar componentes
    initializePermissions();
    initializeVSL();
    initializeWebcam();
    initializeControls();
    initializeChat();
    initializeSoundToggle();
    initializeCustomControls();
    disableFullscreen();
    
    // Iniciar processo de permissões
    startPermissionFlow();
});

// Função para gerar ID da reunião
function generateMeetingId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let meetingId = '';
    for (let i = 0; i < 3; i++) {
        meetingId += chars[Math.floor(Math.random() * chars.length)];
    }
    meetingId += '-';
    for (let i = 0; i < 3; i++) {
        meetingId += chars[Math.floor(Math.random() * chars.length)];
    }
    meetingId += '-';
    for (let i = 0; i < 3; i++) {
        meetingId += chars[Math.floor(Math.random() * chars.length)];
    }
    
    meetingName.textContent = meetingId;
    console.log('ID da reunião gerado:', meetingId);
}

// Função para inicializar permissões
function initializePermissions() {
    allowPermissionsBtn.addEventListener('click', function() {
        requestPermissions();
    });
    
    denyPermissionsBtn.addEventListener('click', function() {
        // Mesmo negando, vamos simular que as permissões foram concedidas
        // para demonstrar a funcionalidade
        console.log('Permissões negadas pelo usuário');
        simulatePermissionsGranted();
    });
}

// Função para iniciar o fluxo de permissões
function startPermissionFlow() {
    // Mostrar modal de permissões
    permissionsModal.classList.remove('hidden');
    loadingScreen.classList.add('hidden');
    
    console.log('Solicitando permissões de câmera e microfone...');
}

// Função para solicitar permissões
async function requestPermissions() {
    try {
        console.log('Solicitando permissões...');
        
        // Mostrar loading
        permissionsModal.classList.add('hidden');
        loadingScreen.classList.remove('hidden');
        
        // Solicitar permissões de câmera e microfone
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: 'user'
            },
            audio: true
        });
        
        // Parar o stream imediatamente (só precisamos das permissões)
        stream.getTracks().forEach(track => track.stop());
        
        console.log('Permissões concedidas com sucesso!');
        isPermissionsGranted = true;
        
        // Iniciar a chamada
        startCall();
        
    } catch (error) {
        console.error('Erro ao solicitar permissões:', error);
        
        // Mesmo com erro, simular permissões concedidas para demonstração
        simulatePermissionsGranted();
    }
}

// Função para simular permissões concedidas (para demonstração)
function simulatePermissionsGranted() {
    console.log('Simulando permissões concedidas...');
    isPermissionsGranted = true;
    
    // Aguardar um pouco para mostrar o loading
    setTimeout(() => {
        startCall();
    }, 2000);
}

// Função para iniciar a chamada
function startCall() {
    console.log('Iniciando chamada...');
    
    // Esconder loading
    loadingScreen.classList.add('hidden');
    
    // Iniciar webcam automaticamente
    startWebcam();
    
    // Iniciar VSL automaticamente
    startVSL();
    
    isCallStarted = true;
    
    console.log('Chamada iniciada com sucesso!');
}

// Função para desabilitar fullscreen no vídeo VSL
function disableFullscreen() {
    // Configurações específicas para iOS
    vslVideo.setAttribute('webkit-playsinline', 'true');
    vslVideo.setAttribute('playsinline', 'true');
    vslVideo.setAttribute('x5-playsinline', 'true');
    vslVideo.setAttribute('x5-video-player-type', 'h5');
    vslVideo.setAttribute('x5-video-player-fullscreen', 'false');
    vslVideo.setAttribute('x5-video-orientation', 'portraint');
    
    // Desabilitar fullscreen via JavaScript
    vslVideo.addEventListener('dblclick', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
    // Interceptar tentativas de fullscreen
    vslVideo.addEventListener('webkitfullscreenchange', function(e) {
        if (document.webkitFullscreenElement === vslVideo) {
            document.webkitExitFullscreen();
        }
    });
    
    vslVideo.addEventListener('fullscreenchange', function(e) {
        if (document.fullscreenElement === vslVideo) {
            document.exitFullscreen();
        }
    });
    
    // Desabilitar controles de fullscreen via atributos
    vslVideo.setAttribute('controlsList', 'nodownload nofullscreen noremoteplaybook');
    vslVideo.setAttribute('disablePictureInPicture', 'true');
    
    console.log('Fullscreen desabilitado para o vídeo VSL');
}

// Função para inicializar o botão de som
function initializeSoundToggle() {
    soundToggleBtn.addEventListener('click', function() {
        toggleVideoSound();
    });
    
    // Inicializar estado do botão
    updateSoundToggleButton();
}

// Função para inicializar controles customizados
function initializeCustomControls() {
    playPauseBtn.addEventListener('click', function() {
        if (vslVideo.paused) {
            vslVideo.play();
        } else {
            vslVideo.pause();
        }
    });
    
    // Atualizar botão quando o vídeo muda de estado
    vslVideo.addEventListener('play', function() {
        playPauseBtn.classList.add('playing');
    });
    
    vslVideo.addEventListener('pause', function() {
        playPauseBtn.classList.remove('playing');
    });
    
    // Inicializar estado do botão
    if (!vslVideo.paused) {
        playPauseBtn.classList.add('playing');
    }
}

// Função para alternar o som do vídeo
function toggleVideoSound() {
    isSoundOn = !isSoundOn;
    vslVideo.muted = !isSoundOn;
    updateSoundToggleButton();
    console.log('Som do vídeo:', isSoundOn ? 'Ativado' : 'Desativado');
}

// Função para atualizar o botão de som
function updateSoundToggleButton() {
    if (isSoundOn) {
        soundToggleBtn.classList.add('sound-on');
        soundToggleBtn.classList.remove('sound-off');
        soundToggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="white" stroke-width="2" fill="none"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" stroke-width="2"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="white" stroke-width="2"/>
            </svg>
        `;
    } else {
        soundToggleBtn.classList.add('sound-off');
        soundToggleBtn.classList.remove('sound-on');
        soundToggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="white" stroke-width="2" fill="none"/>
                <path d="m23 9-6 6" stroke="white" stroke-width="2"/>
                <path d="m17 9 6 6" stroke="white" stroke-width="2"/>
            </svg>
        `;
    }
}

// Função para inicializar o VSL
function initializeVSL() {
    // Configurar o vídeo VSL
    vslVideo.addEventListener('loadeddata', function() {
        console.log('VSL carregado e pronto para reprodução');
    });

    vslVideo.addEventListener('play', function() {
        // Esconder o overlay quando o vídeo começar a tocar
        videoOverlay.classList.add('hidden');
        console.log('VSL iniciado');
    });

    vslVideo.addEventListener('pause', function() {
        // Mostrar o overlay quando o vídeo pausar
        videoOverlay.classList.remove('hidden');
        console.log('VSL pausado');
    });

    vslVideo.addEventListener('ended', function() {
        // Mostrar o overlay quando o vídeo terminar
        videoOverlay.classList.remove('hidden');
        console.log('VSL finalizado');
    });

    // Permitir clicar no overlay para iniciar o vídeo
    videoOverlay.addEventListener('click', function() {
        vslVideo.play();
    });
    
    // Prevenir comportamento padrão do vídeo no iOS
    vslVideo.addEventListener('touchstart', function(e) {
        e.preventDefault();
    });
    
    vslVideo.addEventListener('touchend', function(e) {
        e.preventDefault();
    });
}

// Função para iniciar VSL automaticamente
function startVSL() {
    console.log('=== INICIANDO VSL AUTOMATICAMENTE ===');
    console.log('Estado do vídeo antes do autoplay:');
    console.log('- Pausado:', vslVideo.paused);
    console.log('- Muted:', vslVideo.muted);
    console.log('- ReadyState:', vslVideo.readyState);
    console.log('- NetworkState:', vslVideo.networkState);
    console.log('- CurrentSrc:', vslVideo.currentSrc);
    console.log('- Duration:', vslVideo.duration);
    console.log('- Volume:', vslVideo.volume);
    
    // Verificar se o vídeo está carregado
    if (vslVideo.readyState < 2) {
        console.log('⚠️ VÍDEO AINDA NÃO CARREGADO - ReadyState:', vslVideo.readyState);
        console.log('Aguardando carregamento do vídeo...');
        
        vslVideo.addEventListener('canplay', function() {
            console.log('✅ VÍDEO CARREGADO - ReadyState:', vslVideo.readyState);
            attemptAutoplay();
        }, { once: true });
        
        vslVideo.addEventListener('error', function(e) {
            console.error('❌ ERRO NO CARREGAMENTO DO VÍDEO:', e);
            console.error('Error details:', vslVideo.error);
        });
        
        return;
    }
    
    // Tentar reproduzir automaticamente
    setTimeout(function() {
        attemptAutoplay();
    }, 500);
}

// Função para tentar autoplay com logs detalhados
function attemptAutoplay() {
    console.log('=== TENTANDO AUTOPLAY ===');
    console.log('Estado do vídeo antes do play():');
    console.log('- Pausado:', vslVideo.paused);
    console.log('- Muted:', vslVideo.muted);
    console.log('- ReadyState:', vslVideo.readyState);
    console.log('- User Agent:', navigator.userAgent);
    console.log('- É iOS:', /iPad|iPhone|iPod/.test(navigator.userAgent));
    console.log('- É Safari:', /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent));
    
    const playPromise = vslVideo.play();
    
    if (playPromise !== undefined) {
        playPromise.then(function() {
            console.log('✅ AUTOPLAY SUCESSO!');
            console.log('Estado após play():');
            console.log('- Pausado:', vslVideo.paused);
            console.log('- CurrentTime:', vslVideo.currentTime);
            console.log('- PlaybackRate:', vslVideo.playbackRate);
        }).catch(function(error) {
            console.error('❌ AUTOPLAY FALHOU:', error);
            console.error('Tipo de erro:', error.name);
            console.error('Mensagem de erro:', error.message);
            
            // Logs específicos para diferentes tipos de erro
            if (error.name === 'NotAllowedError') {
                console.error('🔒 ERRO: Autoplay bloqueado por política do navegador');
                console.error('Solução: Usuário precisa interagir com a página primeiro');
            } else if (error.name === 'NotSupportedError') {
                console.error('🔒 ERRO: Formato de vídeo não suportado');
            } else if (error.name === 'NetworkError') {
                console.error('🔒 ERRO: Problema de rede ao carregar vídeo');
            } else if (error.name === 'AbortError') {
                console.error('🔒 ERRO: Reprodução abortada');
            }
            
            // Mostrar overlay para interação manual
            console.log('📺 Mostrando overlay para interação manual');
            videoOverlay.classList.remove('hidden');
            
            // Adicionar listener para clique no overlay
            videoOverlay.addEventListener('click', function() {
                console.log('🖱️ Usuário clicou no overlay - tentando play manual');
                vslVideo.play().then(function() {
                    console.log('✅ Play manual bem-sucedido');
                }).catch(function(manualError) {
                    console.error('❌ Play manual também falhou:', manualError);
                });
            }, { once: true });
        });
    } else {
        console.log('⚠️ play() retornou undefined - navegador não suporta Promise');
        console.log('Estado após play():');
        console.log('- Pausado:', vslVideo.paused);
    }
}

// Função para inicializar a webcam
function initializeWebcam() {
    webcamContainer.addEventListener('click', function() {
        if (!isWebcamActive) {
            startWebcam();
        } else {
            stopWebcam();
        }
    });
}

// Função para iniciar a webcam
async function startWebcam() {
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: 'user'
            }, 
            audio: false 
        });
        
        webcamVideo.srcObject = webcamStream;
        webcamVideo.style.display = 'block';
        webcamPlaceholder.style.display = 'none';
        
        isWebcamActive = true;
        isVideoOn = true;
        
        // Atualizar o botão de vídeo
        updateVideoButton();
        
        console.log('Webcam ativada');
    } catch (error) {
        console.error('Erro ao acessar a webcam:', error);
        alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
}

// Função para parar a webcam
function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    
    webcamVideo.srcObject = null;
    webcamVideo.style.display = 'none';
    webcamPlaceholder.style.display = 'flex';
    
    isWebcamActive = false;
    isVideoOn = false;
    
    // Atualizar o botão de vídeo
    updateVideoButton();
    
    console.log('Webcam desativada');
}

// Função para inicializar os controles
function initializeControls() {
    // Botão de mudo - Controla o áudio do VSL
    muteBtn.addEventListener('click', function() {
        isMuted = !isMuted;
        vslVideo.muted = isMuted;
        updateMuteButton();
        console.log('Áudio VSL:', isMuted ? 'Mutado' : 'Ativado');
    });

    // Botão de vídeo
    videoBtn.addEventListener('click', function() {
        if (isWebcamActive) {
            stopWebcam();
        } else {
            startWebcam();
        }
    });

    // Botão de participantes
    participantsBtn.addEventListener('click', function() {
        alert('Lista de participantes (funcionalidade em desenvolvimento)');
        console.log('Botão de participantes clicado');
    });

    // Botão de encerrar chamada
    endCallBtn.addEventListener('click', function() {
        if (confirm('Deseja realmente encerrar a chamada?')) {
            stopWebcam();
            vslVideo.pause();
            alert('Chamada encerrada');
            console.log('Chamada encerrada');
        }
    });

    // Inicializar estados dos botões
    updateMuteButton();
    updateVideoButton();
}

// Função para atualizar o botão de mudo
function updateMuteButton() {
    if (isMuted) {
        muteBtn.classList.add('muted');
        muteBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="white" stroke-width="2" fill="none"/>
                <path d="m23 9-6 6" stroke="white" stroke-width="2"/>
                <path d="m17 9 6 6" stroke="white" stroke-width="2"/>
            </svg>
        `;
    } else {
        muteBtn.classList.remove('muted');
        muteBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="white" stroke-width="2" fill="none"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" stroke-width="2"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="white" stroke-width="2"/>
            </svg>
        `;
    }
}

// Função para atualizar o botão de vídeo
function updateVideoButton() {
    if (isVideoOn && isWebcamActive) {
        // Vídeo ligado
        videoBtn.classList.remove('disabled');
        videoBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M23 7l-7 5 7 5V7z" stroke="white" stroke-width="2" fill="none"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="white" stroke-width="2" fill="none"/>
            </svg>
        `;
    } else {
        // Vídeo desligado
        videoBtn.classList.add('disabled');
        videoBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M23 7l-7 5 7 5V7z" stroke="white" stroke-width="2" fill="none"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="white" stroke-width="2" fill="none"/>
                <path d="m1 1 22 22" stroke="white" stroke-width="2"/>
            </svg>
        `;
    }
}

// Função para atualizar o horário
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeElement = document.getElementById('meetingTime');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

// Atualizar o horário a cada minuto
setInterval(updateTime, 60000);
updateTime(); // Atualizar imediatamente

// Função para simular indicadores de rede
function updateNetworkIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        // Simular atividade de rede aleatória
        if (Math.random() > 0.3) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Atualizar indicadores de rede a cada 2 segundos
setInterval(updateNetworkIndicators, 2000);

// Função para lidar com redimensionamento da janela
window.addEventListener('resize', function() {
    // Ajustar layout se necessário
    console.log('Janela redimensionada');
});

// Função para lidar com visibilidade da página
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Página não está visível, pausar vídeo se necessário
        console.log('Página oculta');
    } else {
        // Página está visível novamente
        console.log('Página visível');
    }
});

// Adicionar suporte a teclado
document.addEventListener('keydown', function(event) {
    switch(event.code) {
        case 'KeyM':
            // Tecla M para mudo
            isMuted = !isMuted;
            vslVideo.muted = isMuted;
            updateMuteButton();
            break;
        case 'KeyV':
            // Tecla V para vídeo
            if (isWebcamActive) {
                stopWebcam();
            } else {
                startWebcam();
            }
            break;
        case 'KeyS':
            // Tecla S para som do vídeo
            toggleVideoSound();
            break;
        case 'Space':
            // Barra de espaço para play/pause do VSL
            event.preventDefault();
            if (vslVideo.paused) {
                vslVideo.play();
            } else {
                vslVideo.pause();
            }
            break;
        case 'Escape':
            // ESC para fechar chat
            if (isChatOpen) {
                closeChat();
            }
            break;
    }
});

console.log('Google Meet Clone inicializado com sucesso!');

// Chat functionality
let isChatOpen = false;
let chatMessages = [];

// Chat elements
const chatBtn = document.getElementById('chatBtn');
const chatPopup = document.getElementById('chatPopup');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatMessagesContainer = document.getElementById('chatMessages');
const allowMessagesToggle = document.getElementById('allowMessages');

// Initialize chat functionality
function initializeChat() {
    // Create overlay element
    const chatOverlay = document.createElement('div');
    chatOverlay.className = 'chat-overlay';
    chatOverlay.id = 'chatOverlay';
    document.body.appendChild(chatOverlay);

    // Chat button click
    chatBtn.addEventListener('click', function() {
        toggleChat();
    });

    // Close button click
    chatCloseBtn.addEventListener('click', function() {
        closeChat();
    });

    // Overlay click to close
    chatOverlay.addEventListener('click', function() {
        closeChat();
    });

    // Send button click
    chatSendBtn.addEventListener('click', function() {
        sendMessage();
    });

    // Enter key to send message
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Input change to enable/disable send button
    chatInput.addEventListener('input', function() {
        chatSendBtn.disabled = chatInput.value.trim() === '';
    });

    // Allow messages toggle
    allowMessagesToggle.addEventListener('change', function() {
        updateChatInputState();
    });

    // Initialize send button state
    chatSendBtn.disabled = true;
    updateChatInputState();
}

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
    document.getElementById('chatOverlay').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Focus on input after animation
    setTimeout(() => {
        chatInput.focus();
    }, 300);
    
    console.log('Chat aberto');
}

function closeChat() {
    isChatOpen = false;
    chatPopup.classList.remove('active');
    document.getElementById('chatOverlay').classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    
    console.log('Chat fechado');
}

function sendMessage() {
    const messageText = chatInput.value.trim();
    
    if (messageText === '' || !allowMessagesToggle.checked) {
        return;
    }
    
    // Create message object
    const message = {
        id: Date.now(),
        text: messageText,
        timestamp: new Date(),
        own: true
    };
    
    // Add to messages array
    chatMessages.push(message);
    
    // Display message
    displayMessage(message);
    
    // Clear input
    chatInput.value = '';
    chatSendBtn.disabled = true;
    
    // Simulate response (optional)
    setTimeout(() => {
        simulateResponse();
    }, 1000);
    
    console.log('Mensagem enviada:', messageText);
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.own ? 'own' : ''}`;
    messageElement.textContent = message.text;
    
    chatMessagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
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

function updateChatInputState() {
    const isEnabled = allowMessagesToggle.checked;
    chatInput.disabled = !isEnabled;
    chatSendBtn.disabled = !isEnabled || chatInput.value.trim() === '';
    
    if (!isEnabled) {
        chatInput.placeholder = 'Messages are disabled';
    } else {
        chatInput.placeholder = 'Send a message';
    }
}

// Handle window resize for mobile responsiveness
window.addEventListener('resize', function() {
    if (isChatOpen && window.innerWidth <= 480) {
        // Adjust chat position for mobile
        chatPopup.style.transform = 'translateY(0) scale(1)';
    }
});