// ============================================================================
// ENDPOINT DE DESARROLLO - LOGIN RÁPIDO
// Para testear diferentes usuarios sin autenticación real
// ============================================================================

import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

/**
 * POST /api/dev/login
 * Login de desarrollo para testear usuarios rápidamente
 * 
 * Body: { "email": "ana.martinez@test.com" }
 * 
 * IMPORTANTE: Este endpoint debe ser REMOVIDO en producción
 */
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email requerido',
                mensaje: 'Proporciona un email para autenticar'
            });
        }

        // Buscar usuario
        const [users] = await pool.query(`
      SELECT 
        u.*,
        r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      WHERE u.email = ? AND u.estado = 'ACTIVO'
      LIMIT 1
    `, [email]);

        if (users.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                mensaje: 'No existe un usuario activo con ese email',
                usuarios_disponibles: [
                    'ana.martinez@test.com (Nuevo - Semana 1)',
                    'bruno.silva@test.com (Avanzado - Semana 2-3)',
                    'carla.rojas@test.com (Finalizado - Semana 4)',
                    'david.lopez@clinica.com (Profesional)'
                ]
            });
        }

        const user = users[0];

        // Si es cliente, obtener matrícula activa
        if (user.rol_nombre === 'CLIENTE') {
            const [matriculas] = await pool.query(`
        SELECT 
          m.*,
          p.nombre as programa_nombre,
          p.dimension_principal,
          p.color_tema,
          DATEDIFF(CURDATE(), m.fecha_inicio) as dias_transcurridos,
          prof.nombre_completo as profesional_nombre
        FROM matriculas m
        JOIN programas p ON m.programa_id = p.id
        LEFT JOIN usuarios prof ON m.profesional_id = prof.id
        WHERE m.cliente_id = ? AND m.estado IN ('ACTIVO', 'COMPLETADO')
        ORDER BY m.fecha_inicio DESC
        LIMIT 1
      `, [user.id]);

            if (matriculas.length > 0) {
                const matricula = matriculas[0];

                // Obtener módulos desbloqueados
                const [modulos] = await pool.query(`
          SELECT 
            ms.numero_semana,
            ms.titulo,
            ms.dias_para_desbloqueo,
            DATEDIFF(CURDATE(), m.fecha_inicio) as dias_transcurridos,
            CASE 
              WHEN DATEDIFF(CURDATE(), m.fecha_inicio) >= ms.dias_para_desbloqueo 
              THEN TRUE 
              ELSE FALSE 
            END as desbloqueado,
            CASE 
              WHEN DATEDIFF(CURDATE(), m.fecha_inicio) < ms.dias_para_desbloqueo 
              THEN ms.dias_para_desbloqueo - DATEDIFF(CURDATE(), m.fecha_inicio)
              ELSE 0
            END as dias_restantes
          FROM modulos_semanales ms
          JOIN matriculas m ON ms.programa_id = m.programa_id
          WHERE m.id = ?
          ORDER BY ms.numero_semana
        `, [matricula.id]);

                // Estadísticas de progreso
                const [stats] = await pool.query(`
          SELECT 
            COUNT(DISTINCT lcm.recurso_id) as audios_escuchados,
            SUM(lcm.segundos_reproducidos) / 60 as minutos_audio,
            COUNT(DISTINCT gp.guia_id) as guias_iniciadas,
            COUNT(DISTINCT CASE WHEN gp.completado = TRUE THEN gp.guia_id END) as guias_completadas,
            COUNT(DISTINCT tr.id) as tests_realizados
          FROM matriculas m
          LEFT JOIN logs_consumo_media lcm ON m.id = lcm.matricula_id
          LEFT JOIN guia_progreso gp ON m.id = gp.matricula_id
          LEFT JOIN test_resultados tr ON m.id = tr.matricula_id
          WHERE m.id = ?
          GROUP BY m.id
        `, [matricula.id]);

                return res.json({
                    success: true,
                    dev_mode: true,
                    user: {
                        id: user.id,
                        nombre: user.nombre_completo,
                        email: user.email,
                        rol: user.rol_nombre,
                        avatar: user.avatar_url
                    },
                    matricula: {
                        id: matricula.id,
                        programa: matricula.programa_nombre,
                        dimension: matricula.dimension_principal,
                        colorTema: matricula.color_tema,
                        fechaInicio: matricula.fecha_inicio,
                        diasTranscurridos: matricula.dias_transcurridos,
                        estado: matricula.estado,
                        progresoGeneral: matricula.progreso_general,
                        profesional: matricula.profesional_nombre
                    },
                    modulosDesbloqueados: modulos,
                    estadisticas: stats[0] || {},
                    semanasDisponibles: modulos.filter(m => m.desbloqueado).length
                });
            }
        }

        // Si es profesional o no tiene matrícula
        return res.json({
            success: true,
            dev_mode: true,
            user: {
                id: user.id,
                nombre: user.nombre_completo,
                email: user.email,
                rol: user.rol_nombre,
                avatar: user.avatar_url
            }
        });

    } catch (error) {
        console.error('Error en dev/login:', error);
        res.status(500).json({
            error: 'Error en autenticación',
            mensaje: error.message
        });
    }
});

/**
 * GET /api/dev/users
 * Listar todos los usuarios disponibles para testing
 */
router.get('/users', async (req, res) => {
    try {
        const [users] = await pool.query(`
      SELECT 
        u.id,
        u.nombre_completo,
        u.email,
        r.nombre as rol,
        m.fecha_inicio,
        DATEDIFF(CURDATE(), m.fecha_inicio) as dias_transcurridos,
        m.estado as estado_matricula
      FROM usuarios u
      LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      LEFT JOIN matriculas m ON u.id = m.cliente_id
      WHERE u.estado = 'ACTIVO'
      ORDER BY u.nombre_completo
    `);

        res.json({
            success: true,
            usuarios: users,
            total: users.length
        });

    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/dev/reset-progress/:userId
 * Reiniciar progreso de un usuario (útil para testing)
 */
router.post('/reset-progress/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Eliminar progreso
        await pool.query('DELETE FROM logs_consumo_media WHERE matricula_id IN (SELECT id FROM matriculas WHERE cliente_id = ?)', [userId]);
        await pool.query('DELETE FROM guia_progreso WHERE matricula_id IN (SELECT id FROM matriculas WHERE cliente_id = ?)', [userId]);
        await pool.query('DELETE FROM test_resultados WHERE matricula_id IN (SELECT id FROM matriculas WHERE cliente_id = ?)', [userId]);

        // Resetear progreso general
        await pool.query('UPDATE matriculas SET progreso_general = 0 WHERE cliente_id = ?', [userId]);

        res.json({
            success: true,
            mensaje: 'Progreso reiniciado exitosamente'
        });

    } catch (error) {
        console.error('Error al reiniciar progreso:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
