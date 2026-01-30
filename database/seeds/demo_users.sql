-- ============================================================================
-- SEEDING ESTRATÉGICO - CASOS DE PRUEBA RFAI
-- Sistema de 4 Semanas con Desbloqueo Temporal
-- ============================================================================
-- Este script inserta datos de prueba para validar la lógica de desbloqueo
-- Incluye 4 usuarios con diferentes estados de progreso
-- ============================================================================

USE reprogramacion_foca;

-- Limpiar datos existentes (mantener estructura)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE logs_acceso;
TRUNCATE TABLE logs_consumo_media;
TRUNCATE TABLE test_resultados;
TRUNCATE TABLE guia_progreso;
TRUNCATE TABLE guia_estructuras;
TRUNCATE TABLE recursos;
TRUNCATE TABLE modulos_semanales;
TRUNCATE TABLE matriculas;
TRUNCATE TABLE programas;
TRUNCATE TABLE usuario_roles;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE roles;
TRUNCATE TABLE auditoria_admin;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. ROLES (Ya existen en schema, pero los recreamos por seguridad)
-- ============================================================================
INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `permisos`) VALUES
(1, 'ADMIN', 'Administrador del sistema con acceso total', '{"modulos": ["todos"], "acciones": ["todos"]}'),
(2, 'COORDINADOR', 'Coordinador clínico con acceso a gestión de programas', '{"modulos": ["programas", "matriculas"], "acciones": ["crear", "editar", "ver"]}'),
(3, 'PROFESIONAL', 'Profesional que atiende clientes', '{"modulos": ["clientes_asignados"], "acciones": ["ver", "editar_notas"]}'),
(4, 'CLIENTE', 'Usuario final del programa terapéutico', '{"modulos": ["mi_programa"], "acciones": ["ver", "completar"]}');

-- ============================================================================
-- 2. USUARIOS DE PRUEBA (4 Casos Estratégicos)
-- ============================================================================

-- Usuario A: El Nuevo (Solo Semana 1)
INSERT INTO `usuarios` (`id`, `nombre_completo`, `email`, `telefono`, `estado`) VALUES
('user-a-nuevo', 'Ana Martínez', 'ana.martinez@test.com', '+56912345001', 'ACTIVO');

-- Usuario B: El Avanzado (Hasta Semana 2-3)
INSERT INTO `usuarios` (`id`, `nombre_completo`, `email`, `telefono`, `estado`) VALUES
('user-b-avanzado', 'Bruno Silva', 'bruno.silva@test.com', '+56912345002', 'ACTIVO');

-- Usuario C: El Finalizado (Acceso Total)
INSERT INTO `usuarios` (`id`, `nombre_completo`, `email`, `telefono`, `estado`) VALUES
('user-c-final', 'Carla Rojas', 'carla.rojas@test.com', '+56912345003', 'ACTIVO');

-- Usuario D: Profesional (Para ver dashboard)
INSERT INTO `usuarios` (`id`, `nombre_completo`, `email`, `telefono`, `estado`) VALUES
('prof-david', 'Dr. David López', 'david.lopez@clinica.com', '+56912345004', 'ACTIVO');

-- ============================================================================
-- 3. ASIGNAR ROLES
-- ============================================================================
INSERT INTO `usuario_roles` (`usuario_id`, `rol_id`) VALUES
('user-a-nuevo', 4),      -- CLIENTE
('user-b-avanzado', 4),   -- CLIENTE
('user-c-final', 4),      -- CLIENTE
('prof-david', 3);        -- PROFESIONAL

-- ============================================================================
-- 4. PROGRAMAS
-- ============================================================================
INSERT INTO `programas` (`id`, `slug`, `nombre`, `descripcion`, `dimension_principal`, `duracion_semanas`, `color_tema`) VALUES
(1, 'angustia', 'Programa RFAI - Angustia', 'Reprogramación Focalizada para manejo de angustia anticipatoria', 'ANGUSTIA', 4, '#EF4444'),
(2, 'culpa', 'Programa RFAI - Culpa', 'Reprogramación Focalizada para procesamiento adaptativo de culpa', 'CULPA', 4, '#3B82F6');

