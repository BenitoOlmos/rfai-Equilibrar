import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

console.log('🔗 API URL configurada:', API_URL);

// Configuración base de Axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Interceptor para agregar token JWT (si se implementa autenticación)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Inyectar ID de usuario para middleware de roles (Prototipo)
        const sessionStr = localStorage.getItem('rfai_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                if (session.user?.id) {
                    config.headers['x-user-id'] = session.user.id;
                }
            } catch (e) {
                console.error('Error parsing session for header', e);
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejo de errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirigir a login
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================================================
// AUTH
// ============================================================================
export const authService = {
    login: async (email: string, password?: string) => {
        // En desarrollo, usar el endpoint de dev que solo requiere email
        const endpoint = import.meta.env.MODE === 'production' ? '/auth/login' : '/dev/login';

        // En desarrollo, solo enviar email
        const payload = import.meta.env.MODE === 'production'
            ? { email, password }
            : { email };

        const { data } = await api.post(endpoint, payload);
        if (data.success && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('rfai_session');
        window.location.href = '/';
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

// ============================================================================
// DASHBOARD - Perfil completo del cliente
// ============================================================================
export const dashboardService = {
    /**
     * Obtiene el perfil completo con progreso calculado
     */
    getClientProfile: async (userId: string) => {
        const { data } = await api.get('/dashboard/me', {
            params: { userId }
        });
        return data.profile;
    },

    /**
     * Obtiene perfil de un usuario específico (para admin)
     */
    getUserProfile: async (userId: string) => {
        const { data } = await api.get(`/dashboard/profile/${userId}`);
        return data.profile;
    }
};

// ============================================================================
// PROFESSIONAL - Analítica de pacientes
// ============================================================================
export const professionalService = {
    /**
     * Obtiene lista de pacientes asignados
     */
    getPacientes: async (professionalId: string) => {
        const { data } = await api.get('/professional/pacientes', {
            params: { professionalId }
        });
        return data.pacientes;
    },

    /**
     * Obtiene resumen de todos los pacientes
     */
    getResumenPacientes: async (professionalId: string) => {
        const { data } = await api.get('/professional/pacientes/resumen', {
            params: { professionalId }
        });
        return data.resumen;
    },

    /**
     * Obtiene métricas detalladas de un paciente
     */
    getMetricasPaciente: async (pacienteId: string, matriculaId: string) => {
        const { data } = await api.get(`/professional/paciente/${pacienteId}/metricas`, {
            params: { matriculaId }
        });
        return data.metricas;
    }
};

// ============================================================================
// ADMIN - Gestión Administrativa
// ============================================================================
export const adminService = {
    /**
     * Obtener pacientes sin asignar
     */
    getPacientesSinAsignar: async () => {
        const { data } = await api.get('/admin/pacientes-sin-asignar');
        return data.pacientes;
    },

    /**
     * Obtener todos los usuarios
     */
    getUsers: async () => {
        const { data } = await api.get('/admin/usuarios');
        return data.users;
    },

    /**
     * Obtener lista de profesionales
     */
    getProfesionales: async () => {
        const { data } = await api.get('/admin/profesionales');
        return data.profesionales;
    },

    /**
     * Vincular profesional a paciente
     */
    vincularProfesional: async (matriculaId: number, profesionalId: string) => {
        const { data } = await api.post('/admin/vincular', { matriculaId, profesionalId });
        return data;
    },

    /**
     * Crear usuario
     */
    crearUsuario: async (userData: any) => {
        const { data } = await api.post('/admin/usuarios', userData);
        return data;
    },

    /**
     * Actualizar usuario
     */
    updateUsuario: async (id: string, updates: any) => {
        const { data } = await api.patch(`/admin/usuarios/${id}`, updates);
        return data;
    },

    /**
     * Gestión de Contenido (Biblioteca)
     */
    getRecursos: async () => {
        const { data } = await api.get('/admin/content/recursos');
        return data.resources;
    },

    getModulos: async () => {
        const { data } = await api.get('/admin/content/modulos');
        return data.modulos;
    },

    createRecurso: async (recursoData: any) => {
        const { data } = await api.post('/admin/content/recursos', recursoData);
        return data;
    },

    updateRecurso: async (id: number, updates: any) => {
        const { data } = await api.patch(`/admin/content/recursos/${id}`, updates);
        return data;
    }
};

// ============================================================================
// RECURSOS
// ============================================================================
export const recursosService = {
    getRecursosPorMatricula: async (matriculaId: number, tipo?: string) => {
        const { data } = await api.get(`/recursos/matricula/${matriculaId}`, {
            params: { tipo }
        });
        return data;
    },

    getRecurso: async (recursoId: number) => {
        const { data } = await api.get(`/recursos/${recursoId}`);
        return data;
    },

    getRecursosPorSemana: async (matriculaId: number, semana: number) => {
        const { data } = await api.get(`/recursos/semana/${semana}/matricula/${matriculaId}`);
        return data;
    },

    getAudioStream: async (recursoId: number) => {
        const { data } = await api.get(`/recursos/audio/${recursoId}/stream`);
        return data;
    },

    getMeetLink: async (recursoId: number) => {
        const { data } = await api.get(`/recursos/meet/${recursoId}/enlace`);
        return data;
    }
};

// ============================================================================
// GUÍAS INTERACTIVAS
// ============================================================================
export const guiasService = {
    getGuia: async (guiaId: number) => {
        const { data } = await api.get(`/guias/${guiaId}`);
        return data;
    },

    getProgreso: async (matriculaId: number, guiaId: number) => {
        const { data } = await api.get(`/guias/progreso/${matriculaId}/${guiaId}`);
        return data;
    },

    // ⭐ AUTOSAVE - Llamar con debounce desde el frontend
    guardarProgreso: async (progresoId: number, pasoActual: number, respuestas: object) => {
        const { data } = await api.patch(`/guias/progreso/${progresoId}`, {
            paso_actual: pasoActual,
            respuestas_json: respuestas
        });
        return data;
    },

    completarGuia: async (progresoId: number, respuestas: object) => {
        const { data } = await api.post(`/guias/progreso/${progresoId}/completar`, {
            respuestas_json: respuestas
        });
        return data;
    },

    getGuiasPorMatricula: async (matriculaId: number) => {
        const { data } = await api.get(`/guias/matricula/${matriculaId}/todas`);
        return data;
    }
};

// ============================================================================
// ANALYTICS (Heartbeat de audios)
// ============================================================================
export const analyticsService = {
    // ⭐ Enviar heartbeat cada 30 segundos
    sendAudioHeartbeat: async (payload: {
        matricula_id: number;
        recurso_id: number;
        sesion_reproduccion: string;
        marcador_tiempo: number;
        completado?: boolean;
        metadata?: object;
    }) => {
        const { data } = await api.post('/analytics/audio/heartbeat', payload);
        return data;
    },

    getEstadisticasAudio: async (recursoId: number, matriculaId?: number) => {
        const { data } = await api.get(`/analytics/audio/${recursoId}/estadisticas`, {
            params: { matriculaId }
        });
        return data;
    },

    getResumenMatricula: async (matriculaId: number) => {
        const { data } = await api.get(`/analytics/matricula/${matriculaId}/resumen`);
        return data;
    },

    getClientesProfesional: async (profesionalId: string) => {
        const { data } = await api.get(`/analytics/profesional/${profesionalId}/clientes`);
        return data;
    },

    registrarAcceso: async (usuarioId: string, ruta: string, metodo = 'GET') => {
        try {
            await api.post('/analytics/acceso', {
                usuario_id: usuarioId,
                ruta,
                metodo
            });
        } catch (error) {
            // No bloquear la app si falla el logging
            console.warn('Error al registrar acceso:', error);
        }
    }
};

// ============================================================================
// TESTS
// ============================================================================
export const testsService = {
    submitTest: async (payload: {
        matricula_id: number;
        recurso_id: number;
        tipo_test: 'INICIAL' | 'COMPARATIVO' | 'FINAL';
        respuestas: object;
        scores: object;
    }) => {
        const { data } = await api.post('/tests/submit', payload);
        return data;
    },

    getResultadosMatricula: async (matriculaId: number) => {
        const { data } = await api.get(`/tests/resultados/${matriculaId}`);
        return data;
    }
};

// ============================================================================
// HEALTH CHECK
// ============================================================================
export const healthCheck = async () => {
    try {
        const { data } = await api.get('/health');
        return data;
    } catch (error) {
        console.error('Health check failed:', error);
        return { status: 'ERROR' };
    }
};

export default api;
