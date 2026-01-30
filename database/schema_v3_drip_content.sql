-- ============================================================================
-- SISTEMA RFAI - CLÍNICA EQUILIBRAR
-- Base de Datos: reprogramacion_foca
-- Motor: MariaDB/MySQL (XAMPP Compatible)
-- Versión: 3.0 - Sistema de 4 Semanas con Desbloqueo Temporal
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- ============================================================================
-- CAPA 1: SEGURIDAD Y USUARIOS
-- ============================================================================

-- Tabla de Usuarios Base
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` VARCHAR(50) NOT NULL COMMENT 'UUID o ID único',
  `nombre_completo` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'bcrypt hash - NULL para OAuth',
  `avatar_url` TEXT,
  `telefono` VARCHAR(20),
  `fecha_nacimiento` DATE,
  `estado` ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
  `ultimo_acceso` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  INDEX `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `nombre` ENUM('ADMIN', 'COORDINADOR', 'PROFESIONAL', 'CLIENTE') NOT NULL,
  `descripcion` TEXT,
  `permisos` JSON COMMENT 'Estructura: {"modulos": ["usuarios", "programas"], "acciones": ["crear", "editar"]}',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación Usuario-Rol (Muchos a Muchos)
CREATE TABLE IF NOT EXISTS `usuario_roles` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `usuario_id` VARCHAR(50) NOT NULL,
  `rol_id` INT NOT NULL,
  `asignado_por` VARCHAR(50) DEFAULT NULL COMMENT 'Admin que asignó el rol',
  `asignado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ur_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_asignador` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  UNIQUE KEY `unique_usuario_rol` (`usuario_id`, `rol_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Auditoría de Acciones Administrativas
CREATE TABLE IF NOT EXISTS `auditoria_admin` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `admin_id` VARCHAR(50) NOT NULL,
  `accion` VARCHAR(100) NOT NULL COMMENT 'Ejemplo: ELIMINAR_RECURSO, CAMBIAR_ROL',
  `tabla_afectada` VARCHAR(50),
  `registro_id` VARCHAR(50),
  `datos_anteriores` JSON COMMENT 'Estado antes del cambio',
  `datos_nuevos` JSON COMMENT 'Estado después del cambio',
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_audit_admin` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  INDEX `idx_accion` (`accion`),
  INDEX `idx_fecha` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CAPA 2: ESTRUCTURA DEL PROGRAMA RFAI
-- ============================================================================

-- Programas Terapéuticos
CREATE TABLE IF NOT EXISTS `programas` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `slug` VARCHAR(50) NOT NULL COMMENT 'Ejemplo: angustia, culpa',
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `dimension_principal` ENUM('ANGUSTIA', 'CULPA') NOT NULL,
  `duracion_semanas` INT DEFAULT 4,
  `color_tema` VARCHAR(7) DEFAULT '#3B82F6' COMMENT 'Hex color para UI',
  `activo` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Módulos Semanales (Estructura temporal del programa)
CREATE TABLE IF NOT EXISTS `modulos_semanales` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `programa_id` INT NOT NULL,
  `numero_semana` INT NOT NULL CHECK (`numero_semana` BETWEEN 1 AND 4),
  `titulo` VARCHAR(150) NOT NULL,
  `descripcion` TEXT,
  `dias_para_desbloqueo` INT NOT NULL COMMENT 'Días desde fecha_inicio. S1=0, S2=7, S3=14, S4=21',
  `objetivos` JSON COMMENT 'Array de objetivos de la semana',
  `orden` INT DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_modulo_programa` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_programa_semana` (`programa_id`, `numero_semana`),
  INDEX `idx_desbloqueo` (`dias_para_desbloqueo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recursos (Polimórfica: Audios, Links Meet, Definiciones de Tests)
CREATE TABLE IF NOT EXISTS `recursos` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `modulo_id` INT NOT NULL,
  `tipo` ENUM('AUDIO', 'VIDEO_MEET', 'TEST', 'DOCUMENTO', 'ENLACE') NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `titulo` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `url_recurso` TEXT COMMENT 'URL del audio/video/documento',
  `duracion_minutos` INT DEFAULT NULL COMMENT 'Para audios/videos',
  `metadata` JSON COMMENT 'Datos específicos del tipo: {meet_url, test_config, etc}',
  `orden` INT DEFAULT 0,
  `obligatorio` BOOLEAN DEFAULT TRUE,
  `activo` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_recurso_modulo` FOREIGN KEY (`modulo_id`) REFERENCES `modulos_semanales` (`id`) ON DELETE CASCADE,
  INDEX `idx_tipo` (`tipo`),
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CAPA 3: MATRÍCULAS Y ASIGNACIONES
-- ============================================================================

-- Matrículas (Vincula Usuario-Programa-Profesional)
CREATE TABLE IF NOT EXISTS `matriculas` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `cliente_id` VARCHAR(50) NOT NULL,
  `programa_id` INT NOT NULL,
  `profesional_id` VARCHAR(50) DEFAULT NULL COMMENT 'Profesional asignado',
  `fecha_inicio` DATE NOT NULL COMMENT 'Fecha crucial para calcular desbloqueos',
  `fecha_finalizacion` DATE DEFAULT NULL,
  `estado` ENUM('ACTIVO', 'COMPLETADO', 'CANCELADO', 'PAUSADO') DEFAULT 'ACTIVO',
  `progreso_general` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Porcentaje 0-100',
  `notas_profesional` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_matricula_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_matricula_programa` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_matricula_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  INDEX `idx_cliente_estado` (`cliente_id`, `estado`),
  INDEX `idx_fecha_inicio` (`fecha_inicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CAPA 4: GUÍAS INTERACTIVAS (JSON-DRIVEN)
-- ============================================================================

-- Estructura de Guías (Definición de preguntas en JSON)
CREATE TABLE IF NOT EXISTS `guia_estructuras` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `modulo_id` INT NOT NULL,
  `titulo` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `estructura_json` JSON NOT NULL COMMENT 'Pasos y preguntas: {steps: [{title, questions: [{id, type, text, options}]}]}',
  `version` INT DEFAULT 1,
  `activa` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_guia_modulo` FOREIGN KEY (`modulo_id`) REFERENCES `modulos_semanales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Progreso de Guías (Respuestas del usuario + paso actual)
CREATE TABLE IF NOT EXISTS `guia_progreso` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `matricula_id` INT NOT NULL,
  `guia_id` INT NOT NULL,
  `paso_actual` INT DEFAULT 0 COMMENT 'Índice del paso donde se quedó',
  `respuestas_json` JSON COMMENT 'Objeto con {question_id: answer_value}',
  `completado` BOOLEAN DEFAULT FALSE,
  `fecha_inicio` DATETIME DEFAULT NULL,
  `fecha_completado` DATETIME DEFAULT NULL,
  `ultima_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_progreso_matricula` FOREIGN KEY (`matricula_id`) REFERENCES `matriculas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progreso_guia` FOREIGN KEY (`guia_id`) REFERENCES `guia_estructuras` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_matricula_guia` (`matricula_id`, `guia_id`),
  INDEX `idx_completado` (`completado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CAPA 5: TESTS CLÍNICOS (RFAI)
-- ============================================================================

-- Resultados de Tests
CREATE TABLE IF NOT EXISTS `test_resultados` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `matricula_id` INT NOT NULL,
  `recurso_id` INT NOT NULL COMMENT 'FK a recursos donde tipo=TEST',
  `fecha_realizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_test` ENUM('INICIAL', 'COMPARATIVO', 'FINAL') NOT NULL,
  -- Scores RFAI Culpa
  `score_autojuicio` INT DEFAULT NULL CHECK (`score_autojuicio` BETWEEN 6 AND 30),
  `score_culpa_no_adaptativa` INT DEFAULT NULL CHECK (`score_culpa_no_adaptativa` BETWEEN 5 AND 25),
  `score_responsabilidad_consciente` INT DEFAULT NULL CHECK (`score_responsabilidad_consciente` BETWEEN 7 AND 35),
  `score_humanizacion_error` INT DEFAULT NULL CHECK (`score_humanizacion_error` BETWEEN 2 AND 10),
  -- Scores RFAI Angustia
  `score_angustia_anticipatoria` INT DEFAULT NULL CHECK (`score_angustia_anticipatoria` BETWEEN 4 AND 20),
  `score_autoculpabilizacion_angustia` INT DEFAULT NULL CHECK (`score_autoculpabilizacion_angustia` BETWEEN 5 AND 25),
  `score_desconexion_amor_propio` INT DEFAULT NULL CHECK (`score_desconexion_amor_propio` BETWEEN 3 AND 15),
  `score_regulacion_amor` INT DEFAULT NULL CHECK (`score_regulacion_amor` BETWEEN 5 AND 25),
  -- Metadata
  `respuestas_completas` JSON COMMENT 'Todas las respuestas del test',
  `tiempo_completado_minutos` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_test_matricula` FOREIGN KEY (`matricula_id`) REFERENCES `matriculas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_test_recurso` FOREIGN KEY (`recurso_id`) REFERENCES `recursos` (`id`) ON DELETE CASCADE,
  INDEX `idx_matricula_tipo` (`matricula_id`, `tipo_test`),
  INDEX `idx_fecha` (`fecha_realizacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CAPA 6: ANALÍTICA Y LOGS
-- ============================================================================

-- Logs de Consumo de Media (Audios/Videos - Heartbeat System)
CREATE TABLE IF NOT EXISTS `logs_consumo_media` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `matricula_id` INT NOT NULL,
  `recurso_id` INT NOT NULL,
  `sesion_reproduccion` VARCHAR(50) NOT NULL COMMENT 'UUID de sesión de reproducción',
  `timestamp_inicio` DATETIME NOT NULL,
  `timestamp_heartbeat` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `segundos_reproducidos` INT NOT NULL DEFAULT 30 COMMENT 'Incremento por heartbeat (30s)',
  `marcador_tiempo` INT NOT NULL COMMENT 'Posición en el audio (segundos)',
  `completado` BOOLEAN DEFAULT FALSE,
  `metadata` JSON COMMENT 'Device info, browser, etc',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_log_matricula` FOREIGN KEY (`matricula_id`) REFERENCES `matriculas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_log_recurso` FOREIGN KEY (`recurso_id`) REFERENCES `recursos` (`id`) ON DELETE CASCADE,
  INDEX `idx_matricula_recurso` (`matricula_id`, `recurso_id`),
  INDEX `idx_sesion` (`sesion_reproduccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs de Acceso (Para tracking general)
CREATE TABLE IF NOT EXISTS `logs_acceso` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `usuario_id` VARCHAR(50) NOT NULL,
  `ruta` VARCHAR(255) NOT NULL COMMENT 'Endpoint o página accedida',
  `metodo` VARCHAR(10) DEFAULT 'GET',
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_log_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  INDEX `idx_timestamp` (`timestamp`),
  INDEX `idx_usuario_fecha` (`usuario_id`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Insertar Roles Predefinidos
INSERT INTO `roles` (`nombre`, `descripcion`, `permisos`) VALUES
('ADMIN', 'Administrador del sistema con acceso total', '{"modulos": ["todos"], "acciones": ["todos"]}'),
('COORDINADOR', 'Coordinador clínico con acceso a gestión de programas', '{"modulos": ["programas", "matriculas"], "acciones": ["crear", "editar", "ver"]}'),
('PROFESIONAL', 'Profesional que atiende clientes', '{"modulos": ["clientes_asignados"], "acciones": ["ver", "editar_notas"]}'),
('CLIENTE', 'Usuario final del programa terapéutico', '{"modulos": ["mi_programa"], "acciones": ["ver", "completar"]}');

-- Insertar Programas Base
INSERT INTO `programas` (`slug`, `nombre`, `descripcion`, `dimension_principal`, `duracion_semanas`, `color_tema`) VALUES
('angustia', 'Programa RFAI - Angustia', 'Reprogramación Focalizada para manejo de angustia anticipatoria', 'ANGUSTIA', 4, '#EF4444'),
('culpa', 'Programa RFAI - Culpa', 'Reprogramación Focalizada para procesamiento adaptativo de culpa', 'CULPA', 4, '#3B82F6');

-- Insertar Módulos Semanales para Programa Angustia
INSERT INTO `modulos_semanales` (`programa_id`, `numero_semana`, `titulo`, `descripcion`, `dias_para_desbloqueo`, `orden`) VALUES
(1, 1, 'Semana 1: Evaluación Inicial', 'Test inicial y primera sesión', 0, 1),
(1, 2, 'Semana 2: Reprogramación Inicial', 'Audio de reprogramación y test comparativo', 7, 2),
(1, 3, 'Semana 3: Profundización', 'Guía de trabajo personal y audio reforzado', 14, 3),
(1, 4, 'Semana 4: Integración', 'Sesión final y test de cierre', 21, 4);

-- Insertar Módulos Semanales para Programa Culpa
INSERT INTO `modulos_semanales` (`programa_id`, `numero_semana`, `titulo`, `descripcion`, `dias_para_desbloqueo`, `orden`) VALUES
(2, 1, 'Semana 1: Evaluación Inicial', 'Test inicial y primera sesión', 0, 1),
(2, 2, 'Semana 2: Reprogramación Inicial', 'Audio de reprogramación y test comparativo', 7, 2),
(2, 3, 'Semana 3: Profundización', 'Guía de trabajo personal y audio reforzado', 14, 3),
(2, 4, 'Semana 4: Integración', 'Sesión final y test de cierre', 21, 4);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO ADICIONALES
-- ============================================================================

-- Optimización para consultas de desbloqueo temporal
CREATE INDEX idx_matricula_desbloqueo ON matriculas(cliente_id, fecha_inicio, estado);

-- Optimización para analítica de consumo
CREATE INDEX idx_logs_analytics ON logs_consumo_media(matricula_id, timestamp_heartbeat);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
