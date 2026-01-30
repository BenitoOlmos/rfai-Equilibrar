import express from 'express';
import { pool } from '../config/db.js';
import { checkWeekAccess } from '../middleware/checkWeekAccess.js';
import { obtenerRecursosConEstado } from '../services/desbloqueoService.js';

const router = express.Router();

/**
 * GET /api/recursos/matricula/:matriculaId
 * Obtener todos los recursos de una matrícula con estado de desbloqueo
 */
router.get('/matricula/:matriculaId', async (req, res) => {
    try {
        const { matriculaId } = req.params;
        const { tipo } = req.query; // Filtro opcional por tipo

        const recursos = await obtenerRecursosConEstado(matriculaId, tipo);

        res.json({
            success: true,
            recursos
        });

    } catch (error) {
        console.error('Error al obtener recursos:', error);
        res.status(500).json({ error: 'Error al cargar recursos' });
    }
});

/**
 * GET /api/recursos/:recursoId
 * Obtener detalles de un recurso específico
 * ⭐ Protegido por checkWeekAccess - verifica desbloqueo temporal
 */
router.get('/:recursoId', checkWeekAccess, async (req, res) => {
    try {
        const { recursoId } = req.params;

        const [recursos] = await pool.query(`
      SELECT 
        r.*,
        ms.numero_semana,
        ms.titulo as semana_titulo,
        p.nombre as programa_nombre,
        p.dimension_principal
      FROM recursos r
      JOIN modulos_semanales ms ON r.modulo_id = ms.id
      JOIN programas p ON ms.programa_id = p.id
      WHERE r.id = ? AND r.activo = TRUE
    `, [recursoId]);

        if (recursos.length === 0) {
            return res.status(404).json({
                error: 'Recurso no encontrado'
            });
        }

        const recurso = recursos[0];

        // Metadata puede contener configuraciones específicas del tipo
        if (recurso.metadata) {
            try {
                recurso.metadata = JSON.parse(recurso.metadata);
            } catch (e) {
                console.error('Error parsing metadata:', e);
            }
        }

        res.json({
            success: true,
            recurso,
            acceso: req.accesoInfo // Info del middleware checkWeekAccess
        });

    } catch (error) {
        console.error('Error al obtener recurso:', error);
        res.status(500).json({ error: 'Error al cargar recurso' });
    }
});

/**
 * GET /api/recursos/audio/:recursoId/stream
 * Stream de audio (protegido por desbloqueo temporal)
 */
router.get('/audio/:recursoId/stream', checkWeekAccess, async (req, res) => {
    try {
        const { recursoId } = req.params;

        // Verificar que sea tipo AUDIO
        const [recursos] = await pool.query(`
      SELECT url_recurso, tipo 
      FROM recursos 
      WHERE id = ? AND tipo = 'AUDIO'
    `, [recursoId]);

        if (recursos.length === 0) {
            return res.status(404).json({
                error: 'Audio no encontrado'
            });
        }

        const { url_recurso } = recursos[0];

        // En producción, aquí se puede:
        // 1. Servir desde filesystem local
        // 2. Redirigir a CDN (Cloudinary, S3)
        // 3. Proxy a storage externo

        res.json({
            success: true,
            audio_url: url_recurso,
            instrucciones: 'Usar esta URL en el reproductor del frontend'
        });

    } catch (error) {
        console.error('Error al obtener audio:', error);
        res.status(500).json({ error: 'Error al acceder al audio' });
    }
});

/**
 * GET /api/recursos/meet/:recursoId/enlace
 * Obtener enlace de Google Meet (solo si está desbloqueado)
 */
router.get('/meet/:recursoId/enlace', checkWeekAccess, async (req, res) => {
    try {
        const { recursoId } = req.params;

        const [recursos] = await pool.query(`
      SELECT url_recurso, metadata, titulo
      FROM recursos 
      WHERE id = ? AND tipo = 'VIDEO_MEET'
    `, [recursoId]);

        if (recursos.length === 0) {
            return res.status(404).json({
                error: 'Enlace de reunión no encontrado'
            });
        }

        const { url_recurso, metadata, titulo } = recursos[0];

        let parsedMetadata = {};
        if (metadata) {
            try {
                parsedMetadata = JSON.parse(metadata);
            } catch (e) { }
        }

        res.json({
            success: true,
            meet: {
                url: url_recurso,
                titulo,
                fecha_programada: parsedMetadata.fecha_programada,
                duracion_minutos: parsedMetadata.duracion_minutos
            }
        });

    } catch (error) {
        console.error('Error al obtener enlace Meet:', error);
        res.status(500).json({ error: 'Error al acceder a la reunión' });
    }
});

/**
 * GET /api/recursos/semana/:semana/matricula/:matriculaId
 * Obtener recursos de una semana específica
 */
router.get('/semana/:semana/matricula/:matriculaId', async (req, res) => {
    try {
        const { semana, matriculaId } = req.params;

        const [recursos] = await pool.query(`
      SELECT 
        r.*,
        ms.numero_semana,
        ms.titulo as semana_titulo,
        ms.dias_para_desbloqueo,
        m.fecha_inicio,
        DATEDIFF(CURDATE(), m.fecha_inicio) as dias_transcurridos,
        CASE 
          WHEN DATEDIFF(CURDATE(), m.fecha_inicio) >= ms.dias_para_desbloqueo 
          THEN TRUE 
          ELSE FALSE 
        END as desbloqueado
      FROM recursos r
      JOIN modulos_semanales ms ON r.modulo_id = ms.id
      JOIN matriculas m ON ms.programa_id = m.programa_id
      WHERE ms.numero_semana = ? AND m.id = ? AND r.activo = TRUE
      ORDER BY r.orden
    `, [semana, matriculaId]);

        res.json({
            success: true,
            semana: parseInt(semana),
            recursos
        });

    } catch (error) {
        console.error('Error al obtener recursos de semana:', error);
        res.status(500).json({ error: 'Error al cargar recursos' });
    }
});

export default router;
