import { useState, useEffect, useRef } from 'react';
import { analyticsService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

interface UseAudioPlayerProps {
    recursoId: number;
    matriculaId: number;
    audioUrl: string;
    onComplete?: () => void;
    heartbeatInterval?: number; // milisegundos (default: 30000)
}

interface AudioPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isLoading: boolean;
    error: string | null;
    sesionId: string;
}

/**
 * Hook personalizado para reproductor de audio con tracking automático
 * ⭐ Envía heartbeat cada 30 segundos al backend
 */
export const useAudioPlayer = ({
    recursoId,
    matriculaId,
    audioUrl,
    onComplete,
    heartbeatInterval = 30000
}: UseAudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
    const sesionIdRef = useRef<string>(uuidv4());

    const [state, setState] = useState<AudioPlayerState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isLoading: true,
        error: null,
        sesionId: sesionIdRef.current
    });

    // Crear elemento de audio
    useEffect(() => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Event listeners
        audio.addEventListener('loadedmetadata', () => {
            setState(prev => ({
                ...prev,
                duration: audio.duration,
                isLoading: false
            }));
        });

        audio.addEventListener('timeupdate', () => {
            setState(prev => ({
                ...prev,
                currentTime: audio.currentTime
            }));
        });

        audio.addEventListener('ended', () => {
            setState(prev => ({ ...prev, isPlaying: false }));
            sendHeartbeat(true); // Último heartbeat con completado=true
            onComplete?.();
        });

        audio.addEventListener('error', () => {
            setState(prev => ({
                ...prev,
                error: 'Error al cargar el audio',
                isLoading: false
            }));
        });

        return () => {
            audio.pause();
            audio.remove();
            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
            }
        };
    }, [audioUrl]);

    // ⭐ Sistema de Heartbeat
    const sendHeartbeat = async (completado = false) => {
        try {
            await analyticsService.sendAudioHeartbeat({
                matricula_id: matriculaId,
                recurso_id: recursoId,
                sesion_reproduccion: sesionIdRef.current,
                marcador_tiempo: Math.floor(audioRef.current?.currentTime || 0),
                completado,
                metadata: {
                    browser: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }
            });
            console.log('Heartbeat enviado:', Math.floor(audioRef.current?.currentTime || 0));
        } catch (error) {
            console.error('Error al enviar heartbeat:', error);
        }
    };

    // Iniciar/detener heartbeat cuando se reproduce/pausa
    useEffect(() => {
        if (state.isPlaying) {
            // Enviar heartbeat inmediatamente al iniciar
            sendHeartbeat();

            // Configurar intervalo de heartbeat
            heartbeatTimerRef.current = setInterval(() => {
                if (audioRef.current && !audioRef.current.paused) {
                    sendHeartbeat();
                }
            }, heartbeatInterval);
        } else {
            // Limpiar intervalo cuando se pausa
            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
                heartbeatTimerRef.current = null;
            }
        }

        return () => {
            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
            }
        };
    }, [state.isPlaying]);

    // Controles del reproductor
    const play = () => {
        audioRef.current?.play();
        setState(prev => ({ ...prev, isPlaying: true }));
    };

    const pause = () => {
        audioRef.current?.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
    };

    const togglePlay = () => {
        if (state.isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setState(prev => ({ ...prev, currentTime: time }));
        }
    };

    const setVolume = (volume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    };

    const skipForward = (seconds = 10) => {
        if (audioRef.current) {
            const newTime = Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration);
            seek(newTime);
        }
    };

    const skipBackward = (seconds = 10) => {
        if (audioRef.current) {
            const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
            seek(newTime);
        }
    };

    return {
        ...state,
        play,
        pause,
        togglePlay,
        seek,
        setVolume,
        skipForward,
        skipBackward,
        audioRef
    };
};
