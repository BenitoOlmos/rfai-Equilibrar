/**
 * PROFESSIONAL SERVICE - Analítica de Pacientes
 * 
 * Este servicio implementa la extracción de datos de uso para el rol Profesional.
 * 
 * Función principal: Obtener métricas de pacientes asignados:
 * - Tiempo de escucha de audios
 * - Avance en guías interactivas
 * - Comparativa de tests RFAI (inicial vs. reciente)
 */

import { pool } from '../config/db.js';

/**
 * Obtiene la lista de pacientes asignados a un profesional
 * @param {string} professionalId - ID del profesional
 * @returns {Promise<Array>} - Lista de pacientes con métricas básicas
 */
export async function getPacientesAsignados(professionalId) {
    const connection = await pool.getConnection();

    try {
        const [pacientes] = await connection.query(`
            SELECT 
                u.id,
                u.nombre_completo as nombre,
                u.email,
                u.avatar_url as avatar,
                p.nombre as programa,
                p.dimension_principal as dimension,
                m.id as matricula_id,
                m.fecha_inicio as fechaInicio,
                m.estado,
                m.progreso_general as progresoGeneral,
                DATEDIFF(CURDATE(), m.fecha_inicio) as diasTranscurridos,
                -- Calcular semana actual basado en días transcurridos
                CASE 
                    WHEN DATEDIFF(CURDATE(), m.fecha_inicio) >= 21 THEN 4
                    WHEN DATEDIFF(CURDATE(), m.fecha_inicio) >= 14 THEN 3
                    WHEN DATEDIFF(CURDATE(), m.fecha_inicio) >= 7 THEN 2
                    ELSE 1
                END as semanaActual
            FROM matriculas m
            JOIN usuarios u ON m.cliente_id = u.id
            JOIN programas p ON m.programa_id = p.id
            WHERE m.profesional_id = ? 
            AND m.estado IN ('ACTIVO', 'COMPLETADO')
            ORDER BY m.fecha_inicio DESC
        `, [professionalId]);

        return pacientes;
    } finally {
        connection.release();
    }
}

/**
 * Obtiene las métricas detalladas de un paciente específico
 * @param {string} pacienteId - ID del paciente
 * @param {string} matriculaId - ID de la matrícula
 * @returns {Promise<Object>} - Métricas completas del paciente
 */
