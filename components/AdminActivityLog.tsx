import React, { useState, useEffect } from 'react';
import api from '../src/services/api';
import { Clock, Shield, User, Globe, Activity } from 'lucide-react';

interface ActivityLog {
    id: number;
    usuario_id: string;
    usuario: string;
    email: string;
    ruta: string;
    metodo: string;
    timestamp: string;
    rol: string;
}

export const AdminActivityLog: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivity();
        const interval = setInterval(loadActivity, 30000); // Recargar cada 30s
        return () => clearInterval(interval);
    }, []);

    const loadActivity = async () => {
        try {
            const { data } = await api.get('/analytics/admin/activity');
            if (data.success) {
                setLogs(data.activity);
            }
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (rol: string) => {
        switch (rol) {
            case 'ADMIN': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'PROFESIONAL': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'CLIENTE': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity size={20} className="text-brand-500" />
                        Actividad Reciente
                    </h3>
                    <p className="text-sm text-slate-400">Últimos accesos al sistema</p>
                </div>
                <button
                    onClick={loadActivity}
                    className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                    title="Actualizar"
                >
                    <Clock size={16} />
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {loading && logs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">Cargando actividad...</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3">Rol</th>
                                <th className="px-6 py-3">Acción</th>
                                <th className="px-6 py-3 text-right">Hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-700">{log.usuario}</p>
                                                <p className="text-xs text-slate-400">{log.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getRoleColor(log.rol)}`}>
                                            {log.rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-mono text-[10px] px-1.5 rounded ${log.metodo === 'POST' ? 'bg-amber-100 text-amber-700' :
                                                log.metodo === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {log.metodo}
                                            </span>
                                            <span className="truncate max-w-[200px]" title={log.ruta}>
                                                {log.ruta}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 font-mono text-xs">
                                        {formatTime(log.timestamp)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
