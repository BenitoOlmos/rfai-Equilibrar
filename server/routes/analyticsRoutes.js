import express from 'express';
import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/analytics/audio/heartbeat
 * ⭐ Registrar "latido" de reproducción de audio (cada 30 segundos)
 * 
 * Body: {
 *   matricula_id: number,
 *   recurso_id: number,
 *   sesion_reproduccion: string (UUID),
 *   marcador_tiempo: number (posición en segundos),
 *   completado: boolean
 * }
 */
router.post('/audio/heartbeat', async (req, res) => {
    try {
        const {
            matricula_id,
            recurso_id,
            sesion_reproduccion,
            marcador_tiempo,
            completado = false,
            metadata = {}
        } = req.body;

        // Validaciones
        if (!matricula_id || !recurso_id || !sesion_reproduccion || marcador_tiempo === undefined) {
            return res.status(400).json({
                error: 'Datos incompletos',
                mensaje: 'Se requiere: matricula_id, recurso_id, sesion_reproduccion, marcador_tiempo'
            });
        }

        // Verificar si es el primer heartbeat de esta sesión
        const [sesionExistente] = await pool.query(`
      SELECT id, timestamp_inicio 
      FROM logs_consumo_media 
      WHERE sesion_reproduccion = ? 
      ORDER BY timestamp_heartbeat DESC 
      LIMIT 1
    `, [sesion_reproduccion]);

        let timestamp_inicio;

        if (sesionExistente.length === 0) {
            // Primera vez - crear timestamp de inicio
            timestamp_inicio = new Date();
        } else {
            // Usar timestamp de inicio existente
            timestamp_inicio = sesionExistente[0].timestamp_inicio;
        }

        // Insertar log de heartbeat
        await pool.query(`
      INSERT INTO logs_consumo_media (
        matricula_id,
        recurso_id,
        sesion_reproduccion,
        timestamp_inicio,
        timestamp_heartbeat,
        segundos_reproducidos,
        marcador_tiempo,
        completado,
        metadata
      ) VALUES (?, ?, ?, ?, NOW(), 30, ?, ?, ?)
    `, [
            matricula_id,
            recurso_id,
            sesion_reproduccion,
            timestamp_inicio,
            marcador_tiempo,
            completado,
            JSON.stringify(metadata)
        ]);

        res.json({
            success: true,
            mensaje: 'Heartbeat registrado',
            sesion: sesion_reproduccion,
            marcador: marcador_tiempo
        });

    } catch (error) {
        console.error('Error en heartbeat de audio:', error);
        res.status(500).json({
            error: 'Error al registrar reproducción',
            mensaje: 'No se pudo guardar el progreso de reproducción'
        });
    }
});

/**
 * GET /api/analytics/audio/:recursoId/estadisticas
 * Obtener estadísticas de reproducción de un audio
 */
