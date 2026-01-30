import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, Clock } from 'lucide-react';
import { recursosService } from '../../services/api';

interface Modulo {
    id: number;
    numero_semana: number;
    titulo: string;
    descripcion: string;
    dias_para_desbloqueo: number;
    dias_transcurridos: number;
    dias_restantes: number;
    desbloqueado: boolean;
    fecha_desbloqueo: string;
}

interface WeekTimelineProps {
    matriculaId: number;
    programaDimension: 'ANGUSTIA' | 'CULPA';
    onWeekClick?: (semana: number) => void;
}

/**
 * Componente: Timeline de 4 Semanas
 * ⭐ Visualiza el progreso con candados/checkmarks según desbloqueo temporal
 */
export const WeekTimeline: React.FC<WeekTimelineProps> = ({
    matriculaId,
    programaDimension,
    onWeekClick
}) => {
    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Theme colors según dimensión
    const theme = programaDimension === 'ANGUSTIA' ? {
        primary: 'bg-red-500',
        secondary: 'bg-red-300',
        light: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700'
    } : {
        primary: 'bg-blue-500',
        secondary: 'bg-blue-300',
        light: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700'
    };

    useEffect(() => {
        loadModulos();
    }, [matriculaId]);

    const loadModulos = async () => {
        try {
            setIsLoading(true);
            // Obtener recursos agrupados por semana
            const allRecursos = await recursosService.getRecursosPorMatricula(matriculaId);

            // Agrupar por semana
            const semanasMap = new Map<number, Modulo>();

            allRecursos.recursos?.forEach((recurso: any) => {
                if (!semanasMap.has(recurso.numero_semana)) {
                    semanasMap.set(recurso.numero_semana, {
                        id: recurso.modulo_id || recurso.numero_semana,
                        numero_semana: recurso.numero_semana,
                        titulo: recurso.semana_titulo || `Semana ${recurso.numero_semana}`,
                        descripcion: '',
                        dias_para_desbloqueo: recurso.dias_para_desbloqueo,
                        dias_transcurridos: recurso.dias_transcurridos,
                        dias_restantes: recurso.dias_restantes,
                        desbloqueado: recurso.desbloqueado,
                        fecha_desbloqueo: recurso.fecha_desbloqueo
                    });
                }
            });

            const modulosOrdenados = Array.from(semanasMap.values()).sort(
                (a, b) => a.numero_semana - b.numero_semana
            );

            setModulos(modulosOrdenados);
        } catch (error) {
            console.error('Error al cargar módulos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-6">
            {/* Timeline Visual */}
            <div className="relative mb-8">
                {/* Línea de progreso */}
                <div className="absolute top-10 left-0 right-0 h-1 bg-slate-200 hidden md:block" />
                <div
                    className={`absolute top-10 left-0 h-1 ${theme.primary} transition-all duration-700 hidden md:block`}
                    style={{
                        width: modulos.length > 0
                            ? `${(modulos.filter(m => m.desbloqueado).length / modulos.length) * 100}%`
                            : '0%'
                    }}
                />

                {/* Pasos de semana */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {modulos.map((modulo, index) => {
                        const isDesbloqueado = modulo.desbloqueado;
                        const isProximo = !isDesbloqueado && index > 0 && modulos[index - 1]?.desbloqueado;

                        return (
                            <div
                                key={modulo.id}
                                className={`relative flex flex-col items-center cursor-pointer group transition-all ${isDesbloqueado ? 'opacity-100' : 'opacity-60'
                                    }`}
                                onClick={() => isDesbloqueado && onWeekClick?.(modulo.numero_semana)}
                            >
                                {/* Círculo de semana */}
                                <div
                                    className={`
                    relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
                    shadow-lg transition-all duration-300
                    ${isDesbloqueado
                                            ? `${theme.primary} scale-100`
                                            : isProximo
                                                ? `${theme.light} ${theme.border} border-2 scale-95`
                                                : 'bg-slate-200 scale-90'
                                        }
                    ${isDesbloqueado ? 'hover:scale-110' : ''}
                  `}
                                >
                                    {isDesbloqueado ? (
                                        <CheckCircle size={32} className="text-white" />
                                    ) : isProximo ? (
                                        <Clock size={28} className={theme.text} />
                                    ) : (
                                        <Lock size={28} className="text-slate-400" />
                                    )}
                                </div>

                                {/* Información de la semana */}
                                <div className="mt-4 text-center">
                                    <p className={`font-bold text-sm md:text-base ${isDesbloqueado ? 'text-slate-800' : 'text-slate-500'}`}>
                                        Semana {modulo.numero_semana}
                                    </p>
                                    <p className="text-xs md:text-sm text-slate-400 mt-1 line-clamp-2">
                                        {modulo.titulo}
                                    </p>

                                    {/* Estado */}
                                    {isDesbloqueado ? (
                                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                            ✓ Desbloqueada
                                        </span>
                                    ) : (
                                        <div className="mt-2">
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                                🔒 Bloqueada
                                            </span>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {modulo.dias_restantes > 0
                                                    ? `En ${modulo.dias_restantes} día${modulo.dias_restantes > 1 ? 's' : ''}`
                                                    : formatFecha(modulo.fecha_desbloqueo)
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Tooltip en hover (solo desktop) */}
                                {!isDesbloqueado && (
                                    <div className="hidden md:block absolute -bottom-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20">
                                        Se desbloqueará el {formatFecha(modulo.fecha_desbloqueo)}
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Resumen de progreso */}
            <div className={`${theme.light} ${theme.border} border-2 rounded-2xl p-4 md:p-6`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg md:text-xl text-slate-800">
                            Tu Progreso
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                            {modulos.filter(m => m.desbloqueado).length} de {modulos.length} semanas desbloqueadas
                        </p>
                    </div>
                    <div className="text-right">
                        <div className={`text-3xl md:text-4xl font-bold ${theme.text}`}>
                            {modulos.length > 0
                                ? Math.round((modulos.filter(m => m.desbloqueado).length / modulos.length) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Completado</p>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4 w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${theme.primary} transition-all duration-700`}
                        style={{
                            width: modulos.length > 0
                                ? `${(modulos.filter(m => m.desbloqueado).length / modulos.length) * 100}%`
                                : '0%'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
