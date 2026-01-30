import React, { useState, useEffect } from 'react';
import { adminService } from '../src/services/api';
import { UserPlus, UserCheck, ChevronRight, AlertCircle, RefreshCw, Save } from 'lucide-react';

interface Paciente {
    matricula_id: number;
    usuario_id: string;
    nombre_completo: string;
    programa: string;
    fecha_inicio: string;
}

interface Profesional {
    id: string;
    nombre_completo: string;
}

export const UserAssignment: React.FC = () => {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [profesionales, setProfesionales] = useState<Profesional[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPaciente, setSelectedPaciente] = useState<number | null>(null);
    const [selectedProfesional, setSelectedProfesional] = useState<string>('');
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pacs, profs] = await Promise.all([
                adminService.getPacientesSinAsignar(),
                adminService.getProfesionales()
            ]);
            setPacientes(pacs);
            setProfesionales(profs);

            // Preseleccionar a Claudio Reyes si existe
            const claudio = profs.find((p: Profesional) => p.id === 'prof-claudio-reyes');
            if (claudio) setSelectedProfesional(claudio.id);
            else if (profs.length > 0) setSelectedProfesional(profs[0].id);

        } catch (error) {
            console.error('Error loading assignment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (matriculaId: number) => {
        if (!selectedProfesional) return;

        try {
            await adminService.vincularProfesional(matriculaId, selectedProfesional);
            setActionMessage('Vinculación exitosa');
            setTimeout(() => setActionMessage(null), 3000);
            loadData(); // Recargar listas
        } catch (error) {
            console.error('Error assigning:', error);
            setActionMessage('Error al vincular');
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <UserPlus size={20} className="text-brand-500" />
                        Asignación de Pacientes
                    </h3>
                    <p className="text-sm text-slate-400">Pacientes activos sin profesional asignado</p>
                </div>
                <button
                    onClick={loadData}
                    className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="p-6">
                {/* Global Selector */}
                <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Asignar a:</span>
                    <select
                        value={selectedProfesional}
                        onChange={(e) => setSelectedProfesional(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                    >
                        <option value="">Seleccionar Profesional</option>
                        {profesionales.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                        ))}
                    </select>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Cargando...</div>
                    ) : pacientes.length === 0 ? (
                        <div className="text-center py-8 bg-green-50 rounded-xl text-green-700 font-medium flex flex-col items-center gap-2">
                            <UserCheck size={32} />
                            Todos los pacientes están asignados
                        </div>
                    ) : (
                        pacientes.map((paciente) => (
                            <div key={paciente.matricula_id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-brand-200 transition-colors shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                        {paciente.nombre_completo.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{paciente.nombre_completo}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className={`px-1.5 py-0.5 rounded ${paciente.programa.includes('Culpa') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                {paciente.programa}
                                            </span>
                                            <span>• Inicio: {new Date(paciente.fecha_inicio).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAssign(paciente.matricula_id)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors"
                                    disabled={!selectedProfesional}
                                >
                                    <Save size={14} />
                                    Asignar
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {actionMessage && (
                    <div className="mt-4 p-3 bg-green-100 text-green-700 text-sm rounded-lg text-center animate-fade-in">
                        {actionMessage}
                    </div>
                )}
            </div>
        </div>
    );
};
