/**
 * Script para insertar usuarios demo originales de la interfaz
 * Ejecutar: node server/scripts/seed-demo-users-original.js
 */

import { pool } from '../config/db.js';

console.log('\n🌱 INSERTANDO USUARIOS DEMO ORIGINALES...\n');

async function seedOriginalDemoUsers() {
    let connection;

    try {
        connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL establecida\n');

        // ========================================================================
        // USUARIOS DEMO - PROGRAMA CULPA
        // ========================================================================
        console.log('📚 Insertando usuarios demo - Programa CULPA...\n');

        // Lucía (Semana 1)
        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('c-w1', 'Lucía Fernández (Sem 1)', 'lucia@client.com', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo)
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('c-w1', 4)`);
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('c-w1', 2, 'prof-david', CURDATE(), 'ACTIVO', 5)
      ON DUPLICATE KEY UPDATE estado = 'ACTIVO'
    `);
        console.log('   ✅ Lucía Fernández (S1) - Programa Culpa');

        // Carlos (Semana 2)
        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('c-w2', 'Carlos Díaz (Sem 2)', 'carlos@client.com', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo)
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('c-w2', 4)`);
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('c-w2', 2, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'ACTIVO', 30)
      ON DUPLICATE KEY UPDATE estado = 'ACTIVO'
    `);
        console.log('   ✅ Carlos Díaz (S2) - Programa Culpa');

        // Pedro (Semana 3)
        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('c-w3', 'Pedro Pascal (Sem 3)', 'pedro@client.com', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo)
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('c-w3', 4)`);
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('c-w3', 2, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'ACTIVO', 65)
      ON DUPLICATE KEY UPDATE estado = 'ACTIVO'
    `);
        console.log('   ✅ Pedro Pascal (S3) - Programa Culpa');

        // Ana (Semana 4)
        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('c-w4', 'Ana Ruiz (Sem 4)', 'ana@client.com', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo)
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('c-w4', 4)`);
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('c-w4', 2, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 21 DAY), 'ACTIVO', 90)
      ON DUPLICATE KEY UPDATE estado = 'ACTIVO'
    `);
        console.log('   ✅ Ana Ruiz (S4) - Programa Culpa');

        // ========================================================================
        // USUARIOS DEMO - PROGRAMA ANGUSTIA
        // ========================================================================
        console.log('\n📚 Insertando usuarios demo - Programa ANGUSTIA...\n');

        // Paula (Semana 1)
        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('c-a1', 'Paula Angustia (Sem 1)', 'paula@angustia.com', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo)
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('c-a1', 4)`);
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('c-a1', 1, 'prof-david', CURDATE(), 'ACTIVO', 5)
      ON DUPLICATE KEY UPDATE estado = 'ACTIVO'
    `);
        console.log('   ✅ Paula Angustia (S1) - Programa Angustia');

        // Jorge (Semana 2)
        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('c-a2', 'Jorge Angustia (Sem 2)', 'jorge@angustia.com', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo)
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('c-a2', 4)`);
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('c-a2', 1, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'ACTIVO', 30)
      ON DUPLICATE KEY UPDATE estado = 'ACTIVO'
    `);
        console.log('   ✅ Jorge Angustia (S2) - Programa Angustia');

        // Sofía (Semana 3)
        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('c-a3', 'Sofía Angustia (Sem 3)', 'sofia@angustia.com', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo)
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('c-a3', 4)`);
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('c-a3', 1, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'ACTIVO', 65)
      ON DUPLICATE KEY UPDATE estado = 'ACTIVO'
    `);
        console.log('   ✅ Sofía Angustia (S3) - Programa Angustia');

        // Miguel (Semana 4)
        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('c-a4', 'Miguel Angustia (Sem 4)', 'miguel@angustia.com', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo)
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('c-a4', 4)`);
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('c-a4', 1, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 21 DAY), 'ACTIVO', 90)
      ON DUPLICATE KEY UPDATE estado = 'ACTIVO'
    `);
        console.log('   ✅ Miguel Angustia (S4) - Programa Angustia');

        // ========================================================================
        // USUARIOS STAFF
        // ========================================================================
        console.log('\n👥 Insertando usuarios de staff...\n');

        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('u-admin', 'Benito Olmos', 'admin@test.cl', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = 'Benito Olmos', email = 'admin@test.cl'
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('u-admin', 1)`);
        console.log('   ✅ Benito Olmos (Admin)');

        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('u-coord', 'Sol Elgueta', 'coordinacion@test.cl', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = 'Sol Elgueta', email = 'coordinacion@test.cl'
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('u-coord', 2)`);
        console.log('   ✅ Sol Elgueta (Coordinador)');

        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, estado) 
      VALUES ('u-prof', 'Claudio Reyes', 'profesional@test.cl', 'ACTIVO')
      ON DUPLICATE KEY UPDATE nombre_completo = 'Claudio Reyes', email = 'profesional@test.cl'
    `);
        await connection.query(`INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES ('u-prof', 3)`);
        console.log('   ✅ Claudio Reyes (Profesional)');

        console.log('\n🎉 ¡USUARIOS DEMO ORIGINALES INSERTADOS!\n');

    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
        await pool.end();
    }
}

seedOriginalDemoUsers().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