-- ============================================================================
-- 5. MÓDULOS SEMANALES (Angustia)
-- ============================================================================
INSERT INTO `modulos_semanales` (`programa_id`, `numero_semana`, `titulo`, `descripcion`, `dias_para_desbloqueo`, `orden`) VALUES
(1, 1, 'Semana 1: Fundamentos', 'Entendiendo la angustia anticipatoria', 0, 1),
(1, 2, 'Semana 2: Identificación', 'Reconocimiento de patrones', 7, 2),
(1, 3, 'Semana 3: Transformación', 'Herramientas de regulación', 14, 3),
(1, 4, 'Semana 4: Integración', 'Consolidación del aprendizaje', 21, 4);

-- ============================================================================
-- 6. MÓDULOS SEMANALES (Culpa)
-- ============================================================================
INSERT INTO `modulos_semanales` (`programa_id`, `numero_semana`, `titulo`, `descripcion`, `dias_para_desbloqueo`, `orden`) VALUES
(2, 1, 'Semana 1: Fundamentos', 'Comprendiendo la culpa no adaptativa', 0, 1),
(2, 2, 'Semana 2: Reconocimiento', 'Patrones de autojuicio', 7, 2),
(2, 3, 'Semana 3: Reencuadre', 'Responsabilidad consciente', 14, 3),
(2, 4, 'Semana 4: Integración', 'Humanización del error', 21, 4);

-- ============================================================================
-- 7. RECURSOS (Programa Angustia - Semana 1)
-- ============================================================================
INSERT INTO `recursos` (`modulo_id`, `tipo`, `slug`, `titulo`, `descripcion`, `url_recurso`, `duracion_minutos`, `orden`, `metadata`) VALUES
-- Semana 1
(1, 'TEST', 'test-inicial-angustia', 'Test Inicial RFAI - Angustia', 'Evaluación de línea base', NULL, 15, 1, '{"tipo_test": "INICIAL", "preguntas": 20}'),
(1, 'VIDEO_MEET', 'meet-inicial-angustia', 'Sesión Inicial - Evaluación', 'Primera sesión con profesional', 'https://meet.google.com/demo-inicial', 60, 2, '{"fecha_sugerida": "Semana 1", "profesional_requerido": true}'),
(1, 'AUDIO', 'audio-1-angustia', 'Audio 1: Introducción a la Reprogramación', 'Fundamentos del método RFAI', 'https://storage.example.com/audios/angustia-1.mp3', 25, 3, '{"velocidad_ajustable": true, "descargable": false}'),

-- Semana 2
(2, 'AUDIO', 'audio-2-angustia', 'Audio 2: Técnicas de Regulación', 'Herramientas prácticas de manejo', 'https://storage.example.com/audios/angustia-2.mp3', 30, 1, '{"velocidad_ajustable": true}'),
(2, 'TEST', 'test-intermedio-angustia', 'Test Comparativo - Angustia', 'Evaluación de progreso', NULL, 10, 2, '{"tipo_test": "COMPARATIVO"}'),

-- Semana 3
(3, 'AUDIO', 'audio-3-angustia', 'Audio 3: Profundización', 'Integración avanzada', 'https://storage.example.com/audios/angustia-3.mp3', 35, 1, '{"velocidad_ajustable": true}'),

-- Semana 4
(4, 'VIDEO_MEET', 'meet-final-angustia', 'Sesión Final - Cierre', 'Sesión de cierre y mantenimiento', 'https://meet.google.com/demo-final', 60, 1, '{"fecha_sugerida": "Semana 4"}'),
(4, 'TEST', 'test-final-angustia', 'Test Final RFAI - Angustia', 'Evaluación de resultados', NULL, 15, 2, '{"tipo_test": "FINAL"}'),
(4, 'DOCUMENTO', 'guia-mantenimiento-angustia', 'Guía de Mantenimiento', 'Plan de seguimiento post-programa', 'https://storage.example.com/docs/mantenimiento-angustia.pdf', NULL, 3, '{"formato": "PDF", "paginas": 12}');

