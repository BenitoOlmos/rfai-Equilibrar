// API Routes - Treatment Cycles & Sessions

import express from 'express';
import {
    completarSesion,
    obtenerCicloActivo,
    crearNuevoCiclo,
    programarCita
} from '../services/cicloService.js';

const router = express.Router();

/**
 * POST /api/ciclos/nuevo
 * Crear un nuevo ciclo de tratamiento
 */
router.post('/nuevo', async (req, res) => {
    try {
        const { client_id, dimension, profesional_id } = req.body;

        if (!client_id || !dimension) {
            return res.status(400).json({
                error: 'client_id y dimension son requeridos'
            });
        }

        const ciclo = await crearNuevoCiclo(client_id, dimension, profesional_id);

        res.status(201).json({
            success: true,
            mensaje: 'Ciclo creado exitosamente',
            ciclo
        });

    } catch (error) {
        console.error('Error al crear ciclo:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * GET /api/ciclos/:clientId/actual
 * Obtener el ciclo activo de un cliente con materiales y estado
 */
router.get('/:clientId/actual', async (req, res) => {
    try {
        const { clientId } = req.params;

        const ciclo = await obtenerCicloActivo(clientId);

        if (!ciclo) {
            return res.status(404).json({
                mensaje: 'No hay ciclo activo para este cliente'
            });
        }

        res.json({
            success: true,
            ciclo
        });

    } catch (error) {
        console.error('Error al obtener ciclo:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * POST /api/citas/programar
 * Programar una nueva sesión
 */
router.post('/programar', async (req, res) => {
    try {
        const { ciclo_id, numero_sesion, fecha_programada } = req.body;

        if (!ciclo_id || !numero_sesion || !fecha_programada) {
            return res.status(400).json({
                error: 'ciclo_id, numero_sesion y fecha_programada son requeridos'
            });
        }

        const cita = await programarCita(ciclo_id, numero_sesion, fecha_programada);

        res.status(201).json({
            success: true,
            mensaje: 'Cita programada exitosamente',
            cita
        });

    } catch (error) {
        console.error('Error al programar cita:', error);
        res.status(400).json({
            error: error.message
        });
    }
});

/**
 * PUT /api/citas/:id/completar
 * Completar una sesión y desbloquear materiales
 */
router.put('/:id/completar', async (req, res) => {
    try {
        const { id } = req.params;
        const { notas_sesion } = req.body;

        const resultado = await completarSesion(parseInt(id), notas_sesion);

        res.json({
            success: true,
            mensaje: `Sesión ${resultado.sesionCompletada} completada exitosamente`,
            ...resultado
        });

    } catch (error) {
        console.error('Error al completar sesión:', error);
        res.status(400).json({
            error: error.message
        });
    }
});

export default router;
