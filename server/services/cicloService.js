// Ciclo Service - Business Logic for Treatment Cycles

import { pool } from './db.js';

/**
 * Completa una sesión y desbloquea materiales correspondientes
 * @param {number} citaId - ID de la cita a completar
 * @param {string} notasSesion - Notas opcionales del profesional
 * @returns {Promise<Object>} Resultado con materiales desbloqueados
 */
export async function completarSesion(citaId, notasSesion = null) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Obtener detalles de la cita
        const [citas] = await connection.query(
            `SELECT c.*, ct.dimension, ct.client_id 
       FROM citas c 
       JOIN ciclos_tratamiento ct ON c.ciclo_id = ct.id 
       WHERE c.id = ?`,
            [citaId]
        );

        if (citas.length === 0) {
            throw new Error('Cita no encontrada');
        }

        const cita = citas[0];

        // 2. Verificar prerequisitos (Si es Sesión 2, validar que Sesión 1 esté completa)
        if (cita.numero_sesion === '2') {
            const [sesion1] = await connection.query(
                `SELECT estado FROM citas 
         WHERE ciclo_id = ? AND numero_sesion = '1'`,
                [cita.ciclo_id]
            );

            if (sesion1.length === 0 || sesion1[0].estado !== 'REALIZADO') {
                throw new Error('La Sesión 1 debe estar completada antes de realizar la Sesión 2');
            }
        }

        // 3. Marcar sesión como realizada
        await connection.query(
            `UPDATE citas 
       SET estado = 'REALIZADO', 
           fecha_realizada = NOW(), 
           notas_sesion = ? 
       WHERE id = ?`,
            [notasSesion, citaId]
        );

        // 4. Desbloquear materiales según número de sesión
        let materialesDesbloqueados = [];

        if (cita.numero_sesion === '1') {
            materialesDesbloqueados = await desbloquearMaterialesSesion1(
                connection,
                cita.ciclo_id,
                cita.dimension
            );
        } else if (cita.numero_sesion === '2') {
            materialesDesbloqueados = await desbloquearMaterialesSesion2(
                connection,
                cita.ciclo_id,
                cita.dimension
            );

            // Cerrar el ciclo
            await connection.query(
                `UPDATE ciclos_tratamiento 
         SET estado = 'COMPLETADO', fecha_cierre = NOW() 
         WHERE id = ?`,
                [cita.ciclo_id]
            );
        }

        await connection.commit();

        return {
            success: true,
            sesionCompletada: cita.numero_sesion,
            materialesDesbloqueados,
            cicloCompleto: cita.numero_sesion === '2'
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Desbloquea Audio de Reprogramación y Test Intermedio tras Sesión 1
 */
async function desbloquearMaterialesSesion1(connection, cicloId, dimension) {
    // Obtener materiales que requieren Sesión 1
    const [materiales] = await connection.query(
        `SELECT * FROM materiales 
     WHERE dimension IN (?, 'AMBOS') 
     AND prerequisito = 'SESION_1'
     AND activo = TRUE`,
        [dimension]
    );

    const materialesDesbloqueados = [];

    for (const material of materiales) {
        // Crear o actualizar acceso
        await connection.query(
            `INSERT INTO acceso_materiales (ciclo_id, material_id, desbloqueado_en) 
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE desbloqueado_en = NOW()`,
            [cicloId, material.id]
        );

        materialesDesbloqueados.push({
            id: material.id,
            tipo: material.tipo,
            titulo: material.titulo
        });
    }

    return materialesDesbloqueados;
}

/**
 * Desbloquea Guía de Mantenimiento tras Sesión 2
 */
async function desbloquearMaterialesSesion2(connection, cicloId, dimension) {
    const [materiales] = await connection.query(
        `SELECT * FROM materiales 
     WHERE dimension IN (?, 'AMBOS') 
     AND prerequisito = 'SESION_2'
     AND activo = TRUE`,
        [dimension]
    );

    const materialesDesbloqueados = [];

    for (const material of materiales) {
        await connection.query(
            `INSERT INTO acceso_materiales (ciclo_id, material_id, desbloqueado_en) 
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE desbloqueado_en = NOW()`,
            [cicloId, material.id]
        );

        materialesDesbloqueados.push({
            id: material.id,
            tipo: material.tipo,
            titulo: material.titulo
        });
    }

    return materialesDesbloqueados;
}

/**
 * Obtiene el ciclo activo de un cliente
 */
export async function obtenerCicloActivo(clientId) {
    const [ciclos] = await pool.query(
        `SELECT ct.*, 
            (SELECT COUNT(*) FROM citas WHERE ciclo_id = ct.id AND estado = 'REALIZADO') as sesiones_completadas
     FROM ciclos_tratamiento ct
     WHERE client_id = ? AND estado = 'ACTIVO'
     ORDER BY fecha_inicio DESC
     LIMIT 1`,
        [clientId]
    );

    if (ciclos.length === 0) {
        return null;
    }

    const ciclo = ciclos[0];

    // Obtener citas del ciclo
    const [citas] = await pool.query(
        `SELECT * FROM citas WHERE ciclo_id = ? ORDER BY numero_sesion`,
        [ciclo.id]
    );

    // Obtener materiales con estado de acceso
    const [materiales] = await pool.query(
        `SELECT m.*, 
            am.desbloqueado_en,
            am.completado_en,
            am.progreso_porcentaje,
            CASE WHEN am.desbloqueado_en IS NOT NULL THEN TRUE ELSE FALSE END as desbloqueado
     FROM materiales m
     LEFT JOIN acceso_materiales am ON m.id = am.material_id AND am.ciclo_id = ?
     WHERE m.dimension IN (?, 'AMBOS') AND m.activo = TRUE
     ORDER BY m.orden_visualizacion`,
        [ciclo.id, ciclo.dimension]
    );

    return {
        ...ciclo,
        citas,
        materiales
    };
}

/**
 * Crea un nuevo ciclo de tratamiento
 */
export async function crearNuevoCiclo(clientId, dimension, profesionalId = null) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar que no hay otro ciclo activo para esta dimensión
        const [ciclosActivos] = await connection.query(
            `SELECT id FROM ciclos_tratamiento 
       WHERE client_id = ? AND dimension = ? AND estado = 'ACTIVO'`,
            [clientId, dimension]
        );

        if (ciclosActivos.length > 0) {
            throw new Error(`Ya existe un ciclo activo de ${dimension} para este cliente`);
        }

        // Crear ciclo
        const [result] = await connection.query(
            `INSERT INTO ciclos_tratamiento (client_id, dimension, fecha_inicio, profesional_id) 
       VALUES (?, ?, CURDATE(), ?)`,
            [clientId, dimension, profesionalId]
        );

        const cicloId = result.insertId;

        // Desbloquear Test Inicial automáticamente
        const [testInicial] = await connection.query(
            `SELECT id FROM materiales 
       WHERE tipo = 'TEST_INICIAL' AND dimension = ? AND activo = TRUE
       LIMIT 1`,
            [dimension]
        );

        if (testInicial.length > 0) {
            await connection.query(
                `INSERT INTO acceso_materiales (ciclo_id, material_id, desbloqueado_en) 
         VALUES (?, ?, NOW())`,
                [cicloId, testInicial[0].id]
            );
        }

        await connection.commit();

        return {
            cicloId,
            dimension,
            fechaInicio: new Date(),
            testInicialDesbloqueado: testInicial.length > 0
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Programa una nueva cita/sesión
 */
export async function programarCita(cicloId, numeroSesion, fechaProgramada) {
    // Validación: No permitir Sesión 2 si Sesión 1 no existe
    if (numeroSesion === '2') {
        const [sesion1] = await pool.query(
            `SELECT id FROM citas WHERE ciclo_id = ? AND numero_sesion = '1'`,
            [cicloId]
        );

        if (sesion1.length === 0) {
            throw new Error('Debe programar la Sesión 1 antes de la Sesión 2');
        }
    }

    const [result] = await pool.query(
        `INSERT INTO citas (ciclo_id, numero_sesion, fecha_programada) 
     VALUES (?, ?, ?)`,
        [cicloId, numeroSesion, fechaProgramada]
    );

    return {
        citaId: result.insertId,
        numeroSesion,
        fechaProgramada
    };
}
