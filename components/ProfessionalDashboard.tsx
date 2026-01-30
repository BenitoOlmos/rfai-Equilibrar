import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { professionalService } from '../src/services/api';
import {
    Users, Activity, Clock, TrendingUp, ChevronRight,
    LogOut, Calendar, AlertCircle, CheckCircle2,
    Headphones, FileText, BarChart3
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface Props {
    currentUser: User;
    onLogout: () => void;
}

interface PacienteResumen {
    pacienteId: string;
    nombre: string;
    email: string;
    programa: string;
    matriculaId: string;
    fecha_inicio: string;
    progreso_general: number;
    audiosEscuchados: number;
    minutosAudio: number;
    semanasConTest: number;
    ultimaActividad: string;
}

interface MetricasPaciente {
    pacienteId: string;
    matriculaId: string;
    tiempoEscucha: any[];
    avanceGuias: any;
    comparativaTests: any[];
    estadisticas: any;
}

export const ProfessionalDashboard: React.FC<Props> = ({ currentUser, onLogout }) => {
    const [pacientes, setPacientes] = useState<PacienteResumen[]>([]);
    const [selectedPaciente, setSelectedPaciente] = useState<PacienteResumen | null>(null);
    const [metricas, setMetricas] = useState<MetricasPaciente | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMetricas, setIsLoadingMetricas] = useState(false);

    // Cargar lista de pacientes al montar
    useEffect(() => {
        loadPacientes();
    }, [currentUser.id]);

    const loadPacientes = async () => {
        try {
            setIsLoading(true);
            const resumen = await professionalService.getResumenPacientes(currentUser.id);
            setPacientes(resumen);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMetricasPaciente = async (paciente: PacienteResumen) => {
        try {
            setIsLoadingMetricas(true);
            setSelectedPaciente(paciente);
            const data = await professionalService.getMetricasPaciente(
                paciente.pacienteId,
                paciente.matriculaId
            );
            setMetricas(data);
        } catch (error) {
            console.error('Error al cargar métricas:', error);
        } finally {
            setIsLoadingMetricas(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-CL');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BrandLogo className="w-10 h-10" />
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Panel Profesional</h1>
                            <p className="text-sm text-slate-500">{currentUser.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="hidden md:inline">Cerrar Sesión</span>
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Vista Principal: Lista de Pacientes */}
                {!selectedPaciente && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                Mis Pacientes
                            </h2>
                            <p className="text-slate-600">
                                {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} activo{pacientes.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pacientes.map((paciente) => (
                                    <div
                                        key={paciente.pacienteId}
                                        onClick={() => loadMetricasPaciente(paciente)}
                                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 hover:border-brand-200"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-slate-800 mb-1">
                                                    {paciente.nombre}
                                                </h3>
                                                <p className="text-sm text-slate-500">{paciente.email}</p>
                                            </div>
                                            <ChevronRight className="text-slate-400" size={20} />
                                        </div>

                                        <div className="mb-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${paciente.programa.includes('Culpa')
                                                    ? 'bg-brand-100 text-brand-700'
                                                    : 'bg-indigo-100 text-indigo-700'
                                                }`}>
                                                {paciente.programa}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Headphones size={16} className="text-brand-500" />
                                                <span className="text-slate-600">
                                                    {paciente.audiosEscuchados} audios ({paciente.minutosAudio} min)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText size={16} className="text-indigo-500" />
                                                <span className="text-slate-600">
                                                    {paciente.semanasConTest} semanas con test
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock size={16} className="text-slate-400" />
                                                <span className="text-slate-500">
                                                    Última actividad: {formatDate(paciente.ultimaActividad)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Barra de progreso */}
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                                                <span>Progreso</span>
                                                <span>{paciente.progreso_general}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${paciente.progreso_general}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLoading && pacientes.length === 0 && (
                            <div className="bg-white rounded-2xl p-12 text-center">
                                <Users className="mx-auto text-slate-300 mb-4" size={48} />
                                <h3 className="text-lg font-bold text-slate-600 mb-2">
                                    No hay pacientes asignados
                                </h3>
                                <p className="text-slate-500">
                                    Contacta al coordinador para que te asigne pacientes
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Vista Detalle: Métricas del Paciente */}
                {selectedPaciente && (
                    <div>
                        <button
                            onClick={() => {
                                setSelectedPaciente(null);
                                setMetricas(null);
                            }}
                            className="flex items-center gap-2 text-slate-600 hover:text-brand-600 mb-6 transition-colors"
                        >
                            <ChevronRight size={20} className="rotate-180" />
                            Volver a la lista
                        </button>

                        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                                        {selectedPaciente.nombre}
                                    </h2>
                                    <p className="text-slate-500">{selectedPaciente.email}</p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${selectedPaciente.programa.includes('Culpa')
                                        ? 'bg-brand-100 text-brand-700'
                                        : 'bg-indigo-100 text-indigo-700'
                                    }`}>
                                    {selectedPaciente.programa}
                                </span>
                            </div>
                        </div>

                        {isLoadingMetricas ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                            </div>
                        ) : metricas ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Estadísticas Generales */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                                        Estadísticas Generales
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-brand-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Headphones className="text-brand-600" size={24} />
                                                <span className="font-medium text-slate-700">Audios Escuchados</span>
                                            </div>
                                            <span className="text-2xl font-bold text-brand-600">
                                                {metricas.estadisticas.audiosUnicos}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Clock className="text-indigo-600" size={24} />
                                                <span className="font-medium text-slate-700">Minutos de Audio</span>
                                            </div>
                                            <span className="text-2xl font-bold text-indigo-600">
                                                {Math.round(metricas.estadisticas.minutosAudioTotales)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <FileText className="text-emerald-600" size={24} />
                                                <span className="font-medium text-slate-700">Tests Realizados</span>
                                            </div>
                                            <span className="text-2xl font-bold text-emerald-600">
                                                {metricas.estadisticas.testsRealizados}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="text-amber-600" size={24} />
                                                <span className="font-medium text-slate-700">Guías Completadas</span>
                                            </div>
                                            <span className="text-2xl font-bold text-amber-600">
                                                {metricas.estadisticas.guiasCompletadas}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tiempo de Escucha por Semana */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                                        Tiempo de Escucha por Semana
                                    </h3>
                                    <div className="space-y-4">
                                        {metricas.tiempoEscucha.length > 0 ? (
                                            metricas.tiempoEscucha.map((semana) => (
                                                <div key={semana.semana} className="border-b border-slate-100 pb-4 last:border-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-slate-700">
                                                            Semana {semana.semana}
                                                        </span>
                                                        <span className="text-brand-600 font-bold">
                                                            {Math.round(semana.minutosTotal)} min
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {semana.audios.map((audio: any) => (
                                                            <div key={audio.id} className="flex items-center justify-between text-sm text-slate-600 pl-4">
                                                                <span>{audio.titulo}</span>
                                                                <span className="text-slate-500">
                                                                    {Math.round(audio.minutos)} min ({audio.vecesEscuchado}x)
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 text-center py-8">
                                                No hay registros de escucha aún
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Avance de Guías */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                                        Avance en Guías Interactivas
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.entries(metricas.avanceGuias).length > 0 ? (
                                            Object.entries(metricas.avanceGuias).map(([semana, guia]: [string, any]) => (
                                                <div key={semana} className="p-4 bg-slate-50 rounded-xl">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-slate-700">Semana {semana}</span>
                                                        {guia.completado ? (
                                                            <CheckCircle2 className="text-emerald-500" size={20} />
                                                        ) : (
                                                            <AlertCircle className="text-amber-500" size={20} />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-2">{guia.titulo}</p>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-600">
                                                            Paso {guia.pasoActual} de {guia.pasosTotales}
                                                        </span>
                                                        <span className="font-bold text-brand-600">
                                                            {guia.porcentaje}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                                        <div
                                                            className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all"
                                                            style={{ width: `${guia.porcentaje}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 text-center py-8">
                                                No se ha iniciado ninguna guía aún
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Comparativa de Tests */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                                        Evolución RFAI (Inicial vs. Reciente)
                                    </h3>
                                    {metricas.comparativaTests.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {metricas.comparativaTests.map((comp) => (
                                                <div key={comp.semana} className="border border-slate-200 rounded-xl p-4">
                                                    <h4 className="font-bold text-slate-700 mb-3">Semana {comp.semana}</h4>
                                                    {comp.inicial && comp.reciente ? (
                                                        <div className="space-y-2">
                                                            {Object.entries(comp.mejora).map(([dimension, data]: [string, any]) => (
                                                                <div key={dimension} className="text-sm">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-slate-600 capitalize">
                                                                            {dimension.replace(/([A-Z])/g, ' $1').trim()}
                                                                        </span>
                                                                        <span className={`font-bold ${data.cambio > 0 ? 'text-emerald-600' : 'text-red-600'
                                                                            }`}>
                                                                            {data.cambio > 0 ? '+' : ''}{data.cambio} ({data.porcentajeCambio}%)
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                        <span>Inicial: {data.inicial}</span>
                                                                        <span>→</span>
                                                                        <span>Reciente: {data.reciente}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-500 text-sm">
                                                            {comp.inicial ? 'Solo test inicial' : 'Sin tests realizados'}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-center py-8">
                                            No hay tests realizados aún
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};