router.get('/audio/:recursoId/estadisticas', async (req, res) => {
    try {
        const { recursoId } = req.params;
        const { matriculaId } = req.query;

        let query = `
      SELECT 
        COUNT(DISTINCT sesion_reproduccion) as total_sesiones,
        SUM(segundos_reproducidos) as total_segundos,
        MAX(marcador_tiempo) as maxima_posicion,
        COUNT(CASE WHEN completado = TRUE THEN 1 END) as veces_completado,
        MIN(timestamp_inicio) as primera_reproduccion,
        MAX(timestamp_heartbeat) as ultima_reproduccion
      FROM logs_consumo_media
      WHERE recurso_id = ?
    `;

        const params = [recursoId];

        if (matriculaId) {
            query += ` AND matricula_id = ?`;
            params.push(matriculaId);
        }

        const [stats] = await pool.query(query, params);

        res.json({
            success: true,
            estadisticas: {
                ...stats[0],
                minutos_totales: Math.round((stats[0].total_segundos || 0) / 60)
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al cargar estadísticas' });
    }
});

/**
 * GET /api/analytics/matricula/:matriculaId/resumen
 * Resumen de actividad de un cliente
 */
router.get('/matricula/:matriculaId/resumen', async (req, res) => {
    try {
        const { matriculaId } = req.params;

        // Tiempo total escuchado
        const [tiempoAudio] = await pool.query(`
      SELECT 
        SUM(segundos_reproducidos) as total_segundos,
        COUNT(DISTINCT sesion_reproduccion) as total_sesiones,
        COUNT(DISTINCT recurso_id) as audios_diferentes
      FROM logs_consumo_media
      WHERE matricula_id = ?
    `, [matriculaId]);

        // Guías completadas
        const [guias] = await pool.query(`
      SELECT 
        COUNT(*) as guias_completadas,
        COUNT(CASE WHEN completado = FALSE THEN 1 END) as guias_en_progreso
      FROM guia_progreso
      WHERE matricula_id = ?
    `, [matriculaId]);

        // Tests realizados
        const [tests] = await pool.query(`
      SELECT 
        COUNT(*) as tests_realizados,
        MAX(fecha_realizacion) as ultimo_test
      FROM test_resultados
      WHERE matricula_id = ?
    `, [matriculaId]);

        // Último acceso
        const [ultimoAcceso] = await pool.query(`
      SELECT MAX(timestamp) as ultimo_acceso
      FROM logs_acceso la
      JOIN matriculas m ON la.usuario_id = m.cliente_id
      WHERE m.id = ?
    `, [matriculaId]);

        res.json({
            success: true,
            resumen: {
                audio: {
                    minutos_totales: Math.round((tiempoAudio[0].total_segundos || 0) / 60),
                    sesiones_reproduccion: tiempoAudio[0].total_sesiones || 0,
                    audios_diferentes: tiempoAudio[0].audios_diferentes || 0
                },
                guias: {
                    completadas: guias[0].guias_completadas || 0,
                    en_progreso: guias[0].guias_en_progreso || 0
                },
                tests: {
                    realizados: tests[0].tests_realizados || 0,
                    ultimo: tests[0].ultimo_test
                },
                ultimo_acceso: ultimoAcceso[0]?.ultimo_acceso
            }
        });

    } catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ error: 'Error al cargar resumen' });
    }
});

/**
 * GET /api/analytics/profesional/:profesionalId/clientes
 * Vista del profesional: actividad de todos sus clientes
 */
router.get('/profesional/:profesionalId/clientes', async (req, res) => {
    try {
        const { profesionalId } = req.params;

        const [clientes] = await pool.query(`
      SELECT 
        m.id as matricula_id,
        u.id as cliente_id,
        u.nombre_completo,
        u.email,
        p.nombre as programa,
        m.fecha_inicio,
        m.progreso_general,
        DATEDIFF(CURDATE(), m.fecha_inicio) as dias_en_programa,
        (SELECT SUM(segundos_reproducidos) FROM logs_consumo_media WHERE matricula_id = m.id) / 60 as minutos_audio,
        (SELECT COUNT(*) FROM guia_progreso WHERE matricula_id = m.id AND completado = TRUE) as guias_completadas,
        (SELECT COUNT(*) FROM test_resultados WHERE matricula_id = m.id) as tests_realizados,
        (SELECT MAX(timestamp) FROM logs_acceso WHERE usuario_id = u.id) as ultimo_acceso
      FROM matriculas m
      JOIN usuarios u ON m.cliente_id = u.id
      JOIN programas p ON m.programa_id = p.id
      WHERE m.profesional_id = ? AND m.estado = 'ACTIVO'
      ORDER BY m.fecha_inicio DESC
    `, [profesionalId]);

        res.json({
            success: true,
            clientes: clientes.map(c => ({
                ...c,
                minutos_audio: Math.round(c.minutos_audio || 0)
            }))
        });

    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error al cargar datos de clientes' });
    }
});

/**
 * POST /api/analytics/acceso
 * Registrar acceso a página/endpoint (para tracking general)
 */
router.post('/acceso', async (req, res) => {
    try {
        const { usuario_id, ruta, metodo = 'GET' } = req.body;
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.get('User-Agent');

        await pool.query(`
      INSERT INTO logs_acceso (usuario_id, ruta, metodo, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [usuario_id, ruta, metodo, ip_address, user_agent]);

        res.json({ success: true });

    } catch (error) {
        // No fallar la request si falla el logging
        console.error('Error al registrar acceso:', error);
        res.json({ success: false });
    }
});

export default router;
