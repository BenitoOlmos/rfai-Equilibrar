/**
 * DASHBOARD SERVICE - Agregador de Perfil
 * 
 * Este servicio implementa "Reverse Engineering" desde la base de datos SQL
 * hacia la interfaz ClientProfile del Frontend (types.ts).
 * 
 * Función principal: Calcular el progreso real de cada usuario basado en:
 * - Fecha de inicio (drip content logic)
 * - Consumo de audios
 * - Tests completados
 * - Guías trabajadas
 */

import { pool } from '../config/db.js';

/**
 * Calcula el progreso completo de un cliente
 * @param {string} userId - ID del usuario cliente
 * @returns {Promise<Object>} - ClientProfile completo
 */
export async function getClientProfile(userId) {
    const connection = await pool.getConnection();

    try {
        // =====================================================================
        // 1. OBTENER DATOS BÁSICOS DEL USUARIO Y MATRÍCULA
        // =====================================================================
        const [users] = await connection.query(`
            SELECT 
                u.id,
                u.nombre_completo as name,
                u.email,
                u.avatar_url as avatar,
                u.estado as status,
                r.nombre as role
            FROM usuarios u
            LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
            LEFT JOIN roles r ON ur.rol_id = r.id
            WHERE u.id = ? AND u.estado = 'ACTIVO'
            LIMIT 1
        `, [userId]);

        if (users.length === 0) {
            throw new Error('Usuario no encontrado');
        }

        const user = users[0];

        // =====================================================================
        // 2. OBTENER MATRÍCULA ACTIVA
        // =====================================================================
        const [matriculas] = await connection.query(`
            SELECT 
                m.id,
                m.fecha_inicio as startDate,
                m.estado,
                p.dimension_principal as program,
                p.nombre as programName,
                DATEDIFF(CURDATE(), m.fecha_inicio) as diasTranscurridos
            FROM matriculas m
            JOIN programas p ON m.programa_id = p.id
            WHERE m.cliente_id = ? AND m.estado = 'ACTIVO'
            ORDER BY m.fecha_inicio DESC
            LIMIT 1
        `, [userId]);

        if (matriculas.length === 0) {
            throw new Error('No hay matrícula activa para este usuario');
        }

        const matricula = matriculas[0];

        // =====================================================================
        // 3. CALCULAR SEMANAS DESBLOQUEADAS (DRIP CONTENT LOGIC)
        // =====================================================================
        const [modulos] = await connection.query(`
            SELECT 
                ms.numero_semana,
                ms.dias_para_desbloqueo,
                CASE 
                    WHEN ? >= ms.dias_para_desbloqueo THEN TRUE 
                    ELSE FALSE 
                END as desbloqueado
            FROM modulos_semanales ms
            WHERE ms.programa_id = (SELECT programa_id FROM matriculas WHERE id = ?)
            ORDER BY ms.numero_semana
        `, [matricula.diasTranscurridos, matricula.id]);

        // =====================================================================
        // 4. OBTENER ESTADÍSTICAS DE AUDIOS POR SEMANA
        // =====================================================================
        const [audioStats] = await connection.query(`
            SELECT 
                r.semana,
                COUNT(DISTINCT lcm.recurso_id) as audioCount,
                SUM(lcm.segundos_reproducidos) as totalSeconds
            FROM logs_consumo_media lcm
            JOIN recursos r ON lcm.recurso_id = r.id
            WHERE lcm.matricula_id = ? AND r.tipo = 'AUDIO'
            GROUP BY r.semana
        `, [matricula.id]);

        const audiosBySemana = {};
        audioStats.forEach(stat => {
            audiosBySemana[stat.semana] = {
                count: stat.audioCount,
                seconds: stat.totalSeconds || 0
            };
        });

        // =====================================================================
        // 5. OBTENER TESTS COMPLETADOS
        // =====================================================================
        const [tests] = await connection.query(`
            SELECT 
                semana,
                resultados_json,
                fecha_realizacion
            FROM test_resultados
            WHERE matricula_id = ?
            ORDER BY semana, fecha_realizacion DESC
        `, [matricula.id]);

        const testsBySemana = {};
        tests.forEach(test => {
            testsBySemana[test.semana] = {
                done: true,
                date: test.fecha_realizacion,
                scores: JSON.parse(test.resultados_json || '{}')
            };
        });

        // =====================================================================
        // 6. OBTENER PROGRESO DE GUÍAS
        // =====================================================================
        const [guias] = await connection.query(`
            SELECT 
                g.semana,
                gp.completado,
                gp.porcentaje_completado
            FROM guia_progreso gp
            JOIN guias g ON gp.guia_id = g.id
            WHERE gp.matricula_id = ?
        `, [matricula.id]);

        const guiasBySemana = {};
        guias.forEach(guia => {
            guiasBySemana[guia.semana] = {
                completed: guia.completado,
                percentage: guia.porcentaje_completado || 0
            };
        });

        // =====================================================================
        // 7. CONSTRUIR OBJETO PROGRESS (REVERSE ENGINEERING)
        // =====================================================================
        const progress = {};

        for (let i = 1; i <= 4; i++) {
            const modulo = modulos.find(m => m.numero_semana === i);
            const isLocked = modulo ? !modulo.desbloqueado : true;
            const audioData = audiosBySemana[i] || { count: 0, seconds: 0 };
            const testData = testsBySemana[i];
            const guiaData = guiasBySemana[i];

            // Determinar si la semana está completada
            // Criterio: Test hecho + Guía completada + Al menos 1 audio escuchado
            const isCompleted = !isLocked &&
                testData?.done &&
                guiaData?.completed &&
                audioData.count > 0;

            progress[`week${i}`] = {
                isLocked,
                isCompleted,
                initialTestDone: testData?.done || false,
                guideCompleted: guiaData?.completed || false,
                audioListened: audioData.count,
                meetingAttended: false // TODO: Implementar lógica de reuniones si existe
            };
        }

        // =====================================================================
        // 8. CALCULAR SEMANA ACTUAL
        // =====================================================================
        let currentWeek = 1;
        for (let i = 1; i <= 4; i++) {
            if (!progress[`week${i}`].isLocked) {
                currentWeek = i;
            }
        }

        // =====================================================================
        // 9. OBTENER HISTÓRICO DE TESTS (para clinicalData)
        // =====================================================================
        const testScores = tests.map(test => ({
            date: test.fecha_realizacion,
            week: test.semana,
            scores: JSON.parse(test.resultados_json || '{}')
        }));

        // =====================================================================
        // 10. OBTENER USO DE AUDIOS (para clinicalData)
        // =====================================================================
        const [audioUsage] = await connection.query(`
            SELECT 
                DATE(lcm.fecha_reproduccion) as date,
                SUM(lcm.segundos_reproducidos) / 60 as minutesListened,
                lcm.recurso_id as audioId
            FROM logs_consumo_media lcm
            JOIN recursos r ON lcm.recurso_id = r.id
            WHERE lcm.matricula_id = ? AND r.tipo = 'AUDIO'
            GROUP BY DATE(lcm.fecha_reproduccion), lcm.recurso_id
            ORDER BY date DESC
        `, [matricula.id]);

        const audioUsageStats = audioUsage.map(stat => ({
            date: stat.date,
            minutesListened: Math.round(stat.minutesListened),
            audioId: stat.audioId
        }));

        // =====================================================================
        // 11. ENSAMBLAR CLIENTPROFILE COMPLETO
        // =====================================================================
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'CLIENT',
            avatar: user.avatar || 'https://picsum.photos/200/200?random=1',
            status: user.status === 'ACTIVO' ? 'ACTIVE' : 'INACTIVE',
            currentWeek: currentWeek, // 1, 2, 3, or 4
            startDate: matricula.startDate,
            nextSession: calculateNextSession(matricula.startDate, currentWeek),
            program: matricula.program.toUpperCase(), // 'CULPA' o 'ANGUSTIA'
            progress,
            clinicalData: {
                testScores,
                audioUsage: audioUsageStats
            }
        };

    } finally {
        connection.release();
    }
}

/**
 * Calcula la fecha de la próxima sesión
 * @param {string} startDate - Fecha de inicio
 * @param {number} currentWeek - Semana actual
 * @returns {string} - ISO String de la próxima sesión
 */
function calculateNextSession(startDate, currentWeek) {
    const start = new Date(startDate);
    const nextSessionWeek = Math.min(currentWeek + 1, 4);
    const daysToAdd = (nextSessionWeek - 1) * 7;

    const nextSession = new Date(start);
    nextSession.setDate(nextSession.getDate() + daysToAdd);

    return nextSession.toISOString();
}

export default {
    getClientProfile
};
