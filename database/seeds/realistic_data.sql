-- ============================================================================
-- SEED DATA - DATOS REALISTAS PARA TABLAS NUEVAS
-- Propósito: Poblar con datos de prueba vinculados a pacientes existentes
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. CITAS PARA PACIENTES EXISTENTES
-- ============================================================================

-- Lucía (c-w1) - Semana 1, Programa Culpa
INSERT INTO `citas` (
  `matricula_id`, `profesional_id`, `tipo_sesion`,
  `numero_sesion`, `semana_asociada`, `fecha_programada`,
  `fecha_realizada`, `duracion_minutos`, `estado`,
  `link_reunion`, `notas_post_sesion`, `asistencia_confirmada`
) VALUES
-- Sesión 1 ya realizada
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w1' LIMIT 1),
  'prof-david',
  'VIRTUAL',
  1,
  1,
  DATE_SUB(CURDATE(), INTERVAL 2 DAY),
  DATE_SUB(CURDATE(), INTERVAL 2 DAY),
  60,
  'REALIZADA',
  'https://meet.google.com/abc-defg-hij',
  'Primera sesión exitosa. Lucía mostró alta motivación. Se trabajó identificación de patrones de culpa. Completó test inicial (scores: Autojuicio 24/30, Culpa No Adaptativa 20/25). Plan: Escuchar audio de reprogramación diariamente.',
  TRUE
),
-- Sesión 2 programada para próxima semana
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w1' LIMIT 1),
  'prof-david',
  'VIRTUAL',
  2,
  2,
  DATE_ADD(CURDATE(), INTERVAL 5 DAY),
  NULL,
  60,
  'PROGRAMADA',
  'https://meet.google.com/xyz-uvwx-123',
  NULL,
  FALSE
);

-- Pedro (c-w3) - Semana 3, Programa Culpa
INSERT INTO `citas` (
  `matricula_id`, `profesional_id`, `tipo_sesion`,
  `numero_sesion`, `semana_asociada`, `fecha_programada`,
  `fecha_realizada`, `duracion_minutos`, `estado`,
  `notas_post_sesion`, `asistencia_confirmada`
) VALUES
-- Todas las sesiones realizadas
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w3' LIMIT 1),
  'prof-david',
  'PRESENCIAL',
  1,
  1,
  DATE_SUB(CURDATE(), INTERVAL 21 DAY),
  DATE_SUB(CURDATE(), INTERVAL 21 DAY),
  60,
  'REALIZADA',
  'Evaluación inicial. Pedro presentó alta culpabilidad relacionada con decisiones laborales. Test inicial completado.',
  TRUE
),
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w3' LIMIT 1),
  'prof-david',
  'VIRTUAL',
  2,
  2,
  DATE_SUB(CURDATE(), INTERVAL 14 DAY),
  DATE_SUB(CURDATE(), INTERVAL 14 DAY),
  60,
  'REALIZADA',
  'Seguimiento semana 2. Pedro reporta mejora en reconocimiento de pensamientos automáticos. Ha escuchado el audio 5 veces. Test comparativo muestra reducción en Autojuicio (20/30).',
  TRUE
),
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w3' LIMIT 1),
  'prof-david',
  'VIRTUAL',
  3,
  3,
  DATE_SUB(CURDATE(), INTERVAL 7 DAY),
  DATE_SUB(CURDATE(), INTERVAL 7 DAY),
  60,
  'REALIZADA',
  'Semana 3 de profundización. Pedro completó guía de trabajo personal. Identifica mejor la diferencia entre responsabilidad consciente y culpa desadaptativa. Progreso notable.',
  TRUE
);

