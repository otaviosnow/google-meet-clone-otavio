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

// Variável global para controlar se é demonstração
let isDemoMode = false;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO GOOGLE MEET CLONE - CALLX ===');
    
    // Tratar erros de extensões do navegador
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('Receiving end does not exist')) {
            console.warn('⚠️ Erro de extensão do navegador detectado - ignorando:', e.message);
            return false; // Prevenir que o erro apareça no console
        }
    });
    
    // Obter dados da reunião da URL
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get('demo');
    
    // Extrair meetingId da URL (formato: /meet/meetingId)
    const pathSegments = window.location.pathname.split('/');
    const meetingIdFromUrl = pathSegments[pathSegments.length - 1];
    
    // Verificar se é modo demonstração
    isDemoMode = demoParam === 'true';
    
    console.log('🔍 Parâmetros da URL:', {
        meetingIdFromUrl,
        demoParam,
        isDemoMode,
        fullUrl: window.location.href,
        pathSegments: pathSegments
    });
    
    if (meetingIdFromUrl && meetingIdFromUrl !== 'meet') {
        meetingId = meetingIdFromUrl;
        meetingIdElement.textContent = meetingId;
        console.log('✅ Meeting ID extraído da URL:', meetingId);
    } else {
        console.log('❌ Meeting ID não encontrado na URL');
    }
    
    // Se for demonstração, sempre mostrar tela de nome (não usar cache)
    if (isDemoMode) {
        console.log('🎭 MODO DEMONSTRAÇÃO - Sempre mostrar tela de nome');
        showNameScreen();
    } else {
        // Verificar se já está na chamada ou encerrada (específico para esta reunião)
        const isInCall = localStorage.getItem(`googleMeetInCall_${meetingId}`);
        const isEnded = localStorage.getItem(`googleMeetEnded_${meetingId}`);
        
        if (isEnded === 'true') {
            console.log('🔄 Chamada foi encerrada - mostrando tela de encerramento');
            showEndedScreen();
        } else if (isInCall === 'true') {
            console.log('🔄 Usuário já estava na chamada - restaurando...');
            showCallScreen();
            // Buscar vídeo da reunião via API
            loadMeetingVideo();
        } else {
            console.log('🆕 Primeira vez - mostrando tela de nome');
            showNameScreen();
        }
    }
    
    // Gerar ID da reunião se não vier da URL
    if (!meetingIdFromUrl || meetingIdFromUrl === 'meet') {
        generateMeetingId();
    }
    
    // Inicializar componentes
    initializeNameScreen();
    initializeDeviceScreen();
    initializeCallScreen();
    initializeChat();
    initializeEndedScreen();
});

