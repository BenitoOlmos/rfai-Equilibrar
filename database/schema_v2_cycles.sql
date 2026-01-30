-- ============================================================================
-- RFAI Enhanced Schema - 2-Session Cycle Model
-- Version: 2.0
-- Created: 2024-01-29
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. Tabla de Usuarios (Sin cambios - mantener compatibilidad)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `role` ENUM('ADMIN', 'COORDINATOR', 'PROFESSIONAL', 'CLIENT') NOT NULL,
  `avatar` TEXT,
  `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Ciclos de Tratamiento (NUEVO - Reemplaza sistema de semanas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclos_tratamiento` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `dimension` ENUM('ANGUSTIA', 'CULPA') NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_cierre` DATE DEFAULT NULL,
  `estado` ENUM('ACTIVO', 'COMPLETADO', 'CANCELADO') DEFAULT 'ACTIVO',
  `profesional_id` VARCHAR(50) DEFAULT NULL COMMENT 'Profesional asignado',
  `notas_ciclo` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ciclo_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ciclo_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_client_estado` (`client_id`, `estado`),
  INDEX `idx_dimension` (`dimension`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Citas/Sesiones (NUEVO - Reemplaza reuniones genéricas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `citas` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `ciclo_id` INT NOT NULL,
  `numero_sesion` ENUM('1', '2') NOT NULL,
  `fecha_programada` DATETIME NOT NULL,
  `fecha_realizada` DATETIME DEFAULT NULL,
  `estado` ENUM('PROGRAMADA', 'REALIZADO', 'CANCELADA') DEFAULT 'PROGRAMADA',
  `notas_sesion` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cita_ciclo` FOREIGN KEY (`ciclo_id`) REFERENCES `ciclos_tratamiento` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_sesion_ciclo` (`ciclo_id`, `numero_sesion`),
  INDEX `idx_fecha_programada` (`fecha_programada`),
  INDEX `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Catálogo de Materiales (NUEVO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `materiales` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `tipo` ENUM('TEST_INICIAL', 'AUDIO', 'TEST_INTERMEDIO', 'GUIA_MANTENIMIENTO') NOT NULL,
  `dimension` ENUM('ANGUSTIA', 'CULPA', 'AMBOS') NOT NULL,
  `titulo` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `url_recurso` TEXT COMMENT 'URL o ruta del archivo',
  `duracion_minutos` INT DEFAULT NULL,
  `prerequisito` ENUM('NINGUNO', 'SESION_1', 'SESION_2') DEFAULT 'NINGUNO',
  `orden_visualizacion` INT DEFAULT 0,
  `activo` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tipo_dimension` (`tipo`, `dimension`),
  INDEX `idx_prerequisito` (`prerequisito`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Control de Acceso a Materiales (NUEVO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `acceso_materiales` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `ciclo_id` INT NOT NULL,
  `material_id` INT NOT NULL,
  `desbloqueado_en` DATETIME DEFAULT NULL,
  `completado_en` DATETIME DEFAULT NULL,
  `progreso_porcentaje` INT DEFAULT 0 CHECK (`progreso_porcentaje` BETWEEN 0 AND 100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_acceso_ciclo` FOREIGN KEY (`ciclo_id`) REFERENCES `ciclos_tratamiento` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_acceso_material` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_acceso` (`ciclo_id`, `material_id`),
  INDEX `idx_desbloqueado` (`desbloqueado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Resultados de Tests (MODIFICADO - Vincular a ciclos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clinical_test_results` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `ciclo_id` INT NOT NULL,
  `material_id` INT DEFAULT NULL COMMENT 'Referencia al test realizado',
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_test` ENUM('INICIAL', 'INTERMEDIO', 'FINAL') NOT NULL,
  -- Dimensiones RFAI Culpa
  `score_autojuicio` INT DEFAULT NULL COMMENT 'Escala 6-30',
  `score_culpa_no_adaptativa` INT DEFAULT NULL COMMENT 'Escala 5-25',
  `score_responsabilidad_consciente` INT DEFAULT NULL COMMENT 'Escala 7-35',
  `score_humanizacion_error` INT DEFAULT NULL COMMENT 'Escala 2-10',
  -- Dimensiones RFAI Angustia
  `score_angustia_anticipatoria` INT DEFAULT NULL COMMENT 'Rango 4-20',
  `score_autoculpabilizacion_angustia` INT DEFAULT NULL COMMENT 'Rango 5-25',
  `score_desconexion_amor_propio` INT DEFAULT NULL COMMENT 'Rango 3-15',
  `score_regulacion_amor` INT DEFAULT NULL COMMENT 'Rango 5-25',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_test_ciclo` FOREIGN KEY (`ciclo_id`) REFERENCES `ciclos_tratamiento` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_test_material` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON DELETE SET NULL,
  INDEX `idx_ciclo_fecha` (`ciclo_id`, `fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Estadísticas de Uso de Audio (MODIFICADO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audio_usage_stats` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `ciclo_id` INT NOT NULL,
  `material_id` INT NOT NULL,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `minutos_escuchados` INT NOT NULL DEFAULT 0,
  `completado` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_audio_ciclo` FOREIGN KEY (`ciclo_id`) REFERENCES `ciclos_tratamiento` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audio_material` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON DELETE CASCADE,
  INDEX `idx_ciclo_material` (`ciclo_id`, `material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Respuestas a Guías (MODIFICADO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `guia_responses` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `ciclo_id` INT NOT NULL,
  `material_id` INT NOT NULL,
  `pregunta_numero` INT NOT NULL,
  `respuesta_texto` TEXT,
  `fecha_respuesta` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_response_ciclo` FOREIGN KEY (`ciclo_id`) REFERENCES `ciclos_tratamiento` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_response_material` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON DELETE CASCADE,
  INDEX `idx_ciclo_material` (`ciclo_id`, `material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATOS INICIALES - Catálogo de Materiales
-- ============================================================================

-- Materiales para CULPA
INSERT INTO `materiales` (`tipo`, `dimension`, `titulo`, `descripcion`, `prerequisito`, `orden_visualizacion`, `duracion_minutos`) VALUES
('TEST_INICIAL', 'CULPA', 'Test Inicial RFAI - Culpa', 'Evaluación inicial de dimensiones de culpa', 'NINGUNO', 1, NULL),
('AUDIO', 'CULPA', 'Audio de Reprogramación - Culpa', 'Audio guiado para trabajar la culpa adaptativa', 'SESION_1', 2, 15),
('TEST_INTERMEDIO', 'CULPA', 'Test Intermedio RFAI - Culpa', 'Evaluación de progreso tras Sesión 1', 'SESION_1', 3, NULL),
('GUIA_MANTENIMIENTO', 'CULPA', 'Guía de Mantenimiento - Culpa', 'Herramientas para sostener cambios logrados', 'SESION_2', 4, NULL);

-- Materiales para ANGUSTIA
INSERT INTO `materiales` (`tipo`, `dimension`, `titulo`, `descripcion`, `prerequisito`, `orden_visualizacion`, `duracion_minutos`) VALUES
('TEST_INICIAL', 'ANGUSTIA', 'Test Inicial RFAI - Angustia', 'Evaluación inicial de dimensiones de angustia', 'NINGUNO', 1, NULL),
('AUDIO', 'ANGUSTIA', 'Audio de Reprogramación - Angustia', 'Audio guiado para trabajar angustia anticipatoria', 'SESION_1', 2, 15),
('TEST_INTERMEDIO', 'ANGUSTIA', 'Test Intermedio RFAI - Angustia', 'Evaluación de progreso tras Sesión 1', 'SESION_1', 3, NULL),
('GUIA_MANTENIMIENTO', 'ANGUSTIA', 'Guía de Mantenimiento - Angustia', 'Herramientas para sostener cambios logrados', 'SESION_2', 4, NULL);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- NOTAS DE MIGRACIÓN
-- ============================================================================
-- Las tablas antiguas (client_profiles, client_week_progress) se mantienen
-- temporalmente para permitir migración gradual. 
-- Ejecutar migration_to_cycles.sql después de verificar que este schema funciona.
