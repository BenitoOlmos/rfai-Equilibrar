import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

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
        const { data } = await api.post(endpoint, { email, password });
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
