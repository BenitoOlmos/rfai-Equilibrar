import express from 'express';
import { pool } from '../config/db.js';
import { checkWeekAccess } from '../middleware/checkWeekAccess.js';

const router = express.Router();

/**
 * GET /api/guias/:guiaId
 * Obtener estructura de una guía (JSON con preguntas)
 */
router.get('/:guiaId', async (req, res) => {
    try {
        const { guiaId } = req.params;

        const [guias] = await pool.query(`
      SELECT 
        ge.id,
        ge.titulo,
        ge.descripcion,
        ge.estructura_json,
        ge.version,
        ms.numero_semana,
        ms.titulo as semana_titulo
      FROM guia_estructuras ge
      JOIN modulos_semanales ms ON ge.modulo_id = ms.id
      WHERE ge.id = ? AND ge.activa = TRUE
    `, [guiaId]);

        if (guias.length === 0) {
            return res.status(404).json({ error: 'Guía no encontrada' });
        }

        res.json({
            success: true,
            guia: guias[0]
        });

    } catch (error) {
        console.error('Error al obtener guía:', error);
        res.status(500).json({ error: 'Error al cargar la guía' });
    }
});

/**
 * GET /api/guias/progreso/:matriculaId/:guiaId
 * Obtener progreso guardado de una guía para un usuario
 */
router.get('/progreso/:matriculaId/:guiaId', async (req, res) => {
    try {
        const { matriculaId, guiaId } = req.params;

        const [progreso] = await pool.query(`
      SELECT 
        gp.id,
        gp.paso_actual,
        gp.respuestas_json,
        gp.completado,
        gp.fecha_inicio,
        gp.fecha_completado,
        gp.ultima_actualizacion
      FROM guia_progreso gp
      WHERE gp.matricula_id = ? AND gp.guia_id = ?
    `, [matriculaId, guiaId]);

        if (progreso.length === 0) {
            // Si no existe, crear registro inicial
            const [result] = await pool.query(`
        INSERT INTO guia_progreso (matricula_id, guia_id, paso_actual, respuestas_json, fecha_inicio)
        VALUES (?, ?, 0, '{}', NOW())
      `, [matriculaId, guiaId]);

            return res.json({
                success: true,
                progreso: {
                    id: result.insertId,
                    paso_actual: 0,
                    respuestas_json: {},
                    completado: false,
                    fecha_inicio: new Date()
                }
            });
        }

        res.json({
            success: true,
            progreso: progreso[0]
        });

    } catch (error) {
        console.error('Error al obtener progreso:', error);
        res.status(500).json({ error: 'Error al cargar progreso' });
    }
});

/**
 * PATCH /api/guias/progreso/:progresoId
 * ⭐ AUTOSAVE - Guardar progreso parcial de la guía
 * 
 * Este endpoint se llama desde el frontend con debounce
 * Body: { paso_actual: number, respuestas_json: object }
 */
router.patch('/progreso/:progresoId', async (req, res) => {
    try {
        const { progresoId } = req.params;
        const { paso_actual, respuestas_json } = req.body;

        if (paso_actual === undefined && !respuestas_json) {
            return res.status(400).json({
                error: 'Datos inválidos',
                mensaje: 'Debe proporcionar paso_actual o respuestas_json'
            });
        }

        let query = 'UPDATE guia_progreso SET ';
        const params = [];
        const updates = [];

        if (paso_actual !== undefined) {
            updates.push('paso_actual = ?');
            params.push(paso_actual);
        }

        if (respuestas_json) {
            updates.push('respuestas_json = ?');
            params.push(JSON.stringify(respuestas_json));
        }

        query += updates.join(', ');
        query += ', ultima_actualizacion = NOW() WHERE id = ?';
        params.push(progresoId);

        await pool.query(query, params);

        res.json({
            success: true,
            mensaje: 'Progreso guardado automáticamente',
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Error en autosave de guía:', error);
        res.status(500).json({
            error: 'Error al guardar progreso',
            mensaje: 'No se pudo guardar el progreso. Intenta nuevamente.'
        });
    }
});

/**
 * POST /api/guias/progreso/:progresoId/completar
 * Marcar guía como completada
 */
router.post('/progreso/:progresoId/completar', async (req, res) => {
    try {
        const { progresoId } = req.params;
        const { respuestas_json } = req.body;

        if (!respuestas_json) {
            return res.status(400).json({
                error: 'Respuestas requeridas',
                mensaje: 'Debe enviar las respuestas completas de la guía'
            });
        }

        // Actualizar como completado
        await pool.query(`
      UPDATE guia_progreso 
      SET 
        completado = TRUE,
        fecha_completado = NOW(),
        respuestas_json = ?,
        ultima_actualizacion = NOW()
      WHERE id = ?
    `, [JSON.stringify(respuestas_json), progresoId]);

        // Actualizar progreso general de la matrícula
        const [progreso] = await pool.query(`
      SELECT matricula_id FROM guia_progreso WHERE id = ?
    `, [progresoId]);

        if (progreso.length > 0) {
            const matriculaId = progreso[0].matricula_id;

            // Recalcular porcentaje de progreso
            const { calcularProgresoGeneral } = await import('../services/desbloqueoService.js');
            const progresoGeneral = await calcularProgresoGeneral(matriculaId);

            await pool.query(`
        UPDATE matriculas 
        SET progreso_general = ? 
        WHERE id = ?
      `, [progresoGeneral.porcentaje_progreso, matriculaId]);
        }

        res.json({
            success: true,
            mensaje: '¡Guía completada exitosamente!',
            completado: true
        });

    } catch (error) {
        console.error('Error al completar guía:', error);
        res.status(500).json({
            error: 'Error al completar la guía'
        });
    }
});

/**
 * GET /api/guias/matricula/:matriculaId
 * Obtener todas las guías disponibles para una matrícula con su estado
 */
router.get('/matricula/:matriculaId/todas', async (req, res) => {
    try {
        const { matriculaId } = req.params;

        const [guias] = await pool.query(`
      SELECT 
        ge.id,
        ge.titulo,
        ge.descripcion,
        ms.numero_semana,
        ms.titulo as semana_titulo,
        ms.dias_para_desbloqueo,
        m.fecha_inicio,
        DATEDIFF(CURDATE(), m.fecha_inicio) as dias_transcurridos,
        CASE 
          WHEN DATEDIFF(CURDATE(), m.fecha_inicio) >= ms.dias_para_desbloqueo 
          THEN TRUE 
          ELSE FALSE 
        END as desbloqueado,
        gp.completado,
        gp.paso_actual,
        gp.id as progreso_id
      FROM guia_estructuras ge
      JOIN modulos_semanales ms ON ge.modulo_id = ms.id
      JOIN matriculas m ON ms.programa_id = m.programa_id
      LEFT JOIN guia_progreso gp ON ge.id = gp.guia_id AND gp.matricula_id = m.id
      WHERE m.id = ? AND ge.activa = TRUE AND m.estado = 'ACTIVO'
      ORDER BY ms.numero_semana
    `, [matriculaId]);

        res.json({
            success: true,
            guias
        });

    } catch (error) {
        console.error('Error al obtener guías:', error);
        res.status(500).json({ error: 'Error al cargar guías' });
    }
});

export default router;