-- ============================================================================
-- 8. MATRÍCULAS (⭐ CASOS DE PRUEBA TEMPORAL)
-- ============================================================================

-- Usuario A: Matriculado HOY (Solo Semana 1)
INSERT INTO `matriculas` (`cliente_id`, `programa_id`, `profesional_id`, `fecha_inicio`, `estado`, `progreso_general`) VALUES
('user-a-nuevo', 1, 'prof-david', CURDATE(), 'ACTIVO', 5.00);

-- Usuario B: Matriculado hace 15 DÍAS (Hasta Semana 3)
INSERT INTO `matriculas` (`cliente_id`, `programa_id`, `profesional_id`, `fecha_inicio`, `estado`, `progreso_general`) VALUES
('user-b-avanzado', 1, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'ACTIVO', 60.00);

-- Usuario C: Matriculado hace 30 DÍAS (Acceso Total - Completado)
INSERT INTO `matriculas` (`cliente_id`, `programa_id`, `profesional_id`, `fecha_inicio`, `fecha_finalizacion`, `estado`, `progreso_general`) VALUES
('user-c-final', 1, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE(), 'COMPLETADO', 100.00);

-- ============================================================================
-- 9. GUÍA INTERACTIVA (Ejemplo Semana 1)
-- ============================================================================
INSERT INTO `guia_estructuras` (`modulo_id`, `titulo`, `descripcion`, `estructura_json`, `version`) VALUES
(1, 'Guía de Autoconocimiento - Semana 1', 'Ejercicio de identificación de patrones', 
'{
  "steps": [
    {
      "title": "Reconocimiento de Emociones",
      "description": "Identifica tus emociones principales esta semana",
      "questions": [
        {
          "id": "q1",
          "type": "textarea",
          "text": "Describe la emoción más intensa que experimentaste esta semana",
          "required": true,
          "placeholder": "Ejemplo: Sentí angustia cuando..."
        },
        {
          "id": "q2",
          "type": "scale",
          "text": "¿Qué tan intensa fue esta emoción?",
          "required": true,
          "minScale": 1,
          "maxScale": 10
        }
      ]
    },
    {
      "title": "Situaciones Detonantes",
      "description": "Analiza qué provocó estas emociones",
      "questions": [
        {
          "id": "q3",
          "type": "checkbox",
          "text": "¿Qué tipo de situaciones desencadenaron la emoción?",
          "required": true,
          "options": [
            "Conflicto interpersonal",
            "Presión laboral",
            "Preocupación por el futuro",
            "Recuerdo del pasado",
            "Otro"
          ]
        },
        {
          "id": "q4",
          "type": "textarea",
          "text": "Describe la situación específica",
          "required": false
        }
      ]
    },
    {
      "title": "Reflexión y Compromiso",
      "questions": [
        {
          "id": "q5",
          "type": "radio",
          "text": "¿Qué acción tomarás esta semana?",
          "required": true,
          "options": [
            "Practicar técnicas de respiración",
            "Escribir un diario emocional",
            "Hablar con alguien de confianza",
            "Escuchar el audio de reprogramación"
          ]
        }
      ]
    }
  ]
}', 1);

-- Crear progreso inicial para Usuario B (ya avanzado)
INSERT INTO `guia_progreso` (`matricula_id`, `guia_id`, `paso_actual`, `respuestas_json`, `completado`, `fecha_inicio`, `fecha_completado`) VALUES
(2, 1, 2, '{"q1": "Sentí angustia cuando tuve que presentar en el trabajo", "q2": 8, "q3": ["Presión laboral", "Preocupación por el futuro"], "q4": "Fue durante una reunión importante..."}', TRUE, DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_SUB(CURDATE(), INTERVAL 13 DAY));