-- Ana (c-w2-angustia) - Semana 2, Programa Angustia
INSERT INTO `citas` (
  `matricula_id`, `profesional_id`, `tipo_sesion`,
  `numero_sesion`, `semana_asociada`, `fecha_programada`,
  `fecha_realizada`, `duracion_minutos`, `estado`,
  `notas_post_sesion`, `asistencia_confirmada`
) VALUES
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w2-angustia' LIMIT 1),
  'prof-maria',
  'VIRTUAL',
  1,
  1,
  DATE_SUB(CURDATE(), INTERVAL 10 DAY),
  DATE_SUB(CURDATE(), INTERVAL 10 DAY),
  60,
  'REALIZADA',
  'Sesión inicial. Ana presenta angustia anticipatoria alta (score 18/20). Se trabajó psicoeducación sobre mecanismo de angustia. Muy receptiva al modelo RFAI.',
  TRUE
),
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w2-angustia' LIMIT 1),
  'prof-maria',
  'VIRTUAL',
  2,
  2,
  DATE_ADD(CURDATE(), INTERVAL 2 DAY),
  NULL,
  60,
  'PROGRAMADA',
  NULL,
  TRUE
);

-- ============================================================================
-- 2. NOTIFICACIONES VARIADAS
-- ============================================================================

-- Notificación de semana desbloqueada para Lucía
INSERT INTO `notificaciones` (
  `usuario_id`, `tipo`, `titulo`, `mensaje`,
  `prioridad`, `leida`, `action_url`, `metadata`
) VALUES
('c-w1', 'SEMANA_DESBLOQUEADA', '¡Semana 1 disponible!',
 'Ya puedes acceder a todos los materiales de la Semana 1: Test inicial, Audio de reprogramación y Guía de trabajo.',
 'ALTA', TRUE, '/dashboard/week/1', '{"semana": 1, "recursos_count": 3}'),

-- Recordatorio de cita próxima para Lucía
('c-w1', 'RECORDATORIO_CITA', 'Recordatorio: Sesión programada',
 'Tienes una sesión con Dr. David Torres en 2 días (Viernes 10:00 AM). Link de reunión disponible en tu panel.',
 'ALTA', FALSE, '/dashboard/appointments', '{"cita_id": 2, "profesional": "Dr. David Torres"}'),

-- Nuevo audio disponible para Pedro
('c-w3', 'RECURSO_DISPONIBLE', 'Nuevo audio de refuerzo disponible',
 'Se ha desbloqueado el audio de integración de la Semana 4. Recomendamos escucharlo antes de la sesión final.',
 'MEDIA', FALSE, '/dashboard/week/4/audio', '{"recurso_id": 12, "tipo": "AUDIO"}'),

-- Mensaje del profesional para Ana
('c-w2-angustia', 'MENSAJE_PROFESIONAL', 'Mensaje de Dra. María Valdés',
 'Hola Ana, he revisado tus respuestas de la guía. Excelente trabajo identificando tus patrones de angustia. Profundizaremos en nuestra próxima sesión.',
 'MEDIA', FALSE, '/dashboard/messages', '{"profesional_id": "prof-maria", "tipo": "FELICITACION"}'),

-- Test pendiente para cliente avanzado
('c-w4-culpa', 'TEST_PENDIENTE', 'Test Final pendiente',
 'Estás en la última semana del programa. Por favor completa el Test Final RFAI para evaluar tu progreso. Te tomará aproximadamente 15 minutos.',
 'ALTA', FALSE, '/dashboard/week/4/test', '{"test_tipo": "FINAL", "semana": 4}'),

-- Notificación sistema para todos
('c-w1', 'SISTEMA', 'Mantenimiento programado',
 'El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM. Recomendamos descargar los audios para escucha offline.',
 'BAJA', FALSE, NULL, '{"tipo": "MANTENIMIENTO", "fecha": "2026-02-02"}');

-- ============================================================================
-- 3. FEEDBACK DE RECURSOS
-- ============================================================================

-- Feedback de audios por Pedro (usuario avanzado)
INSERT INTO `feedback_recursos` (
  `usuario_id`, `recurso_id`, `tipo_recurso`,
  `valoracion`, `comentario`, `fue_util`, `metadata`
) VALUES
('c-w3', 5, 'AUDIO', 5,
 'Excelente audio. Me ayudó mucho a replantear mi autocrítica. Lo he escuchado 7 veces y cada vez encuentro algo nuevo.',
 TRUE, '{"veces_escuchado": 7, "sentimiento": "positivo"}'),

