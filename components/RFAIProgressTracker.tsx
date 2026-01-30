import React from 'react';
import { CicloTratamiento, ProgressState, MaterialConAcceso } from '../types';
import { CheckCircle, Lock, Play, FileText, Headphones, ClipboardCheck } from 'lucide-react';

interface RFAIProgressTrackerProps {
    ciclo: CicloTratamiento;
    onMaterialClick?: (material: MaterialConAcceso) => void;
}

export const RFAIProgressTracker: React.FC<RFAIProgressTrackerProps> = ({ ciclo, onMaterialClick }) => {
    // Theming based on dimension
    const themeColors = {
        ANGUSTIA: {
            primary: 'bg-red-500',
            secondary: 'bg-red-300',
            background: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-700',
            textLight: 'text-red-600',
            ring: 'ring-red-500',
        },
        CULPA: {
            primary: 'bg-blue-500',
            secondary: 'bg-blue-300',
            background: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-700',
            textLight: 'text-blue-600',
            ring: 'ring-blue-500',
        }
    };

    const theme = themeColors[ciclo.dimension];

    // Calculate progress state
    const sesion1 = ciclo.citas?.find(c => c.numeroSesion === '1');
    const sesion2 = ciclo.citas?.find(c => c.numeroSesion === '2');

    const progressState: ProgressState = {
        sesion1: {
            completada: sesion1?.estado === 'REALIZADO',
            fecha: sesion1?.fechaRealizada
        },
        sesion2: {
            completada: sesion2?.estado === 'REALIZADO',
            fecha: sesion2?.fechaRealizada
        },
        materialesDisponibles: ciclo.materiales?.filter(m => m.desbloqueado).length || 0,
        materialesCompletados: ciclo.materiales?.filter(m => m.completadoEn).length || 0,
        cicloCompletado: ciclo.estado === 'COMPLETADO'
    };

    const getProgressPercentage = () => {
        if (progressState.cicloCompletado) return 100;
        if (progressState.sesion2.completada) return 90;
        if (progressState.sesion1.completada) return 50;
        return 10;
    };

    const getMaterialIcon = (tipo: string) => {
        switch (tipo) {
            case 'TEST_INICIAL':
            case 'TEST_INTERMEDIO':
                return <ClipboardCheck size={20} />;
            case 'AUDIO':
                return <Headphones size={20} />;
            case 'GUIA_MANTENIMIENTO':
                return <FileText size={20} />;
            default:
                return <FileText size={20} />;
        }
    };

    const formatDate = (date?: Date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className={`${theme.background} ${theme.border} border-2 rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className={`text-xl md:text-2xl font-bold ${theme.text}`}>
                            Programa {ciclo.dimension}
                        </h2>
                        <p className="text-slate-500 text-sm md:text-base">
                            Iniciado el {formatDate(ciclo.fechaInicio)}
                        </p>
                    </div>
                    <div className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold ${progressState.cicloCompletado ? 'bg-green-100 text-green-700' : `${theme.background} ${theme.text}`}`}>
                        {progressState.cicloCompletado ? '✓ Completado' : 'En Progreso'}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-3 md:h-4 rounded-full overflow-hidden mb-2">
                    <div
                        className={`h-full ${theme.primary} transition-all duration-500 ease-out`}
                        style={{ width: `${getProgressPercentage()}%` }}
                    />
                </div>
                <p className="text-xs md:text-sm text-slate-600 text-right">{getProgressPercentage()}% completado</p>
            </div>

            {/* Timeline */}
            <div className="relative mb-8">
                {/* Progress Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200" />
                <div
                    className={`absolute top-8 left-0 h-1 ${theme.primary} transition-all duration-500`}
                    style={{ width: progressState.sesion1.completada ? (progressState.sesion2.completada ? '100%' : '50%') : '0%' }}
                />

                <div className="relative grid grid-cols-3 gap-4 md:gap-8">
                    {/* Sesión 1 */}
                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${progressState.sesion1.completada ? theme.primary : 'bg-slate-200'} flex items-center justify-center text-white shadow-lg z-10 transition-all`}>
                            {progressState.sesion1.completada ? <CheckCircle size={24} /> : <span className="text-lg md:text-2xl font-bold text-slate-500">1</span>}
                        </div>
                        <div className="mt-3 text-center">
                            <p className="font-bold text-sm md:text-base text-slate-800">Sesión 1</p>
                            <p className={`text-xs md:text-sm ${progressState.sesion1.completada ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                                {progressState.sesion1.completada ? `✓ ${formatDate(progressState.sesion1.fecha)}` : 'Pendiente'}
                            </p>
                        </div>
                    </div>

                    {/* Materiales */}
                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${progressState.sesion1.completada ? theme.secondary : 'bg-slate-200'} flex items-center justify-center shadow-lg z-10 transition-all`}>
                            {progressState.sesion1.completada ? (
                                <Headphones size={24} className={theme.textLight} />
                            ) : (
                                <Lock size={24} className="text-slate-400" />
                            )}
                        </div>
                        <div className="mt-3 text-center">
                            <p className="font-bold text-sm md:text-base text-slate-800">Materiales</p>
                            <p className="text-xs md:text-sm text-slate-500">
                                {progressState.materialesDisponibles} disponibles
                            </p>
                        </div>
                    </div>

                    {/* Sesión 2 */}
                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${progressState.sesion2.completada ? theme.primary : 'bg-slate-200'} flex items-center justify-center text-white shadow-lg z-10 transition-all`}>
                            {progressState.sesion2.completada ? <CheckCircle size={24} /> : <span className="text-lg md:text-2xl font-bold text-slate-500">2</span>}
                        </div>
                        <div className="mt-3 text-center">
                            <p className="font-bold text-sm md:text-base text-slate-800">Sesión 2</p>
                            <p className={`text-xs md:text-sm ${progressState.sesion2.completada ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                                {progressState.sesion2.completada ? `✓ ${formatDate(progressState.sesion2.fecha)}` : 'Pendiente'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Materials Grid */}
            <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">Tus Materiales</h3>

                {ciclo.materiales?.map((material) => {
                    const isLocked = !material.desbloqueado;
                    const isCompleted = !!material.completadoEn;

                    return (
                        <div
                            key={material.id}
                            className={`p-4 md:p-5 rounded-2xl border-2 transition-all ${isLocked
                                    ? 'bg-slate-50 border-slate-200 opacity-60'
                                    : `bg-white ${theme.border} hover:shadow-lg cursor-pointer`
                                }`}
                            onClick={() => !isLocked && onMaterialClick?.(material)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 ${isLocked ? 'bg-slate-200 text-slate-400' : `${theme.background} ${theme.text}`
                                    }`}>
                                    {isLocked ? <Lock size={24} /> : getMaterialIcon(material.tipo)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 pr-2">
                                            <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{material.titulo}</h4>
                                            <p className="text-xs md:text-sm text-slate-500 mt-1">{material.descripcion}</p>
                                        </div>

                                        {isCompleted && (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full shrink-0">
                                                ✓ Completado
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    {!isLocked && !isCompleted && (
                                        <button className={`mt-2 px-4 py-2 rounded-xl text-sm font-bold text-white ${theme.primary} hover:opacity-90 active:scale-95 transition-all flex items-center gap-2`}>
                                            <Play size={16} />
                                            {material.tipo === 'AUDIO' ? 'Reproducir' : 'Iniciar'}
                                        </button>
                                    )}

                                    {isLocked && (
                                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                            <Lock size={12} />
                                            Se desbloqueará {material.prerequisito === 'SESION_1' ? 'tras Sesión 1' : material.prerequisito === 'SESION_2' ? 'tras Sesión 2' : 'automáticamente'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar for Materials */}
                            {material.progresoPorcentaje !== undefined && material.progresoPorcentaje > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                                        <span>Progreso</span>
                                        <span className="font-bold">{material.progresoPorcentaje}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${theme.primary} transition-all`}
                                            style={{ width: `${material.progresoPorcentaje}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
