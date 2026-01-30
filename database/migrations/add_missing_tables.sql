-- ============================================================================
-- MIGRACIONES - TABLAS FALTANTES Y CORRECCIONES
-- Versión: 3.1
-- Fecha: 2026-01-30
-- Propósito: Agregar tablas identificadas en auditoría types.ts vs schema
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1.  TABLA DE CITAS/SESIONES (CRÍTICO)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `citas` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `matricula_id` INT NOT NULL,
  `profesional_id` VARCHAR(50) NOT NULL,
  `tipo_sesion` ENUM('PRESENCIAL', 'VIRTUAL', 'TELEFONICA') DEFAULT 'VIRTUAL',
  `numero_sesion` INT NOT NULL COMMENT 'Número correlativo de sesión (1, 2, 3...)',
  `semana_asociada` INT DEFAULT NULL COMMENT 'Semana del programa (1-4) si aplica',
  `fecha_programada` DATETIME NOT NULL,
  `fecha_realizada` DATETIME DEFAULT NULL,
  `duracion_minutos` INT DEFAULT 60,
  `estado` ENUM('PROGRAMADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'NO_ASISTIO') DEFAULT 'PROGRAMADA',
  `link_reunion` TEXT COMMENT 'URL de Meet/Zoom si es virtual',
  `notas_pre_sesion` TEXT COMMENT 'Notas del pofesional antes de la sesión',
  `notas_post_sesion` TEXT COMMENT 'Resumen de lo trabajado',
  `objetivos_sesion` JSON COMMENT 'Array de objetivos planificados',
  `asistencia_confirmada` BOOLEAN DEFAULT FALSE,
  `cancelado_por` VARCHAR(50) DEFAULT NULL COMMENT 'ID de quien canceló',
  `motivo_cancelacion` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cita_matricula` FOREIGN KEY (`matricula_id`) REFERENCES `matriculas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cita_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  INDEX `idx_fecha_programada` (`fecha_programada`),
  INDEX `idx_profesional_fecha` (`profesional_id`, `fecha_programada`),
  INDEX `idx_matricula_estado` (`matricula_id`, `estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Gestión de citas y sesiones terapéuticas';

-- ============================================================================
-- 2. TABLA DE NOTIFICACIONES (CRÍTICO)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `usuario_id` VARCHAR(50) NOT NULL,
  `tipo` ENUM(
    'SEMANA_DESBLOQUEADA', 
    'RECORDATORIO_CITA', 
    'RECURSO_DISPONIBLE', 
    'TEST_PENDIENTE',
    'MENSAJE_PROFESIONAL',
    'SISTEMA'
  ) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') DEFAULT 'MEDIA',
  `leida` BOOLEAN DEFAULT FALSE,
  `fecha_leida` DATETIME DEFAULT NULL,
  `action_url` VARCHAR(255) DEFAULT NULL COMMENT 'URL a donde redirigir al hacer click',
  `metadata` JSON COMMENT 'Datos adicionales: {cita_id, recurso_id, etc}',
  `enviada_por` VARCHAR(50) DEFAULT NULL COMMENT 'ID del usuario que generó la notificación (si aplica)',
  `fecha_envio` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `expira_en` DATETIME DEFAULT NULL COMMENT 'Fecha después de la cual la notificación se oculta',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_enviada_por` FOREIGN KEY (`enviada_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  INDEX `idx_usuario_leida` (`usuario_id`, `leida`),
  INDEX `idx_tipo` (`tipo`),
  INDEX `idx_fecha_envio` (`fecha_envio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sistema de notificaciones para usuarios';

-- ============================================================================
-- 3. TABLA DE FEEDBACK/VALORACIONES (IMPORTANTE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `feedback_recursos` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `usuario_id` VARCHAR(50) NOT NULL,
  `recurso_id` INT NOT NULL,
  `tipo_recurso` ENUM('AUDIO', 'VIDEO_MEET', 'TEST', 'GUIA', 'DOCUMENTO') NOT NULL,
  `valoracion` INT NOT NULL CHECK (`valoracion` BETWEEN 1 AND 5),
  `comentario` TEXT,
  `fue_util` BOOLEAN DEFAULT NULL COMMENT 'Pregunta directa: ¿Te fue útil este recurso?',
  `fecha_feedback` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `metadata` JSON COMMENT 'Info adicional: {sentimiento, dificultad_percibida, etc}',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_feedback_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feedback_recurso` FOREIGN KEY (`recurso_id`) REFERENCES `recursos` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_usuario_recurso` (`usuario_id`, `recurso_id`),
  INDEX `idx_valoracion` (`valoracion`),
  INDEX `idx_recurso` (`recurso_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Valoraciones y feedback de los clientes sobre recursos';

-- ============================================================================
-- 4. TABLA DE NOTAS CLÍNICAS ESTRUCTURADAS (IMPORTANTE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `notas_clinicas` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `matricula_id` INT NOT NULL,
  `profesional_id` VARCHAR(50) NOT NULL,
  `cita_id` INT DEFAULT NULL COMMENT 'Si la nota está asociada a una sesión específica',
  `tipo_nota` ENUM('EVALUACION_INICIAL', 'SEGUIMIENTO', 'CRISIS', 'CIERRE', 'OBSERVACION') NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `contenido` TEXT NOT NULL,
  `observaciones_clinicas` JSON COMMENT 'Estructura: {humor, ansiedad, adherencia, etc}',
  `plan_accion` TEXT COMMENT 'Próximos pasos o intervenciones planificadas',
  `tags` JSON COMMENT 'Array de etiquetas: ["progreso", "resistencia", etc]',
  `nivel_riesgo` ENUM('NINGUNO', 'BAJO', 'MEDIO', 'ALTO') DEFAULT 'NINGUNO',
  `visible_para_cliente` BOOLEAN DEFAULT FALSE COMMENT 'Si el cliente puede ver esta nota',
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_nota_matricula` FOREIGN KEY (`matricula_id`) REFERENCES `matriculas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nota_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nota_cita` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE SET NULL,
  INDEX `idx_matricula_tipo` (`matricula_id`, `tipo_nota`),
  INDEX `idx_profesional` (`profesional_id`),
  INDEX `idx_fecha` (`fecha_creacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro estructurado de evolución clínica del paciente';

-- ============================================================================
-- 5. TABLA DE BIBLIOTECA DE RECURSOS (MEJORA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `biblioteca_recursos` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `categoria` ENUM('ARTICULO', 'VIDEO', 'PDF', 'PODCAST', 'HERRAMIENTA', 'ENLACE') NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT,
  `autor` VARCHAR(150),
  `url_recurso` TEXT NOT NULL,
  `dimension_relacionada` ENUM('ANGUSTIA', 'CULPA', 'AMBOS', 'GENERAL') DEFAULT 'GENERAL',
  `tags` JSON COMMENT 'Array de palabras clave',
  `nivel_recomendado` ENUM('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'TODOS') DEFAULT 'TODOS',
  `duracion_minutos` INT DEFAULT NULL,
  `idioma` VARCHAR(5) DEFAULT 'es',
  `destacado` BOOLEAN DEFAULT FALSE,
  `visitas` INT DEFAULT 0,
  `valoracion_promedio` DECIMAL(3,2) DEFAULT NULL,
  `visible` BOOLEAN DEFAULT TRUE,
  `creado_por` VARCHAR(50) DEFAULT NULL,
  `fecha_publicacion` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_biblioteca_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  INDEX `idx_categoria` (`categoria`),
  INDEX `idx_dimension` (`dimension_relacionada`),
  INDEX `idx_destacado` (`destacado`, `visible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Biblioteca de recursos educativos complementarios';

-- ============================================================================
-- 6. TABLA DE CONFIGURACIÓN DEL SISTEMA (MEJORA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `configuracion_sistema` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `clave` VARCHAR(100) NOT NULL COMMENT 'Ejemplo: heartbeat_interval, email_template_welcome',
  `valor` TEXT NOT NULL,
  `tipo_dato` ENUM('STRING', 'INTEGER', 'BOOLEAN', 'JSON', 'EMAIL', 'URL') DEFAULT 'STRING',
  `categoria` VARCHAR(50) DEFAULT 'GENERAL' COMMENT 'Ejemplo: analytics, notifications, security',
  `descripcion` TEXT,
  `editable_por_admin` BOOLEAN DEFAULT TRUE,
  `valor_por_defecto` TEXT,
  `validacion_regex` VARCHAR(255) DEFAULT NULL,
  `modificado_por` VARCHAR(50) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_clave` (`clave`),
  CONSTRAINT `fk_config_modificado_por` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  INDEX `idx_categoria` (`categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuraciones del sistema centralizadas';

-- ============================================================================
-- 7. CORRECCIONES A TABLAS EXISTENTES
-- ============================================================================

-- Agregar columna 'semana' a recursos (calculada desde modulo_id)
ALTER TABLE `recursos` 
ADD COLUMN `semana` INT GENERATED ALWAYS AS (
  (SELECT numero_semana FROM modulos_semanales WHERE id = modulo_id)
) VIRTUAL
COMMENT 'Semana asociada (calculada desde módulo)';

-- Agregar columna 'pasos_totales' a guia_progreso
ALTER TABLE `guia_progreso`
ADD COLUMN `pasos_totales` INT DEFAULT NULL COMMENT 'Total de pasos en la guía',
ADD COLUMN `porcentaje_completado` DECIMAL(5,2) GENERATED ALWAYS AS (
  CASE 
    WHEN pasos_totales > 0 THEN (paso_actual / pasos_totales * 100)
    ELSE 0
  END
) VIRTUAL;

-- Agregar columna 'semana' a test_resultados
ALTER TABLE `test_resultados`
ADD COLUMN `semana` INT DEFAULT NULL COMMENT 'Semana del programa cuando se realizó el test',
ADD INDEX `idx_semana` (`semana`);

-- Renombrar columna en logs_consumo_media para mayor claridad
ALTER TABLE `logs_consumo_media`
CHANGE COLUMN `timestamp_heartbeat` `fecha_reproduccion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD INDEX `idx_fecha_reproduccion` (`fecha_reproduccion`);

-- ============================================================================
-- 8. CONFIGURACIONES INICIALES
-- ============================================================================

-- Insertar configuraciones base del sistema
INSERT INTO `configuracion_sistema` (`clave`, `valor`, `tipo_dato`, `categoria`, `descripcion`) VALUES
('heartbeat_interval_seconds', '30', 'INTEGER', 'analytics', 'Intervalo en segundos para envío de heartbeat de audios'),
('notificaciones_enabled', 'true', 'BOOLEAN', 'notifications', 'Activar/desactivar sistema de notificaciones'),
('email_reminders_enabled', 'true', 'BOOLEAN', 'notifications', 'Enviar recordatorios por email'),
('session_duration_minutes', '60', 'INTEGER', 'appointments', 'Duración por defecto de sesiones en minutos'),
('max_sessions_per_day', '8', 'INTEGER', 'appointments', 'Máximo de sesiones que puede tener un profesional por día'),
('test_timeout_minutes', '45', 'INTEGER', 'tests', 'Tiempo máximo para completar un test'),
('biblioteca_visible_todos', 'true', 'BOOLEAN', 'biblioteca', 'Biblioteca visible para todos los clientes')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- FIN DE MIGRACIONES
-- ============================================================================
