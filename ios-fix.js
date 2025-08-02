// iOS Fixes for Video Playback
(function() {
    'use strict';
    
    // Detectar se é iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        console.log('iOS detectado - aplicando correções específicas');
        
        // Aguardar o DOM estar pronto
        document.addEventListener('DOMContentLoaded', function() {
            const video = document.getElementById('vslVideo');
            
            if (video) {
                // Configurações específicas para iOS
                video.setAttribute('webkit-playsinline', 'true');
                video.setAttribute('playsinline', 'true');
                video.setAttribute('x5-playsinline', 'true');
                video.setAttribute('x5-video-player-type', 'h5');
                video.setAttribute('x5-video-player-fullscreen', 'false');
                video.setAttribute('x5-video-orientation', 'portraint');
                video.setAttribute('preload', 'auto');
                
                // Remover controles nativos no iOS
                video.setAttribute('controls', 'false');
                
                // Prevenir fullscreen
                video.addEventListener('webkitbeginfullscreen', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
                
                video.addEventListener('webkitendfullscreen', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
                
                // Prevenir comportamento padrão de toque
                video.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                video.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                video.addEventListener('touchmove', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                // Tentar autoplay com interação do usuário
                document.addEventListener('touchstart', function() {
                    if (video.paused) {
                        video.play().catch(function(error) {
                            console.log('Autoplay falhou no iOS:', error);
                        });
                    }
                }, { once: true });
                
                // Tentar autoplay quando o vídeo estiver carregado
                video.addEventListener('loadeddata', function() {
                    setTimeout(function() {
                        video.play().catch(function(error) {
                            console.log('Autoplay após carregamento falhou no iOS:', error);
                        });
                    }, 100);
                });
                
                console.log('Correções iOS aplicadas ao vídeo');
            }
        });
        
        // Prevenir zoom no iOS
        document.addEventListener('gesturestart', function(e) {
            e.preventDefault();
        });
        
        document.addEventListener('gesturechange', function(e) {
            e.preventDefault();
        });
        
        document.addEventListener('gestureend', function(e) {
            e.preventDefault();
        });
        
        // Prevenir double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
})(); 