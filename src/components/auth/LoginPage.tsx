import React, { useState } from 'react';
import { authService } from '../../services/api';
import { Loader } from 'lucide-react';

interface LoginPageProps {
    onLoginSuccess: (userData: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const demoUsers = [
        {
            email: 'ana.martinez@test.com',
            name: '👩 Ana Martínez',
            badge: 'Nuevo - Semana 1',
            badgeColor: 'bg-red-100 text-red-700',
            description: 'Matriculada hoy. Solo verá la Semana 1 desbloqueada.'
        },
        {
            email: 'bruno.silva@test.com',
            name: '👨 Bruno Silva',
            badge: 'Avanzado - Semanas 1-3',
            badgeColor: 'bg-blue-100 text-blue-700',
            description: 'Matriculado hace 15 días. Tiene progreso en guías y audios.'
        },
        {
            email: 'carla.rojas@test.com',
            name: '👩 Carla Rojas',
            badge: 'Completado - 100%',
            badgeColor: 'bg-green-100 text-green-700',
            description: 'Programa completado. Todas las semanas desbloqueadas.'
        },
        {
            email: 'david.lopez@clinica.com',
            name: '👨‍⚕️ Dr. David López',
            badge: 'Profesional',
            badgeColor: 'bg-purple-100 text-purple-700',
            description: 'Cuenta de profesional con acceso a dashboard.'
        }
    ];

    const handleLogin = async () => {
        if (!selectedUser) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login(selectedUser);

            if (response.success) {
                onLoginSuccess(response);
            } else {
                setError('Error en el inicio de sesión');
            }
        } catch (err: any) {
            console.error('Error de login:', err);
            setError(err.response?.data?.mensaje || 'No se pudo conectar con el servidor. Verifica que esté corriendo en puerto 3005.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
                        🔐 Sistema RFAI
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Reprogramación Focalizada - Clínica Equilibrar
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                        Selecciona un usuario de prueba para ingresar
                    </p>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                        <p className="text-red-700 font-semibold text-sm">
                            ⚠️ {error}
                        </p>
                    </div>
                )}

                {/* User cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {demoUsers.map((user) => (
                        <button
                            key={user.email}
                            onClick={() => setSelectedUser(user.email)}
                            className={`
                p-5 rounded-2xl border-2 text-left transition-all
                ${selectedUser === user.email
                                    ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                                    : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-md'
                                }
              `}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-bold text-slate-800">
                                    {user.name}
                                </h3>
                                {selectedUser === user.email && (
                                    <span className="text-purple-600 text-xl">✓</span>
                                )}
                            </div>

                            <p className="text-sm text-slate-600 mb-2">
                                {user.email}
                            </p>

                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${user.badgeColor} mb-2`}>
                                {user.badge}
                            </span>

                            <p className="text-xs text-slate-500 leading-relaxed">
                                {user.description}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Login button */}
                <button
                    onClick={handleLogin}
                    disabled={!selectedUser || isLoading}
                    className={`
            w-full py-4 rounded-xl font-bold text-lg transition-all
            ${!selectedUser || isLoading
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-2xl hover:scale-105'
                        }
          `}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader size={24} className="animate-spin" />
                            Iniciando sesión...
                        </span>
                    ) : selectedUser ? (
                        `Ingresar como ${demoUsers.find(u => u.email === selectedUser)?.name}`
                    ) : (
                        'Selecciona un usuario primero'
                    )}
                </button>

                {/* Info footer */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-center text-xs text-slate-500">
                        💡 <strong>Modo de Desarrollo:</strong> Estos son usuarios de prueba con diferentes niveles de progreso.
                        En producción, el login será con credenciales reales.
                    </p>
                </div>
            </div>
        </div>
    );
};
