-- Base de datos: reprogramacion_foca
-- Motor: MySQL (Google Cloud SQL)
-- Autor: Equipo Clínico Equilibrar / Frontend Developer

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. Tabla de Usuarios (Base para todos los roles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL, -- UUID recomendado para producción
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
-- 2. Perfil de Pacientes (Extensión de usuarios con rol CLIENT)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `client_profiles` (
  `user_id` VARCHAR(50) NOT NULL,
  `current_week` INT DEFAULT 1 CHECK (`current_week` BETWEEN 1 AND 4),
  `start_date` DATE NOT NULL,
  `next_session` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_client_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Progreso Semanal (Control de desbloqueo y tareas por semana)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `client_week_progress` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `week_number` INT NOT NULL CHECK (`week_number` BETWEEN 1 AND 4),
  `is_locked` BOOLEAN DEFAULT TRUE,
  `is_completed` BOOLEAN DEFAULT FALSE,
  `initial_test_done` BOOLEAN DEFAULT FALSE,
  `guide_completed` BOOLEAN DEFAULT FALSE,
  `audio_listened_count` INT DEFAULT 0,
  `meeting_attended` BOOLEAN DEFAULT FALSE,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_client_week` (`client_id`, `week_number`),
  CONSTRAINT `fk_progress_client` FOREIGN KEY (`client_id`) REFERENCES `client_profiles` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Resultados de Tests Clínicos (Historial RFAI)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clinical_test_results` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `week_number` INT NOT NULL,
  `score_autojuicio` INT NOT NULL COMMENT 'Escala 6-30',
  `score_culpa_no_adaptativa` INT NOT NULL COMMENT 'Escala 5-25',
  `score_responsabilidad_consciente` INT NOT NULL COMMENT 'Escala 7-35',
  `score_humanizacion_error` INT NOT NULL COMMENT 'Escala 2-10',
  PRIMARY KEY (`id`),
  KEY `idx_client_date` (`client_id`, `date`),
  CONSTRAINT `fk_test_client` FOREIGN KEY (`client_id`) REFERENCES `client_profiles` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Estadísticas de Uso de Audio
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audio_usage_stats` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `minutes_listened` INT NOT NULL DEFAULT 0,
  `audio_identifier` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_audio_client` FOREIGN KEY (`client_id`) REFERENCES `client_profiles` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Guías y Preguntas (Contenido Estático/Dinámico)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `guide_questions` (
  `id` VARCHAR(50) NOT NULL,
  `week_number` INT NOT NULL,
  `step_title` VARCHAR(100),
  `question_text` TEXT NOT NULL,
  `question_type` ENUM('text', 'scale', 'choice') NOT NULL,
  `display_order` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Respuestas de Clientes a Guías
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `client_guide_responses` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `question_id` VARCHAR(50) NOT NULL,
  `response_text` TEXT,
  `response_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_response_client` FOREIGN KEY (`client_id`) REFERENCES `client_profiles` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_response_question` FOREIGN KEY (`question_id`) REFERENCES `guide_questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