export async function getMetricasPaciente(pacienteId, matriculaId) {
    const connection = await pool.getConnection();

    try {
        // =====================================================================
        // 1. TIEMPO DE ESCUCHA POR SEMANA
        // =====================================================================
        const [audioMetrics] = await connection.query(`
            SELECT 
                r.semana,
                r.id as recurso_id,
                r.titulo as recurso_titulo,
                COUNT(DISTINCT lcm.id) as vecesEscuchado,
                SUM(lcm.segundos_reproducidos) as segundosTotales,
                ROUND(SUM(lcm.segundos_reproducidos) / 60, 1) as minutosTotales,
                MAX(lcm.fecha_reproduccion) as ultimaEscucha
            FROM logs_consumo_media lcm
            JOIN recursos r ON lcm.recurso_id = r.id
            WHERE lcm.matricula_id = ? AND r.tipo = 'AUDIO'
            GROUP BY r.semana, r.id, r.titulo
            ORDER BY r.semana, r.id
        `, [matriculaId]);

        // Agrupar por semana
        const tiempoEscuchaPorSemana = {};
        audioMetrics.forEach(audio => {
            if (!tiempoEscuchaPorSemana[audio.semana]) {
                tiempoEscuchaPorSemana[audio.semana] = {
                    semana: audio.semana,
                    audios: [],
                    minutosTotal: 0,
                    audioCount: 0
                };
            }
            tiempoEscuchaPorSemana[audio.semana].audios.push({
                id: audio.recurso_id,
                titulo: audio.recurso_titulo,
                vecesEscuchado: audio.vecesEscuchado,
                minutos: audio.minutosTotales,
                ultimaEscucha: audio.ultimaEscucha
            });
            tiempoEscuchaPorSemana[audio.semana].minutosTotal += audio.minutosTotales;
            tiempoEscuchaPorSemana[audio.semana].audioCount++;
        });

        // =====================================================================
        // 2. AVANCE DE GUÍAS INTERACTIVAS
        // =====================================================================
        const [guiaProgress] = await connection.query(`
            SELECT 
                g.semana,
                g.titulo as guiaTitulo,
                gp.paso_actual,
                gp.pasos_totales,
                gp.porcentaje_completado,
                gp.completado,
                gp.fecha_ultima_actualizacion as ultimaActualizacion
            FROM guia_progreso gp
            JOIN guias g ON gp.guia_id = g.id
            WHERE gp.matricula_id = ?
            ORDER BY g.semana
        `, [matriculaId]);

        const avanceGuias = {};
        guiaProgress.forEach(guia => {
            avanceGuias[guia.semana] = {
                titulo: guia.guiaTitulo,
                pasoActual: guia.paso_actual,
                pasosTotales: guia.pasos_totales,
                porcentaje: guia.porcentaje_completado || 0,
                completado: Boolean(guia.completado),
                ultimaActualizacion: guia.ultimaActualizacion
            };
        });

        // =====================================================================
        // 3. RESULTADOS RFAI (INICIAL VS RECIENTE)
        // =====================================================================
        const [testResults] = await connection.query(`
            SELECT 
                semana,
                resultados_json,
                fecha_realizacion,
                ROW_NUMBER() OVER (PARTITION BY semana ORDER BY fecha_realizacion ASC) as es_primero,
                ROW_NUMBER() OVER (PARTITION BY semana ORDER BY fecha_realizacion DESC) as es_ultimo
            FROM test_resultados
            WHERE matricula_id = ?
            ORDER BY semana, fecha_realizacion
        `, [matriculaId]);

        // Procesar resultados: comparar inicial vs más reciente
        const comparativaTests = {};
        testResults.forEach(test => {
            const semana = test.semana;
            const scores = JSON.parse(test.resultados_json || '{}');

            if (!comparativaTests[semana]) {
                comparativaTests[semana] = {
                    semana,
                    inicial: null,
                    reciente: null,
                    mejora: {}
                };
            }

            if (test.es_primero === 1) {
                comparativaTests[semana].inicial = {
                    fecha: test.fecha_realizacion,
                    scores
                };
            }

            if (test.es_ultimo === 1) {
                comparativaTests[semana].reciente = {
                    fecha: test.fecha_realizacion,
                    scores
                };
            }
        });

        // Calcular mejora/cambio
        Object.values(comparativaTests).forEach(comp => {
            if (comp.inicial && comp.reciente) {
                const scoresIniciales = comp.inicial.scores;
                const scoresRecientes = comp.reciente.scores;

                Object.keys(scoresRecientes).forEach(dimension => {
                    if (scoresIniciales[dimension]) {
                        const cambio = scoresRecientes[dimension] - scoresIniciales[dimension];
                        const porcentajeCambio = ((cambio / scoresIniciales[dimension]) * 100).toFixed(1);

                        comp.mejora[dimension] = {
                            inicial: scoresIniciales[dimension],
                            reciente: scoresRecientes[dimension],
                            cambio,
                            porcentajeCambio: parseFloat(porcentajeCambio)
                        };
                    }
                });
            }
        });

        // =====================================================================
        // 4. ESTADÍSTICAS GENERALES
        // =====================================================================
        const [generalStats] = await connection.query(`
            SELECT 
                COUNT(DISTINCT CASE WHEN r.tipo = 'AUDIO' THEN lcm.recurso_id END) as audiosUnicos,
                SUM(CASE WHEN r.tipo = 'AUDIO' THEN lcm.segundos_reproducidos ELSE 0 END) / 60 as minutosAudioTotales,
                COUNT(DISTINCT tr.id) as testsRealizados,
                COUNT(DISTINCT CASE WHEN gp.completado = TRUE THEN gp.guia_id END) as guiasCompletadas,
                MAX(lcm.fecha_reproduccion) as ultimaActividad
            FROM matriculas m
            LEFT JOIN logs_consumo_media lcm ON m.id = lcm.matricula_id
            LEFT JOIN recursos r ON lcm.recurso_id = r.id
            LEFT JOIN test_resultados tr ON m.id = tr.matricula_id
            LEFT JOIN guia_progreso gp ON m.id = gp.matricula_id
            WHERE m.id = ?
            GROUP BY m.id
        `, [matriculaId]);

        // =====================================================================
        // 5. ENSAMBLAR RESPUESTA COMPLETA
        // =====================================================================
        return {
            pacienteId,
            matriculaId,
            tiempoEscucha: Object.values(tiempoEscuchaPorSemana),
            avanceGuias,
            comparativaTests: Object.values(comparativaTests),
            estadisticas: generalStats[0] || {
                audiosUnicos: 0,
                minutosAudioTotales: 0,
                testsRealizados: 0,
                guiasCompletadas: 0,
                ultimaActividad: null
            }
        };

    } finally {
        connection.release();
    }
}

/**
 * Obtiene un resumen rápido de todos los pacientes (para la vista de lista)
 * @param {string} professionalId - ID del profesional
 * @returns {Promise<Array>} - Array de pacientes con métricas resumidas
 */
export async function getResumenPacientes(professionalId) {
    const connection = await pool.getConnection();

    try {
        const [resumen] = await connection.query(`
            SELECT 
                u.id as pacienteId,
                u.nombre_completo as nombre,
                u.email,
                p.nombre as programa,
                m.id as matriculaId,
                m.fecha_inicio,
                m.progreso_general,
                -- Audio stats
                COUNT(DISTINCT CASE WHEN r.tipo = 'AUDIO' THEN lcm.recurso_id END) as audiosEscuchados,
                ROUND(SUM(CASE WHEN r.tipo = 'AUDIO' THEN lcm.segundos_reproducidos ELSE 0 END) / 60, 0) as minutosAudio,
                -- Test stats
                COUNT(DISTINCT tr.semana) as semanasConTest,
                -- Última actividad
                GREATEST(
                    COALESCE(MAX(lcm.fecha_reproduccion), '1970-01-01'),
                    COALESCE(MAX(tr.fecha_realizacion), '1970-01-01'),
                    COALESCE(MAX(gp.fecha_ultima_actualizacion), '1970-01-01')
                ) as ultimaActividad
            FROM matriculas m
            JOIN usuarios u ON m.cliente_id = u.id
            JOIN programas p ON m.programa_id = p.id
            LEFT JOIN logs_consumo_media lcm ON m.id = lcm.matricula_id
            LEFT JOIN recursos r ON lcm.recurso_id = r.id
            LEFT JOIN test_resultados tr ON m.id = tr.matricula_id
            LEFT JOIN guia_progreso gp ON m.id = gp.matricula_id
            WHERE m.profesional_id = ? AND m.estado IN ('ACTIVO', 'COMPLETADO')
            GROUP BY u.id, u.nombre_completo, u.email, p.nombre, m.id, m.fecha_inicio, m.progreso_general
            ORDER BY ultimaActividad DESC
        `, [professionalId]);

        return resumen;
    } finally {
        connection.release();
    }
}

export default {
    getPacientesAsignados,
    getMetricasPaciente,
    getResumenPacientes
};
