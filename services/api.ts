
const API_URL = 'http://localhost:3005/api';

export const api = {
    // Health check
    checkHealth: async () => {
        try {
            const res = await fetch(`${API_URL}/health`);
            return await res.json();
        } catch (e) {
            console.error('API Health Check Failed', e);
            return { status: 'ERROR' };
        }
    },

    // Auth
    login: async (email: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!res.ok) throw new Error('Login failed');
            return await res.json();
        } catch (e) {
            throw e;
        }
    },

    // Ciclos
    crearNuevoCiclo: async (clientId: string, dimension: 'ANGUSTIA' | 'CULPA', profesionalId?: string) => {
        const res = await fetch(`${API_URL}/ciclos/nuevo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: clientId, dimension, profesional_id: profesionalId })
        });
        if (!res.ok) throw new Error('Error al crear ciclo');
        return await res.json();
    },

    obtenerCicloActivo: async (clientId: string) => {
        const res = await fetch(`${API_URL}/ciclos/${clientId}/actual`);
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Error al obtener ciclo');
        }
        return await res.json();
    },

    // Citas
    programarCita: async (cicloId: number, numeroSesion: '1' | '2', fechaProgramada: string) => {
        const res = await fetch(`${API_URL}/citas/programar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ciclo_id: cicloId, numero_sesion: numeroSesion, fecha_programada: fechaProgramada })
        });
        if (!res.ok) throw new Error('Error al programar cita');
        return await res.json();
    },

    completarCita: async (citaId: number, notasSesion?: string) => {
        const res = await fetch(`${API_URL}/citas/${citaId}/completar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notas_sesion: notasSesion })
        });
        if (!res.ok) throw new Error('Error al completar cita');
        return await res.json();
    }
};
