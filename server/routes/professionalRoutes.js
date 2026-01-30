/**
 * PROFESSIONAL ROUTES
 * 
 * Endpoints para que el profesional consulte métricas de sus pacientes
 */

import express from 'express';
import {
    getPacientesAsignados,
    getMetricasPaciente,
    getResumenPacientes
} from '../services/professionalService.js';

const router = express.Router();

/**
 * GET /api/professional/pacientes
 * 
 * Obtiene la lista completa de pacientes asignados
 * 
 * Query params:
 *   - professionalId: ID del profesional
 */
router.get('/pacientes', async (req, res) => {
    try {
        const professionalId = req.query.professionalId || req.headers['x-user-id'];

        if (!professionalId) {
            return res.status(400).json({
                error: 'Professional ID requerido'
            });
        }

        const pacientes = await getPacientesAsignados(professionalId);

        res.json({
            success: true,
            pacientes,
            total: pacientes.length
        });

    } catch (error) {
        console.error('Error en /professional/pacientes:', error);
        res.status(500).json({
            error: 'Error al obtener pacientes',
            mensaje: error.message
        });
    }
});

/**
 * GET /api/professional/pacientes/resumen
 * 
 * Obtiene un resumen rápido de todos los pacientes con métricas básicas
 */
router.get('/pacientes/resumen', async (req, res) => {
    try {
        const professionalId = req.query.professionalId || req.headers['x-user-id'];

        if (!professionalId) {
            return res.status(400).json({
                error: 'Professional ID requerido'
            });
        }

        const resumen = await getResumenPacientes(professionalId);

        res.json({
            success: true,
            resumen,
            total: resumen.length
        });

    } catch (error) {
        console.error('Error en /professional/pacientes/resumen:', error);
        res.status(500).json({
            error: 'Error al obtener resumen',
            mensaje: error.message
        });
    }
});

/**
 * GET /api/professional/paciente/:pacienteId/metricas
 * 
 * Obtiene las métricas detalladas de un paciente específico
 * 
 * Params:
 *   - pacienteId: ID del paciente
 * 
 * Query params:
 *   - matriculaId: ID de la matrícula (requerido)
 */
router.get('/paciente/:pacienteId/metricas', async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const { matriculaId } = req.query;

        if (!matriculaId) {
            return res.status(400).json({
                error: 'Matrícula ID requerido',
                mensaje: 'Proporciona matriculaId en query params'
            });
        }

        const metricas = await getMetricasPaciente(pacienteId, matriculaId);

        res.json({
            success: true,
            metricas
        });

    } catch (error) {
        console.error('Error en /professional/paciente/metricas:', error);
        res.status(500).json({
            error: 'Error al obtener métricas del paciente',
            mensaje: error.message
        });
    }
});

export default router;
