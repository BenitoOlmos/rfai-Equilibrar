/**
 * DASHBOARD ROUTES
 * 
 * Endpoints para obtener el perfil completo del cliente
 * con progreso calculado en tiempo real desde la base de datos
 */

import express from 'express';
import { getClientProfile } from '../services/dashboardService.js';

const router = express.Router();

/**
 * GET /api/dashboard/me
 * 
 * Obtiene el perfil completo del usuario autenticado
 * 
 * Headers: 
 *   - Authorization: Bearer <token> (en producción)
 *   - O bien usar la sesión dev actual
 * 
 * Response: ClientProfile completo con progreso calculado
 */
router.get('/me', async (req, res) => {
    try {
        // En desarrollo, obtener userId de query param o header
        // En producción, obtener del token JWT
        const userId = req.query.userId || req.headers['x-user-id'];

        if (!userId) {
            return res.status(400).json({
                error: 'User ID requerido',
                mensaje: 'Proporciona userId en query param o header x-user-id'
            });
        }

        // Llamar al servicio para obtener el perfil completo
        const profile = await getClientProfile(userId);

        res.json({
            success: true,
            profile
        });

    } catch (error) {
        console.error('Error en /dashboard/me:', error);

        if (error.message === 'Usuario no encontrado' ||
            error.message === 'No hay matrícula activa para este usuario') {
            return res.status(404).json({
                error: error.message
            });
        }

        res.status(500).json({
            error: 'Error al obtener perfil',
            mensaje: error.message
        });
    }
});

/**
 * GET /api/dashboard/profile/:userId
 * 
 * Obtiene el perfil de un usuario específico (para admin/coordinador)
 */
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await getClientProfile(userId);

        res.json({
            success: true,
            profile
        });

    } catch (error) {
        console.error('Error en /dashboard/profile:', error);

        res.status(500).json({
            error: 'Error al obtener perfil',
            mensaje: error.message
        });
    }
});

export default router;