// Função para gerar ID da reunião
function generateMeetingId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let id = '';
    for (let i = 0; i < 3; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    id += '-';
    for (let i = 0; i < 3; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    id += '-';
    for (let i = 0; i < 3; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    
    meetingId = id;
    meetingIdElement.textContent = id;
    console.log('ID da reunião gerado:', id);
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
    
    // Verificar se a câmera foi ativada anteriormente
    const cameraWasEnabled = localStorage.getItem('cameraEnabled') === 'true';
    if (cameraWasEnabled) {
        console.log('📹 Câmera foi ativada anteriormente - marcando como ativa');
        isCameraEnabled = true;
        cameraBtn.classList.add('active');
        cameraBtn.classList.remove('disabled');
    }
    
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
    
    // Se for demonstração, mostrar botão de reiniciar
    const restartDemoBtn = document.getElementById('restartDemoBtn');
    if (restartDemoBtn) {
        if (isDemoMode) {
            restartDemoBtn.style.display = 'inline-block';
            console.log('🎭 MODO DEMONSTRAÇÃO - Botão de reiniciar visível');
        } else {
            restartDemoBtn.style.display = 'none';
        }
    }
    
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
        
        // Salvar que a câmera foi ativada para usar na próxima tela
        localStorage.setItem('cameraEnabled', 'true');
        
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
    
    // Se for demonstração, não salvar no cache
    if (isDemoMode) {
        console.log('🎭 MODO DEMONSTRAÇÃO - Não salvando no cache');
    } else {
        // Salvar no localStorage específico da reunião
        localStorage.setItem(`googleMeetInCall_${meetingId}`, 'true');
        localStorage.removeItem(`googleMeetEnded_${meetingId}`);
    }
    
    // Mostrar tela de chamada
    showCallScreen();
    
    // Carregar vídeo da reunião via API
    if (!isDemoMode && meetingId) {
        loadMeetingVideo();
    } else {
        // Para demonstração ou sem meeting ID, usar vídeo padrão
        startCall();
    }
    
    console.log('✅ Usuário entrou na chamada');
}

// Função para carregar o vídeo da reunião via API
async function loadMeetingVideo() {
    if (!meetingId) {
        console.error('❌ Meeting ID não encontrado');
        return;
    }
    
    try {
        console.log('🔍 [VIDEO] Buscando dados da reunião:', meetingId);
        
        const response = await fetch(`/api/meetings/${meetingId}`);
        
        if (!response.ok) {
            console.error('❌ [VIDEO] Erro ao buscar reunião:', response.status);
            return;
        }
        
        const data = await response.json();
        console.log('✅ [VIDEO] Dados da reunião obtidos:', data);
        
        if (data.meeting && data.meeting.video) {
            const videoUrl = data.meeting.video.url;
            console.log('🎬 [VIDEO] URL do vídeo encontrada:', videoUrl);
            startCall(videoUrl);
        } else {
            console.warn('⚠️ [VIDEO] Nenhum vídeo encontrado na reunião');
            startCall(); // Usar vídeo padrão
        }
        
    } catch (error) {
        console.error('❌ [VIDEO] Erro ao carregar vídeo da reunião:', error);
        startCall(); // Usar vídeo padrão em caso de erro
    }
}

// Função para iniciar a chamada
function startCall(videoUrl = null) {
    console.log('=== INICIANDO CHAMADA ===');
    
    // Iniciar webcam automaticamente se estava ativa na tela anterior
    if (isCameraEnabled) {
        console.log('📹 Iniciando webcam automaticamente...');
        startWebcam();
    }
    
    // Iniciar VSL automaticamente
    console.log('🎬 Iniciando VSL automaticamente...');
    startVSL(videoUrl);
    
    isCallStarted = true;
    
    console.log('✅ Chamada iniciada com sucesso!');
}

// Função para iniciar VSL
function startVSL(videoUrl = null) {
    console.log('=== INICIANDO VSL ===');
    
    // Mostrar o vídeo
    vslVideo.style.display = 'block';
    vslVideo.style.width = '100%';
    vslVideo.style.height = '100%';
    vslVideo.style.objectFit = 'cover';
    
    // Configurar o vídeo VSL
    vslVideo.loop = false; // Não repetir
    vslVideo.muted = false; // Com som
    vslVideo.volume = 1.0; // Volume máximo
    
    // Definir fonte do vídeo
    if (videoUrl && videoUrl.trim() !== '') {
        console.log('🎬 Carregando vídeo da URL:', videoUrl);
        vslVideo.src = videoUrl;
    } else {
        console.log('🎬 Usando vídeo padrão');
        // Usar um vídeo de exemplo que existe ou criar um placeholder
        vslVideo.src = '/uploads/default-video.mp4';
        
        // Se o vídeo padrão não existir, criar um vídeo placeholder
        vslVideo.addEventListener('error', function(e) {
            console.warn('⚠️ Vídeo padrão não encontrado, criando placeholder...');
            createVideoPlaceholder();
        });
    }
    
    vslVideo.addEventListener('loadstart', function() {
        console.log('🔄 VSL: Iniciando carregamento');
    });
    
    vslVideo.addEventListener('loadedmetadata', function() {
        console.log('📊 VSL: Metadados carregados');
        console.log('⏱️ Duração do vídeo:', vslVideo.duration, 'segundos');
        
        // Notificar o backend sobre a duração do vídeo
        notifyVideoDuration(vslVideo.duration);
        
        // Restaurar posição salva do vídeo
        restoreVideoPosition();
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
        endCall();
    });
    
    // Salvar posição do vídeo periodicamente
    setInterval(function() {
        if (!vslVideo.paused && !vslVideo.ended && vslVideo.currentTime > 0) {
            saveVideoPosition();
        }
    }, 1000); // Salvar a cada segundo
    
    // Tentar reproduzir automaticamente
    setTimeout(function() {
        attemptAutoplay();
    }, 500);
}

// Função para criar um vídeo placeholder quando não há vídeo disponível
function createVideoPlaceholder() {
    console.log('🎬 Criando vídeo placeholder...');
    
    // Criar um canvas com texto
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    
    // Fundo escuro
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texto central
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Vídeo não disponível', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '16px Arial';
    ctx.fillText('Adicione um vídeo para começar', canvas.width / 2, canvas.height / 2 + 20);
    
    // Converter canvas para blob e criar URL
    canvas.toBlob(function(blob) {
        const videoUrl = URL.createObjectURL(blob);
        vslVideo.src = videoUrl;
        
        // Configurar o vídeo placeholder
        vslVideo.loop = true;
        vslVideo.muted = true;
        vslVideo.volume = 0;
        
        console.log('✅ Vídeo placeholder criado com sucesso');
        
        // Tentar reproduzir o placeholder
        setTimeout(function() {
            vslVideo.play().then(function() {
                console.log('✅ Placeholder reproduzindo com sucesso');
            }).catch(function(error) {
                console.warn('⚠️ Erro ao reproduzir placeholder:', error);
            });
        }, 100);
    }, 'image/png');
}

// Função para notificar o backend sobre a duração do vídeo
async function notifyVideoDuration(duration) {
    if (!meetingId) {
        console.log('❌ Meeting ID não encontrado, não é possível notificar duração');
        return;
    }
    
    try {
        console.log('📡 Notificando backend sobre duração do vídeo:', duration, 'segundos');
        
        const response = await fetch(`/api/meetings/${meetingId}/video-duration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                duration: duration,
                durationMs: Math.round(duration * 1000) // Converter para milissegundos
            })
        });
        
        if (response.ok) {
            console.log('✅ Duração do vídeo notificada com sucesso');
        } else {
            console.warn('⚠️ Erro ao notificar duração do vídeo:', response.status);
        }
    } catch (error) {
        console.error('❌ Erro ao notificar duração do vídeo:', error);
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
async function endCall() {
    console.log('=== ENCERRANDO CHAMADA ===');
    
    // Notificar o backend que a reunião foi encerrada
    if (meetingId) {
        try {
            console.log('🔗 Notificando backend sobre encerramento da reunião:', meetingId);
            
            const response = await fetch(`/api/meetings/${meetingId}/end-video`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('✅ Backend notificado sobre encerramento da reunião');
            } else {
                console.warn('⚠️ Erro ao notificar backend sobre encerramento:', response.status);
            }
        } catch (error) {
            console.error('❌ Erro ao notificar backend sobre encerramento:', error);
        }
    }
    
    // Se for demonstração, não salvar no cache - permitir reiniciar
    if (isDemoMode) {
        console.log('🎭 MODO DEMONSTRAÇÃO - Não salvando no cache, permitindo reiniciar');
        // Limpar qualquer cache existente para garantir que sempre volte para tela de nome
        localStorage.removeItem('googleMeetInCall');
        localStorage.removeItem('googleMeetEnded');
        localStorage.removeItem('videoPosition');
        localStorage.removeItem('videoLastUpdate');
        localStorage.removeItem('cameraEnabled');
    } else {
        // Para reuniões reais, salvar no cache específico da reunião
        localStorage.removeItem(`googleMeetInCall_${meetingId}`);
        localStorage.setItem(`googleMeetEnded_${meetingId}`, 'true');
        
        // Limpar posição do vídeo quando a chamada terminar
        localStorage.removeItem('videoPosition');
        localStorage.removeItem('videoLastUpdate');
        localStorage.removeItem('cameraEnabled');
    }
    
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

    // Botão de chat
    chatBtn.addEventListener('click', function() {
        toggleChat();
    });

    // Fechar chat
    chatCloseBtn.addEventListener('click', function() {
        closeChat();
    });

    // Enviar mensagem - múltiplos eventos para garantir
    if (chatSendBtn) {
        console.log('✅ Botão de enviar encontrado:', chatSendBtn);
        
        chatSendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔵 Botão de enviar clicado!');
            sendMessage();
        });
        
        chatSendBtn.addEventListener('mousedown', function(e) {
            e.preventDefault();
            console.log('🔵 Botão de enviar pressionado!');
            sendMessage();
        });
    } else {
        console.error('❌ Botão de enviar não encontrado!');
    }

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
        console.log('📤 Função sendMessage chamada');
        const messageText = chatInput.value.trim();
        
        console.log('📝 Texto da mensagem:', messageText);
        
        if (messageText === '') {
            console.log('❌ Mensagem vazia, não enviando');
            return;
        }
        
        // Criar mensagem
        const message = {
            id: Date.now(),
            text: messageText,
            timestamp: new Date(),
            own: true
        };
        
        // Exibir mensagem
        displayMessage(message);
        
        // Limpar input
        chatInput.value = '';
        

        
        console.log('Mensagem enviada:', messageText);
    }

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.own ? 'own' : ''}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message.text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = formatTime(message.timestamp);
        
        messageElement.appendChild(messageContent);
        messageElement.appendChild(messageTime);
        
        chatMessages.appendChild(messageElement);
        
        // Scroll para baixo
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }



    function formatTime(date) {
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// Inicializar tela de encerramento
function initializeEndedScreen() {
    const restartDemoBtn = document.getElementById('restartDemoBtn');
    if (restartDemoBtn) {
        restartDemoBtn.addEventListener('click', function() {
            console.log('🎭 Reiniciando demonstração...');
            
            // Limpar qualquer cache existente
            localStorage.removeItem('googleMeetInCall');
            localStorage.removeItem('googleMeetEnded');
            localStorage.removeItem('videoPosition');
            localStorage.removeItem('videoLastUpdate');
            localStorage.removeItem('cameraEnabled');
            
            // Resetar variáveis de estado
            currentScreen = 'name';
            participantName = '';
            isCameraEnabled = false;
            isMicrophoneEnabled = false;
            isWebcamActive = false;
            isMuted = true;
            isVideoOn = false;
            isCallStarted = false;
            
            // Limpar campos
            if (participantNameInput) {
                participantNameInput.value = '';
            }
            
            // Mostrar tela de nome
            showNameScreen();
            
            console.log('✅ Demonstração reiniciada com sucesso');
        });
    }
}

// Função para salvar a posição atual do vídeo
function saveVideoPosition() {
    if (vslVideo && !isNaN(vslVideo.currentTime)) {
        localStorage.setItem('videoPosition', vslVideo.currentTime.toString());
        localStorage.setItem('videoLastUpdate', Date.now().toString());
        console.log('💾 Posição do vídeo salva:', vslVideo.currentTime);
    }
}

// Função para restaurar a posição do vídeo
function restoreVideoPosition() {
    const savedPosition = localStorage.getItem('videoPosition');
    const lastUpdateTime = localStorage.getItem('videoLastUpdate');
    
    if (savedPosition && vslVideo && lastUpdateTime) {
        const position = parseFloat(savedPosition);
        const lastUpdate = parseInt(lastUpdateTime);
        const currentTime = Date.now();
        
        // Só restaura se a última atualização foi há menos de 30 segundos
        // Isso evita que atualizações múltiplas restaurem posições antigas
        if (!isNaN(position) && position > 0 && (currentTime - lastUpdate) < 30000) {
            vslVideo.currentTime = position;
            console.log('🔄 Posição do vídeo restaurada:', position);
        } else {
            console.log('⏭️ Posição muito antiga, começando do início');
            localStorage.removeItem('videoPosition');
            localStorage.removeItem('videoLastUpdate');
        }
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

console.log('Google Meet Clone inicializado com sucesso!');



// Função para bloquear inspeção
function blockInspection() {
    // Bloquear F12
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
    
    // Bloquear clique direito
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
    // Bloquear seleção de texto
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
    // Bloquear arrastar elementos
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
    // Bloquear DevTools via console
    setInterval(function() {
        const devtools = /./;
        devtools.toString = function() {
            this.opened = true;
        }
        console.log('%c', devtools);
        console.clear();
    }, 1000);
    
    // Bloquear inspeção via tamanho da janela
    let devtools = { open: false, orientation: null };
    setInterval(function() {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!devtools.open) {
                devtools.open = true;
                document.body.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        background: #d32f2f;
                        color: white;
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 20px;
                    ">
                        <div>
                            <h1>🚫 Acesso Negado</h1>
                            <p>Inspeção de código não é permitida.</p>
                        </div>
                    </div>
                `;
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    console.log('🔒 Proteções contra inspeção ativadas');
}