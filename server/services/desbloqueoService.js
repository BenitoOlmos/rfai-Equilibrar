import { pool } from '../config/db.js';

/**
 * Servicio de Desbloqueo Temporal
 * Calcula si un módulo/recurso está desbloqueado basado en días desde fecha_inicio
 */

/**
 * Verifica si un módulo está desbloqueado para una matrícula específica
 * @param {number} matriculaId - ID de la matrícula
 * @param {number} moduloId - ID del módulo a verificar
 * @returns {Promise<Object>} { desbloqueado: boolean, diasRestantes: number, fechaDesbloqueo: Date }
 */
export async function verificarAccesoModulo(matriculaId, moduloId) {
    try {
        const [result] = await pool.query(`
      SELECT 
        m.fecha_inicio,
        ms.dias_para_desbloqueo,
        ms.numero_semana,
        ms.titulo,
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
        END as dias_restantes,
        DATE_ADD(m.fecha_inicio, INTERVAL ms.dias_para_desbloqueo DAY) as fecha_desbloqueo
      FROM matriculas m
      JOIN modulos_semanales ms ON m.programa_id = ms.programa_id
      WHERE m.id = ? AND ms.id = ? AND m.estado = 'ACTIVO'
    `, [matriculaId, moduloId]);

        if (result.length === 0) {
            throw new Error('Matrícula o módulo no encontrado');
        }

        return result[0];
    } catch (error) {
        console.error('Error en verificarAccesoModulo:', error);
        throw error;
    }
}

/**
 * Verifica si un recurso específico está desbloqueado
 * @param {number} matriculaId - ID de la matrícula
 * @param {number} recursoId - ID del recurso
 * @returns {Promise<Object>}
 */
export async function verificarAccesoRecurso(matriculaId, recursoId) {
    try {
        const [result] = await pool.query(`
      SELECT 
        r.id as recurso_id,
        r.tipo,
        r.titulo,
        ms.numero_semana,
        m.fecha_inicio,
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
        END as dias_restantes,
        DATE_ADD(m.fecha_inicio, INTERVAL ms.dias_para_desbloqueo DAY) as fecha_desbloqueo
      FROM recursos r
      JOIN modulos_semanales ms ON r.modulo_id = ms.id
      JOIN programas p ON ms.programa_id = p.id
      JOIN matriculas m ON m.programa_id = p.id
      WHERE m.id = ? AND r.id = ? AND m.estado = 'ACTIVO' AND r.activo = TRUE
    `, [matriculaId, recursoId]);

        if (result.length === 0) {
            throw new Error('Recurso no encontrado o matrícula inactiva');
        }

        return result[0];
    } catch (error) {
        console.error('Error en verificarAccesoRecurso:', error);
        throw error;
    }
}

/**
 * Obtiene todos los módulos de una matrícula con su estado de desbloqueo
 * @param {number} matriculaId - ID de la matrícula
 * @returns {Promise<Array>}
 */
export async function obtenerModulosConEstado(matriculaId) {
    try {
        const [modulos] = await pool.query(`
      SELECT 
        ms.id,
        ms.numero_semana,
        ms.titulo,
        ms.descripcion,
        ms.dias_para_desbloqueo,
        m.fecha_inicio,
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
        END as dias_restantes,
        DATE_ADD(m.fecha_inicio, INTERVAL ms.dias_para_desbloqueo DAY) as fecha_desbloqueo
      FROM modulos_semanales ms
      JOIN matriculas m ON ms.programa_id = m.programa_id
      WHERE m.id = ? AND m.estado = 'ACTIVO'
      ORDER BY ms.numero_semana
    `, [matriculaId]);

        return modulos;
    } catch (error) {
        console.error('Error en obtenerModulosConEstado:', error);
        throw error;
    }
}

/**
 * Obtiene todos los recursos de una matrícula con estado de desbloqueo
 * @param {number} matriculaId - ID de la matrícula
 * @param {string} tipoRecurso - Filtrar por tipo (opcional)
 * @returns {Promise<Array>}
 */
export async function obtenerRecursosConEstado(matriculaId, tipoRecurso = null) {
    try {
        let query = `
      SELECT 
        r.id,
        r.tipo,
        r.slug,
        r.titulo,
        r.descripcion,
        r.url_recurso,
        r.duracion_minutos,
        r.metadata,
        r.obligatorio,
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
        CASE 
          WHEN DATEDIFF(CURDATE(), m.fecha_inicio) < ms.dias_para_desbloqueo 
          THEN ms.dias_para_desbloqueo - DATEDIFF(CURDATE(), m.fecha_inicio)
          ELSE 0
        END as dias_restantes,
        DATE_ADD(m.fecha_inicio, INTERVAL ms.dias_para_desbloqueo DAY) as fecha_desbloqueo
      FROM recursos r
      JOIN modulos_semanales ms ON r.modulo_id = ms.id
      JOIN programas p ON ms.programa_id = p.id
      JOIN matriculas m ON m.programa_id = p.id
      WHERE m.id = ? AND m.estado = 'ACTIVO' AND r.activo = TRUE
    `;

        const params = [matriculaId];

        if (tipoRecurso) {
            query += ` AND r.tipo = ?`;
            params.push(tipoRecurso);
        }

        query += ` ORDER BY ms.numero_semana, r.orden`;

        const [recursos] = await pool.query(query, params);

        return recursos;
    } catch (error) {
        console.error('Error en obtenerRecursosConEstado:', error);
        throw error;
    }
}

/**
 * Calcula el progreso general de una matrícula
 * @param {number} matriculaId - ID de la matrícula
 * @returns {Promise<Object>}
 */
export async function calcularProgresoGeneral(matriculaId) {
    try {
        // Total de recursos obligatorios
        const [totalRecursos] = await pool.query(`
      SELECT COUNT(*) as total
      FROM recursos r
      JOIN modulos_semanales ms ON r.modulo_id = ms.id
      JOIN matriculas m ON ms.programa_id = m.programa_id
      WHERE m.id = ? AND r.obligatorio = TRUE AND r.activo = TRUE
    `, [matriculaId]);

        // Recursos completados (guías, tests)
        const [recursosCompletados] = await pool.query(`
      SELECT COUNT(DISTINCT gp.guia_id) as guias_completadas
      FROM guia_progreso gp
      WHERE gp.matricula_id = ? AND gp.completado = TRUE
      
      UNION ALL
      
      SELECT COUNT(*) as tests_completados
      FROM test_resultados tr
      WHERE tr.matricula_id = ?
    `, [matriculaId, matriculaId]);

        const total = totalRecursos[0]?.total || 0;
        const completados = recursosCompletados.reduce((sum, row) => sum + (Object.values(row)[0] || 0), 0);
        const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;

        return {
            total_recursos: total,
            recursos_completados: completados,
            porcentaje_progreso: porcentaje
        };
    } catch (error) {
        console.error('Error en calcularProgresoGeneral:', error);
        throw error;
    }
}

export default {
    verificarAccesoModulo,
    verificarAccesoRecurso,
    obtenerModulosConEstado,
    obtenerRecursosConEstado,
    calcularProgresoGeneral
};