-- ============================================================================
-- 10. LOGS DE CONSUMO (Simular actividad de Usuario B)
-- ============================================================================
-- Usuario B escuchó el Audio 1 (completo)
INSERT INTO `logs_consumo_media` (`matricula_id`, `recurso_id`, `sesion_reproduccion`, `timestamp_inicio`, `timestamp_heartbeat`, `segundos_reproducidos`, `marcador_tiempo`, `completado`) VALUES
(2, 3, 'session-b-audio1-1', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 30, 30, FALSE),
(2, 3, 'session-b-audio1-1', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 30, 60, FALSE),
(2, 3, 'session-b-audio1-1', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 30, 1500, TRUE);

-- Usuario B escuchó el Audio 2 (parcialmente)
INSERT INTO `logs_consumo_media` (`matricula_id`, `recurso_id`, `sesion_reproduccion`, `timestamp_inicio`, `timestamp_heartbeat`, `segundos_reproducidos`, `marcador_tiempo`, `completado`) VALUES
(2, 4, 'session-b-audio2-1', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 30, 30, FALSE),
(2, 4, 'session-b-audio2-1', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 30, 60, FALSE);

-- ============================================================================
-- 11. RESULTADOS DE TESTS
-- ============================================================================
-- Usuario B completó Test Inicial
INSERT INTO `test_resultados` (`matricula_id`, `recurso_id`, `fecha_realizacion`, `tipo_test`, `score_angustia_anticipatoria`, `score_autoculpabilizacion_angustia`, `score_desconexion_amor_propio`, `score_regulacion_amor`, `tiempo_completado_minutos`) VALUES
(2, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'INICIAL', 16, 18, 11, 14, 12);

-- Usuario C completó todos los tests
INSERT INTO `test_resultados` (`matricula_id`, `recurso_id`, `fecha_realizacion`, `tipo_test`, `score_angustia_anticipatoria`, `score_autoculpabilizacion_angustia`, `score_desconexion_amor_propio`, `score_regulacion_amor`, `tiempo_completado_minutos`) VALUES
(3, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), 'INICIAL', 18, 20, 13, 12, 14),
(3, 5, DATE_SUB(NOW(), INTERVAL 23 DAY), 'COMPARATIVO', 14, 16, 10, 15, 10),
(3, 8, DATE_SUB(NOW(), INTERVAL 2 DAY), 'FINAL', 8, 10, 6, 20, 13);

-- ============================================================================
-- VERIFICACIÓN DE DATOS
-- ============================================================================
SELECT '=== USUARIOS CREADOS ===' as Info;
SELECT id, nombre_completo, email, estado FROM usuarios;

SELECT '=== MATRÍCULAS Y ESTADO TEMPORAL ===' as Info;
SELECT 
  m.id,
  u.nombre_completo,
  p.nombre as programa,
  m.fecha_inicio,
  DATEDIFF(CURDATE(), m.fecha_inicio) as dias_transcurridos,
  m.estado,
  m.progreso_general
FROM matriculas m
JOIN usuarios u ON m.cliente_id = u.id
JOIN programas p ON m.programa_id = p.id;

SELECT '=== MÓDULOS DESBLOQUEADOS POR USUARIO ===' as Info;
SELECT 
  u.nombre_completo as usuario,
  ms.numero_semana,
  ms.titulo,
  ms.dias_para_desbloqueo,
  DATEDIFF(CURDATE(), m.fecha_inicio) as dias_transcurridos,
  CASE 
    WHEN DATEDIFF(CURDATE(), m.fecha_inicio) >= ms.dias_para_desbloqueo 
    THEN '✅ DESBLOQUEADO' 
    ELSE '🔒 BLOQUEADO' 
  END as estado
FROM usuarios u
JOIN matriculas m ON u.id = m.cliente_id
JOIN modulos_semanales ms ON m.programa_id = ms.programa_id
WHERE u.id IN ('user-a-nuevo', 'user-b-avanzado', 'user-c-final')
ORDER BY u.nombre_completo, ms.numero_semana;

-- ============================================================================
-- FIN DEL SEEDING
-- ============================================================================