('c-w3', 8, 'GUIA', 4,
 'La guía es muy completa, aunque algunas preguntas son repetitivas. Me gustó la sección de reflexión personal.',
 TRUE, '{"tiempo_completado_minutos": 45, "dificultad": "media"}'),

-- Feedback de test por Lucía
('c-w1', 1, 'TEST', 5,
 'Test muy bien estructurado. Las preguntas son claras y me hicieron reflexionar sobre aspectos que no había considerado.',
 TRUE, '{"claridad": "alta", "tiempo_minutos": 18}'),

-- Feedback de audio por Ana (menos satisfecha)
('c-w2-angustia', 3, 'AUDIO', 3,
 'El audio está bien  pero creo que va muy rápido. Sería útil tener una versión más lenta o con pausas.',
 TRUE, '{"sugerencia": "version_lenta", "dificultad_seguir": "media"}'),

-- Feedback positivo de sesión por Bruno
('c-w2-culpa', 10, 'VIDEO_MEET', 5,
 'La sesión con el doctor fue increíblemente útil. Pude aclarar todas mis dudas y me siento más confiado.',
 TRUE, '{"tipo_reunion": "virtual", "calidad_conexion": "excelente"}');

-- ============================================================================
-- 4. NOTAS CLÍNICAS ESTRUCTURADAS
-- ============================================================================

-- Nota de evaluación inicial para Lucía
INSERT INTO `notas_clinicas` (
  `matricula_id`, `profesional_id`, `cita_id`,
  `tipo_nota`, `titulo`, `contenido`,
  `observaciones_clinicas`, `plan_accion`,
  `tags`, `nivel_riesgo`, `visible_para_cliente`
) VALUES
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w1' LIMIT 1),
  'prof-david',
  1,
  'EVALUACION_INICIAL',
  'Evaluación Inicial - Lucía Fernández',
  'Paciente de 32 años que consulta por sentimientos de culpa relacionados con decisiones familiares. Antecedentes: Sin tratamiento psicológico previo. Motivación alta (9/10).

ENTREVISTA CLÍNICA:
- Describe episodios recurrentes de autocrítica severa
- Dificultad para tomar decisiones por miedo a equivocarse
- Perfeccionismo en área laboral y personal
- Relaciones interpersonales: buenas, pero evita conflictos

TEST RFAI CULPA - RESULTADOS INICIALES:
- Autojuicio: 24/30 (alto)
- Culpa No Adaptativa: 20/25 (alto)
- Responsabilidad Consciente: 15/35 (bajo)
- Humanización del Error: 4/10 (bajo)

DIAGNÓSTICO PROVISIONAL: Patrón de culpa desadaptativa con alta autocrítica.',
  '{"humor": "estable", "ansiedad": "moderada", "motivacion": "alta", "adherencia_estimada": "alta", "insight": "bueno"}',
  '1. Psicoeducación sobre diferencia entre culpa adaptativa y desadaptativa
2. Inicio de escucha diaria de audio de reprogramación (2 semanas)
3. Completar guía de identificación de pensamientos automáticos
4. Sesión de seguimiento en S2 para evaluar progreso y realizar test comparativo',
  '["primera_sesion", "culpa_alta", "motivacion_alta", "sin_tratamiento_previo"]',
  'BAJO',
  FALSE
);

-- Nota de seguimiento para Pedro
INSERT INTO `notas_clinicas` (
  `matricula_id`, `profesional_id`, `cita_id`,
  `tipo_nota`, `titulo`, `contenido`,
  `observaciones_clinicas`, `plan_accion`,
  `tags`, `nivel_riesgo`
) VALUES
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w3' LIMIT 1),
  'prof-david',
  NULL,
  'SEGUIMIENTO',
  'Evolución Semana 3 - Pedro García',
  'EVOLUCIÓN:
Pedro muestra progreso significativo. Ha internalizado el concepto de responsabilidad consciente vs. culpa desadaptativa.

CAMBIOS OBSERVADOS:
- Reducción en frecuencia de pensamientos autocríticos
- Mayor compasión hacia sí mismo
- Mejor toma de decisiones (reporta menos dudas paralizantes)

