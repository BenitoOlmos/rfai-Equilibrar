import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Loader } from 'lucide-react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface AudioPlayerProps {
    recursoId: number;
    matriculaId: number;
    audioUrl: string;
    titulo: string;
    dimension: 'ANGUSTIA' | 'CULPA';
    onComplete?: () => void;
}

/**
 * Componente: Reproductor de Audio
 * ⭐ Integra useAudioPlayer hook con heartbeat automático
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    recursoId,
    matriculaId,
    audioUrl,
    titulo,
    dimension,
    onComplete
}) => {
    const {
        isPlaying,
        currentTime,
        duration,
        isLoading,
        error,
        togglePlay,
        seek,
        skipForward,
        skipBackward,
        setVolume
    } = useAudioPlayer({
        recursoId,
        matriculaId,
        audioUrl,
        onComplete
    });

    const [volume, setVolumeState] = useState(1);
    const [showHeartbeat, setShowHeartbeat] = useState(false);

    // Theme colors
    const theme = dimension === 'ANGUSTIA' ? {
        primary: 'bg-red-500',
        hover: 'hover:bg-red-600',
        light: 'bg-red-50',
        text: 'text-red-600'
    } : {
        primary: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        light: 'bg-blue-50',
        text: 'text-blue-600'
    };

    // Mostrar indicador de heartbeat cada 30s cuando está reproduciendo
    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setShowHeartbeat(true);
                setTimeout(() => setShowHeartbeat(false), 1000);
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [isPlaying]);

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolumeState(newVolume);
        setVolume(newVolume);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        seek(newTime);
    };

    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
                <p className="text-red-500 text-sm mt-2">Verifica tu conexión e intenta nuevamente</p>
            </div>
        );
    }

    return (
        <div className={`${theme.light} border-2 ${dimension === 'ANGUSTIA' ? 'border-red-200' : 'border-blue-200'} rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800">{titulo}</h3>
                    <p className="text-sm text-slate-500 mt-1">Audio de Reprogramación</p>
                </div>

                {/* Indicador de heartbeat */}
                {showHeartbeat && (
                    <div className="flex items-center gap-2 text-xs text-green-600 font-semibold animate-pulse">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        Guardando progreso...
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={isLoading}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                        background: `linear-gradient(to right, ${dimension === 'ANGUSTIA' ? '#EF4444' : '#3B82F6'} 0%, ${dimension === 'ANGUSTIA' ? '#EF4444' : '#3B82F6'} ${(currentTime / duration) * 100}%, #E2E8F0 ${(currentTime / duration) * 100}%, #E2E8F0 100%)`
                    }}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-6">
                {/* Skip Backward */}
                <button
                    onClick={() => skipBackward(10)}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-50"
                    title="Retroceder 10s"
                >
                    <SkipBack size={20} className="text-slate-700" />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${theme.primary} ${theme.hover} flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50`}
                >
                    {isLoading ? (
                        <Loader size={32} className="text-white animate-spin" />
                    ) : isPlaying ? (
                        <Pause size={32} className="text-white" fill="white" />
                    ) : (
                        <Play size={32} className="text-white ml-1" fill="white" />
                    )}
                </button>

                {/* Skip Forward */}
                <button
                    onClick={() => skipForward(10)}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-50"
                    title="Avanzar 10s"
                >
                    <SkipForward size={20} className="text-slate-700" />
                </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
                <Volume2 size={20} className="text-slate-600" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, ${dimension === 'ANGUSTIA' ? '#EF4444' : '#3B82F6'} 0%, ${dimension === 'ANGUSTIA' ? '#EF4444' : '#3B82F6'} ${volume * 100}%, #E2E8F0 ${volume * 100}%, #E2E8F0 100%)`
                    }}
                />
                <span className="text-xs text-slate-500 w-10 text-right">{Math.round(volume * 100)}%</span>
            </div>

            {/* Info footer */}
            <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>⏺ Tus escuchas se registran automáticamente</span>
                    <span className={`font-semibold ${isPlaying ? theme.text : 'text-slate-400'}`}>
                        {isPlaying ? '▶ Reproduciendo' : '⏸ Pausado'}
                    </span>
                </div>
            </div>
        </div>
    );
};
