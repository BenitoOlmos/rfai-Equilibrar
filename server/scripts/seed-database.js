/**
 * Script de Seeding - Inserta datos de prueba en la base de datos
 * Ejecutar: node server/scripts/seed-database.js
 */

import { pool } from '../config/db.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🌱 INICIANDO SEEDING DE BASE DE DATOS...\n');

async function seedDatabase() {
    let connection;

    try {
        connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL establecida\n');

        // ========================================================================
        // 1. LIMPIAR DATOS EXISTENTES
        // ========================================================================
        console.log('🧹 Limpiando datos existentes...');

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        await connection.query('TRUNCATE TABLE logs_acceso');
        await connection.query('TRUNCATE TABLE logs_consumo_media');
        await connection.query('TRUNCATE TABLE test_resultados');
        await connection.query('TRUNCATE TABLE guia_progreso');
        await connection.query('TRUNCATE TABLE guia_estructuras');
        await connection.query('TRUNCATE TABLE recursos');
        await connection.query('TRUNCATE TABLE modulos_semanales');
        await connection.query('TRUNCATE TABLE matriculas');
        await connection.query('TRUNCATE TABLE programas');
        await connection.query('TRUNCATE TABLE usuario_roles');
        await connection.query('TRUNCATE TABLE usuarios');
        await connection.query('TRUNCATE TABLE roles');
        await connection.query('TRUNCATE TABLE auditoria_admin');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Datos limpiados\n');

        // ========================================================================
        // 2. INSERTAR ROLES
        // ========================================================================
        console.log('👥 Insertando roles...');

        await connection.query(`
      INSERT INTO roles (id, nombre, descripcion, permisos) VALUES
      (1, 'ADMIN', 'Administrador del sistema con acceso total', '{"modulos": ["todos"], "acciones": ["todos"]}'),
      (2, 'COORDINADOR', 'Coordinador clínico con acceso a gestión de programas', '{"modulos": ["programas", "matriculas"], "acciones": ["crear", "editar", "ver"]}'),
      (3, 'PROFESIONAL', 'Profesional que atiende clientes', '{"modulos": ["clientes_asignados"], "acciones": ["ver", "editar_notas"]}'),
      (4, 'CLIENTE', 'Usuario final del programa terapéutico', '{"modulos": ["mi_programa"], "acciones": ["ver", "completar"]}')
    `);

        console.log('✅ 4 roles insertados\n');

        // ========================================================================
        // 3. INSERTAR USUARIOS DE PRUEBA
        // ========================================================================
        console.log('🧑 Insertando usuarios de prueba...');

        await connection.query(`
      INSERT INTO usuarios (id, nombre_completo, email, telefono, estado) VALUES
      ('user-a-nuevo', 'Ana Martínez', 'ana.martinez@test.com', '+56912345001', 'ACTIVO'),
      ('user-b-avanzado', 'Bruno Silva', 'bruno.silva@test.com', '+56912345002', 'ACTIVO'),
      ('user-c-final', 'Carla Rojas', 'carla.rojas@test.com', '+56912345003', 'ACTIVO'),
      ('prof-david', 'Dr. David López', 'david.lopez@clinica.com', '+56912345004', 'ACTIVO')
    `);

        console.log('✅ 4 usuarios insertados');
        console.log('   - Ana Martínez (Nuevo)');
        console.log('   - Bruno Silva (Avanzado)');
        console.log('   - Carla Rojas (Finalizado)');
        console.log('   - Dr. David López (Profesional)\n');

        // ========================================================================
        // 4. ASIGNAR ROLES
        // ========================================================================
        console.log('🔐 Asignando roles...');

        await connection.query(`
      INSERT INTO usuario_roles (usuario_id, rol_id) VALUES
      ('user-a-nuevo', 4),
      ('user-b-avanzado', 4),
      ('user-c-final', 4),
      ('prof-david', 3)
    `);

        console.log('✅ Roles asignados\n');

        // ========================================================================
        // 5. INSERTAR PROGRAMAS
        // ========================================================================
        console.log('📚 Insertando programas...');

        await connection.query(`
      INSERT INTO programas (id, slug, nombre, descripcion, dimension_principal, duracion_semanas, color_tema) VALUES
      (1, 'angustia', 'Programa RFAI - Angustia', 'Reprogramación Focalizada para manejo de angustia anticipatoria', 'ANGUSTIA', 4, '#EF4444'),
      (2, 'culpa', 'Programa RFAI - Culpa', 'Reprogramación Focalizada para procesamiento adaptativo de culpa', 'CULPA', 4, '#3B82F6')
    `);

        console.log('✅ 2 programas insertados (Angustia, Culpa)\n');

        // ========================================================================
        // 6. INSERTAR MÓDULOS SEMANALES
        // ========================================================================
        console.log('📅 Insertando módulos semanales...');

        await connection.query(`
      INSERT INTO modulos_semanales (programa_id, numero_semana, titulo, descripcion, dias_para_desbloqueo, orden) VALUES
      (1, 1, 'Semana 1: Fundamentos', 'Entendiendo la angustia anticipatoria', 0, 1),
      (1, 2, 'Semana 2: Identificación', 'Reconocimiento de patrones', 7, 2),
      (1, 3, 'Semana 3: Transformación', 'Herramientas de regulación', 14, 3),
      (1, 4, 'Semana 4: Integración', 'Consolidación del aprendizaje', 21, 4)
    `);

        console.log('✅ 4 módulos semanales insertados\n');

        // ========================================================================
        // 7. INSERTAR RECURSOS
        // ========================================================================
        console.log('📦 Insertando recursos...');

        await connection.query(`
      INSERT INTO recursos (modulo_id, tipo, slug, titulo, descripcion, url_recurso, duracion_minutos, orden, metadata) VALUES
      (1, 'TEST', 'test-inicial-angustia', 'Test Inicial RFAI - Angustia', 'Evaluación de línea base', NULL, 15, 1, '{"tipo_test": "INICIAL", "preguntas": 20}'),
      (1, 'VIDEO_MEET', 'meet-inicial-angustia', 'Sesión Inicial - Evaluación', 'Primera sesión con profesional', 'https://meet.google.com/demo-inicial', 60, 2, '{"fecha_sugerida": "Semana 1"}'),
      (1, 'AUDIO', 'audio-1-angustia', 'Audio 1: Introducción a la Reprogramación', 'Fundamentos del método RFAI', 'https://storage.example.com/audios/angustia-1.mp3', 25, 3, '{"velocidad_ajustable": true}'),
      (2, 'AUDIO', 'audio-2-angustia', 'Audio 2: Técnicas de Regulación', 'Herramientas prácticas de manejo', 'https://storage.example.com/audios/angustia-2.mp3', 30, 1, '{"velocidad_ajustable": true}'),
      (2, 'TEST', 'test-intermedio-angustia', 'Test Comparativo - Angustia', 'Evaluación de progreso', NULL, 10, 2, '{"tipo_test": "COMPARATIVO"}'),
      (3, 'AUDIO', 'audio-3-angustia', 'Audio 3: Profundización', 'Integración avanzada', 'https://storage.example.com/audios/angustia-3.mp3', 35, 1, '{"velocidad_ajustable": true}'),
      (4, 'VIDEO_MEET', 'meet-final-angustia', 'Sesión Final - Cierre', 'Sesión de cierre y mantenimiento', 'https://meet.google.com/demo-final', 60, 1, '{"fecha_sugerida": "Semana 4"}'),
      (4, 'TEST', 'test-final-angustia', 'Test Final RFAI - Angustia', 'Evaluación de resultados', NULL, 15, 2, '{"tipo_test": "FINAL"}'),
      (4, 'DOCUMENTO', 'guia-mantenimiento-angustia', 'Guía de Mantenimiento', 'Plan de seguimiento post-programa', 'https://storage.example.com/docs/mantenimiento-angustia.pdf', NULL, 3, '{"formato": "PDF"}')
    `);

        console.log('✅ 9 recursos insertados\n');

        // ========================================================================
        // 8. INSERTAR MATRÍCULAS (⭐ FECHAS DINÁMICAS)
        // ========================================================================
        console.log('📝 Insertando matrículas con fechas estratégicas...');

        // Usuario A: HOY
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('user-a-nuevo', 1, 'prof-david', CURDATE(), 'ACTIVO', 5.00)
    `);
        console.log('   ✅ Ana Martínez → Matriculada HOY (Solo Semana 1)');

        // Usuario B: Hace 15 días
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, estado, progreso_general) 
      VALUES ('user-b-avanzado', 1, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'ACTIVO', 60.00)
    `);
        console.log('   ✅ Bruno Silva → Matriculado hace 15 días (Hasta Semana 3)');

        // Usuario C: Hace 30 días
        await connection.query(`
      INSERT INTO matriculas (cliente_id, programa_id, profesional_id, fecha_inicio, fecha_finalizacion, estado, progreso_general) 
      VALUES ('user-c-final', 1, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE(), 'COMPLETADO', 100.00)
    `);
        console.log('   ✅ Carla Rojas → Matriculada hace 30 días (COMPLETADO)\n');

        // ========================================================================
        // 9. INSERTAR GUÍA INTERACTIVA
        // ========================================================================
        console.log('📋 Insertando guía interactiva...');

        const guiaJson = {
            steps: [
                {
                    title: "Reconocimiento de Emociones",
                    description: "Identifica tus emociones principales esta semana",
                    questions: [
                        {
                            id: "q1",
                            type: "textarea",
                            text: "Describe la emoción más intensa que experimentaste esta semana",
                            required: true,
                            placeholder: "Ejemplo: Sentí angustia cuando..."
                        },
                        {
                            id: "q2",
                            type: "scale",
                            text: "¿Qué tan intensa fue esta emoción?",
                            required: true,
                            minScale: 1,
                            maxScale: 10
                        }
                    ]
                }
            ]
        };

        await connection.query(`
      INSERT INTO guia_estructuras (modulo_id, titulo, descripcion, estructura_json, version) 
      VALUES (1, 'Guía de Autoconocimiento - Semana 1', 'Ejercicio de identificación de patrones', ?, 1)
    `, [JSON.stringify(guiaJson)]);

        console.log('✅ Guía interactiva insertada\n');

        // ========================================================================
        // 10. INSERTAR PROGRESO (Usuario B)
        // ========================================================================
        console.log('💾 Insertando progreso de Bruno...');

        await connection.query(`
      INSERT INTO guia_progreso (matricula_id, guia_id, paso_actual, respuestas_json, completado, fecha_inicio, fecha_completado) 
      VALUES (2, 1, 2, '{"q1": "Sentí angustia cuando tuve que presentar en el trabajo", "q2": 8}', TRUE, DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_SUB(CURDATE(), INTERVAL 13 DAY))
    `);

        console.log('✅ Progreso de guía insertado\n');

        // ========================================================================
        // 11. INSERTAR LOGS DE AUDIO (Usuario B)
        // ========================================================================
        console.log('🎵 Insertando logs de audio...');

        await connection.query(`
      INSERT INTO logs_consumo_media (matricula_id, recurso_id, sesion_reproduccion, timestamp_inicio, timestamp_heartbeat, segundos_reproducidos, marcador_tiempo, completado) VALUES
      (2, 3, 'session-b-audio1-1', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 30, 30, FALSE),
      (2, 3, 'session-b-audio1-1', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 30, 60, FALSE),
      (2, 3, 'session-b-audio1-1', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 30, 1500, TRUE)
    `);

        console.log('✅ Logs de reproducción insertados\n');

        // ========================================================================
        // VERIFICACIÓN
        // ========================================================================
        console.log('🔍 VERIFICANDO DATOS INSERTADOS...\n');

        const [users] = await connection.query('SELECT id, nombre_completo, email FROM usuarios');
        console.log('📊 Usuarios creados:');
        users.forEach(u => console.log(`   - ${u.nombre_completo} (${u.email})`));

        const [matriculas] = await connection.query(`
      SELECT 
        u.nombre_completo,
        m.fecha_inicio,
        DATEDIFF(CURDATE(), m.fecha_inicio) as dias_transcurridos,
        m.estado
      FROM matriculas m
      JOIN usuarios u ON m.cliente_id = u.id
    `);

        console.log('\n📊 Matrículas:');
        matriculas.forEach(m => {
            console.log(`   - ${m.nombre_completo}: ${m.dias_transcurridos} días transcurridos (${m.estado})`);
        });

        // Verificar desbloqueos
        const [desbloqueos] = await connection.query(`
      SELECT 
        u.nombre_completo as usuario,
        ms.numero_semana,
        CASE 
          WHEN DATEDIFF(CURDATE(), m.fecha_inicio) >= ms.dias_para_desbloqueo 
          THEN 'DESBLOQUEADO' 
          ELSE 'BLOQUEADO' 
        END as estado
      FROM usuarios u
      JOIN matriculas m ON u.id = m.cliente_id
      JOIN modulos_semanales ms ON m.programa_id = ms.programa_id
      WHERE u.id IN ('user-a-nuevo', 'user-b-avanzado', 'user-c-final')
      ORDER BY u.nombre_completo, ms.numero_semana
    `);

        console.log('\n📊 Estado de desbloqueo por semana:');
        let currentUser = null;
        desbloqueos.forEach(d => {
            if (d.usuario !== currentUser) {
                console.log(`\n   ${d.usuario}:`);
                currentUser = d.usuario;
            }
            const emoji = d.estado === 'DESBLOQUEADO' ? '✅' : '🔒';
            console.log(`      Semana ${d.numero_semana}: ${emoji} ${d.estado}`);
        });

        console.log('\n\n🎉 ¡SEEDING COMPLETADO EXITOSAMENTE!\n');

    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
            console.log('🔌 Conexión liberada');
        }
        await pool.end();
        console.log('👋 Pool de conexiones cerrado\n');
    }
}

// Ejecutar seeding
seedDatabase().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