ADHERENCIA:
- Audio: Escuchado 12 veces (excelente adherencia)
- Guía: Completada al 100%
- Tests: Todos realizados en tiempo

COMPARATIVA DE SCORES:
S1 → S3:
- Autojuicio: 26 → 18 (-31% mejoría)
- Culpa No Adaptativa: 22 → 14 (-36% mejoría)
- Responsabilidad Consciente: 12 → 24 (+100% mejoría)
- Humanización Error: 3 → 7 (+133% mejoría)',
  '{"humor": "mejorado", "ansiedad": "baja", "motivacion": "muy_alta", "adherencia": "excelente", "insight": "muy_bueno", "resistencias": "ninguna"}',
  '1. Continuar con audio de integración
2. Preparar sesión final (S4) para consolidación
3. Introducir técnicas de mantenimiento
4. Test final en S4',
  '["evolucion_positiva", "alta_adherencia", "insight_desarrollado", "proximo_alta"]',
  'NINGUNO'
);

-- Nota de observación para Ana
INSERT INTO `notas_clinicas` (
  `matricula_id`, `profesional_id`, `cita_id`,
  `tipo_nota`, `titulo`, `contenido`,
  `observaciones_clinicas`, `plan_accion`,
  `tags`, `nivel_riesgo`
) VALUES
(
  (SELECT id FROM matriculas WHERE cliente_id = 'c-w2-angustia' LIMIT 1),
  'prof-maria',
  NULL,
  'OBSERVACION',
  'Observación - Dificultad con audio',
  'Ana reporta dificultad para seguir el ritmo del audio dereprogramación. Menciona que "va muy rápido" y pierde atención.

ANÁLISIS:
Esto es común en pacientes con alta angustia anticipatoria. La hiperactivación cognitiva dificulta la concentración sostenida.

INTERVENCIÓN APLICADA:
1. Recomendación de escuchar el audio en sesiones más cortas (10 min)
2. Sugerencia de usar auriculares en ambiente tranquilo
3. Permitir pausas activas durante la escucha

RESULTADO:
Ana probará nueva estrategia esta semana. Evaluaremos en próxima sesión.',
  '{"dificultad_atencion": "alta", "hiperactivacion": "presente", "disposicion_ajuste": "buena"}',
  'Monitorear adherencia con nuevo formato de escucha. Si no mejora, considerar versión modificada del audio.',
  '["dificultad_tecnica", "ajuste_necesario", "hiperactivacion"]',
  'BAJO'
);

-- ============================================================================
-- 5. BIBLIOTECA DE RECURSOS
-- ============================================================================

INSERT INTO `biblioteca_recursos` (
  `categoria`, `titulo`, `descripcion`, `autor`,
  `url_recurso`, `dimension_relacionada`, `tags`,
  `nivel_recomendado`, `duracion_minutos`, `destacado`,
  `creado_por`, `fecha_publicacion`
) VALUES
('PDF', 'Guía: Entendiendo la Culpa Adaptativa',
 'Documento educativo sobre la diferencia entre culpa funcional y disfuncional. Incluye ejercicios prácticos.',
 'Dr. David Torres',
 '/biblioteca/pdfs/guia-culpa-adaptativa.pdf',
 'CULPA',
 '["culpa", "psicoeducacion", "ejercicios", "autocompasion"]',
 'PRINCIPIANTE',
 15,
 TRUE,
 'prof-david',
 '2026-01-15'),

('VIDEO', 'Webinar: Manejando la Angustia Anticipatoria',
 'Video de 30 minutos sobre técnicas para reducir la preocupación anticipatoria.',
 'Dra. María Valdés',
 'https://vimeo.com/ejemplo/angustia-webinar',
 'ANGUSTIA',
 '["angustia", "tecnicas", "mindfulness", "respiracion"]',
 'TODOS',
 30,
 TRUE,
 'prof-maria',
 '2026-01-20'),

