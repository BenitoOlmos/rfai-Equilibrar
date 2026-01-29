
const API_URL = 'http://localhost:3005/api';

export const api = {
    checkHealth: async () => {
        try {
            const res = await fetch(`${API_URL}/health`);
            return await res.json();
        } catch (e) {
            console.error('API Health Check Failed', e);
            return { status: 'ERROR' };
        }
    },

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
    }
};
