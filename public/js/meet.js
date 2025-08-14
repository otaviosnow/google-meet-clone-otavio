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
            const data = await response.json();
            meetingData = data.meeting;
            
            console.log('📊 Dados completos da reunião:', meetingData);
            console.log('🎬 Dados do vídeo:', meetingData.video);
            
            // Atualizar ID da reunião na interface
            meetingIdElement.textContent = meetingData.meetingId;
            
            // Registrar entrada na reunião
            await registerMeetingJoin();
            
            console.log('✅ Dados da reunião carregados:', meetingData);
            
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
            
        } else {
            const errorData = await response.json();
            console.error('❌ Erro ao acessar reunião:', errorData);
            
            if (response.status === 403) {
                showErrorScreen(errorData.error || 'Esta reunião já está sendo utilizada por outra pessoa. Não é possível utilizar o mesmo link para mais pessoas.');
            } else if (response.status === 404) {
                showErrorScreen('Reunião não encontrada');
            } else {
                showErrorScreen(errorData.error || 'Erro ao acessar reunião');
            }
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
function showErrorScreen(message) {
    // Verificar se é erro de acesso negado
    const isAccessDenied = message.includes('já está sendo utilizada por outra pessoa');
    
    document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
        ">
            <div style="
                text-align: center;
                padding: 40px;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
                border-radius: 16px;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                max-width: 500px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: ${isAccessDenied ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #ea4335, #d93025)'};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    color: white;
                    font-size: 32px;
                    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
                ">
                    <i class="fas fa-${isAccessDenied ? 'users-slash' : 'exclamation-triangle'}"></i>
                </div>
                <h1 style="
                    font-size: 28px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: #e8eaed;
                ">${isAccessDenied ? 'Acesso Negado' : 'Erro'}</h1>
                <p style="
                    color: #9ca3af;
                    margin-bottom: 32px;
                    line-height: 1.6;
                    font-size: 16px;
                ">${message}</p>
                <a href="/" style="
                    display: inline-block;
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
                ">Voltar ao Início</a>
            </div>
        </div>
    `;
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
    console.log('=== INICIANDO VSL ===');
    console.log('📋 MeetingData:', meetingData);
    console.log('🎬 Video data:', meetingData?.video);
    
    if (!meetingData || !meetingData.video) {
        console.error('❌ Dados da reunião não encontrados');
        console.error('❌ MeetingData:', meetingData);
        console.error('❌ Video:', meetingData?.video);
        return;
    }
    
    // Construir URL completa do vídeo
    let videoUrl = meetingData.video.url;
    
    // Se é um upload local, adicionar o domínio
    if (videoUrl.startsWith('/uploads/')) {
        videoUrl = window.location.origin + videoUrl;
    }
    
    console.log('🎬 URL original:', meetingData.video.url);
    console.log('🎬 URL completa:', videoUrl);
    
    // Verificar se é YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = extractYouTubeId(videoUrl);
        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
            console.log('🎬 Usando iframe para YouTube:', embedUrl);
            
            // Esconder vídeo e mostrar iframe
            vslVideo.style.display = 'none';
            vslIframe.style.display = 'block';
            vslIframe.src = embedUrl;
            
            // Não tentar autoplay no vídeo
            return;
        }
    }
    
    // Para vídeos normais, usar elemento video
    console.log('🎬 Usando elemento video para arquivo local');
    vslVideo.style.display = 'block';
    vslIframe.style.display = 'none';
    
    // Configurar o vídeo VSL
    vslVideo.src = videoUrl;
    vslVideo.loop = false; // Não repetir
    vslVideo.muted = false; // Com som
    vslVideo.volume = 1.0; // Volume máximo
    
    vslVideo.addEventListener('loadstart', function() {
        console.log('🔄 VSL: Iniciando carregamento');
    });
    
    vslVideo.addEventListener('loadedmetadata', function() {
        console.log('📊 VSL: Metadados carregados');
    });

    vslVideo.addEventListener('canplay', function() {
        console.log('▶️ VSL: Pode começar a reproduzir');
    });
    
    vslVideo.addEventListener('play', function() {
        console.log('▶️ VSL: Reprodução iniciada');
    });

    vslVideo.addEventListener('error', function(e) {
        console.error('❌ VSL: Erro durante carregamento/reprodução:', e);
    });
    
    // Listener para quando o vídeo termina
    vslVideo.addEventListener('ended', function() {
        console.log('🎬 VSL: Vídeo terminou - encerrando chamada automaticamente');
        endCallAndDeleteMeeting();
    });
    
    // Tentar reproduzir automaticamente
    setTimeout(function() {
        attemptAutoplay();
    }, 500);
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
    console.log('=== ENCERRANDO CHAMADA E DELETANDO REUNIÃO ===');
    
    // Salvar no localStorage
    localStorage.setItem('googleMeetEnded', 'true');
    localStorage.removeItem('googleMeetInCall');
    
    // Parar webcam se estiver ativa
    if (isWebcamActive) {
        stopWebcam();
    }
    
    // Parar vídeo VSL
    if (vslVideo) {
        vslVideo.pause();
        vslVideo.src = '';
    }
    
    // Parar iframe se estiver ativo
    if (vslIframe) {
        vslIframe.src = '';
    }
    
    // Marcar reunião como encerrada e depois deletar
    if (meetingId && meetingId !== 'demo') {
        try {
            console.log('🔴 Marcando reunião como encerrada:', meetingId);
            
            // Primeiro, marcar como encerrada
            const endResponse = await fetch(`/api/meetings/${meetingId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (endResponse.ok) {
                console.log('✅ Reunião marcada como encerrada');
            } else {
                console.error('❌ Erro ao marcar reunião como encerrada:', endResponse.status);
            }
            
            // Depois, deletar a reunião
            console.log('🗑️ Deletando reunião:', meetingId);
            
            const deleteResponse = await fetch(`/api/meetings/${meetingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (deleteResponse.ok) {
                console.log('✅ Reunião deletada com sucesso');
            } else {
                console.error('❌ Erro ao deletar reunião:', deleteResponse.status);
            }
        } catch (error) {
            console.error('❌ Erro ao processar reunião:', error);
        }
    }
    
    // Mostrar tela de encerramento
    showEndedScreen();
    
    console.log('✅ Chamada encerrada e reunião deletada');
}

// Função para extrair ID do YouTube
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

console.log('Google Meet Clone inicializado com sucesso!'); 