('ARTICULO', 'La Neurociencia de la Reprogramación Emocional',
 'Artículo científico divulgativo sobre cómo funciona la reprogramación focal a nivel cerebral.',
 'Clínica Equilibrar',
 'https://equilibrar.cl/blog/neurociencia-reprogramacion',
 'AMBOS',
 '["neurociencia", "investigacion", "cerebro", "evidencia"]',
 'INTERMEDIO',
 10,
 FALSE,
 'admin-claudio',
 '2025-12-10'),

('HERRAMIENTA', 'Registro de Pensamientos Automáticos',
 'Plantilla descargable para llevar registro diario de pensamientos y emociones.',
 'Equipo Clínico',
 '/biblioteca/herramientas/registro-pensamientos.xlsx',
 'GENERAL',
 '["herramienta", "registro", "pensamientos", "autocuidado"]',
 'TODOS',
 NULL,
 TRUE,
 'coord-sofia',
 '2026-01-05'),

('PODCAST', 'Ep. 12: Historias de Transformación - Superando la Culpa',
 'Podcast con testimonios anónimos de pacientes que completaron el programa RFAI Culpa.',
 'Podcast Equilibrar',
 'https://spotify.com/equilibrar/ep12',
 'CULPA',
 '["testimonios", "inspiracion", "casos_reales", "esperanza"]',
 'TODOS',
 25,
 TRUE,
 NULL,
 '2026-01-10');

-- ============================================================================
-- 6. CONFIGURACIÓN ADICIONAL
-- ============================================================================

-- Agregar más configuraciones realistas
INSERT INTO `configuracion_sistema` (`clave`, `valor`, `tipo_dato`, `categoria`, `descripción`) VALUES
('audio_quality_default', 'high', 'STRING', 'media', 'Calidad por defecto de audios (low, medium, high)'),
('allow_offline_download', 'true', 'BOOLEAN', 'media', 'Permitir descarga de audios para escucha offline'),
('notification_sound_enabled', 'true', 'BOOLEAN', 'notifications', 'Reproducir sonido al recibir notificación'),
('max_file_upload_mb', '50', 'INTEGER', 'uploads', 'Tamaño máximo de archivos subidos (en MB)'),
('professional_max_patients', '15', 'INTEGER', 'appointments', 'Máximo de pacientes activos por profesional'),
('test_reminder_days_before', '2', 'INTEGER', 'tests', 'Días antes de enviar recordatorio de test'),
('session_reminder_hours_before', '24', 'INTEGER', 'appointments', 'Horas antes de enviar recordatorio de sesión'),
('auto_lock_after_weeks', '8', 'INTEGER', 'security', 'Semanas de inactividad antes de bloquear cuenta'),
('feedback_request_after_resource', 'true', 'BOOLEAN', 'feedback', 'Solicitar feedback automáticamente después de completar recurso')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- RESUMEN DE DATOS INSERTADOS
-- ============================================================================
/*
✅ CITAS: 7 citas distribuidas entre 3 pacientes
   - Lucía: 1 realizada + 1 programada
   - Pedro: 3 realizadas (avanzado)
   - Ana: 1 realizada + 1 programada

✅ NOTIFICACIONES: 6 notificaciones variadas
   - Desbloques de semana
   - Recordatorios de citas
   - Recursos disponibles
   - Mensajes profesionales
   - Tests pendientes
   - Avisos sistema

✅ FEEDBACK: 5 valoraciones de recursos
   - Audios: 2 valoraciones (5 y 3 estrellas)
   - Tests: 1 valoración (5 estrellas)
   - Guías: 1 valoración (4 estrellas)
   - Sesiones: 1 valoración (5 estrellas)

✅ NOTAS CLÍNICAS: 3 notas estructuradas
   - 1 Evaluación inicial (Lucía)
   - 1 Seguimiento (Pedro)
   - 1 Observación (Ana)

✅ BIBLIOTECA: 5 recursos educativos
   - PDF sobre culpa
   - Video webinar angustia
   - Artículo científico
   - Herramienta de registro
   - Podcast testimonial

✅ CONFIGURACIÓN: 9 configuraciones adicionales del sistema
*/
