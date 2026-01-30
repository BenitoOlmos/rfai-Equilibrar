-- ============================================================================
-- AUDITORÍA ADMINISTRATIVA
-- Propósito: Crear tabla para registrar acciones de admins y coordinadores
-- ============================================================================

CREATE TABLE IF NOT EXISTS `auditoria_admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` VARCHAR(50) NOT NULL,
  `accion` VARCHAR(50) NOT NULL,
  `entidad_afectada` VARCHAR(50) NOT NULL,
  `registro_id` VARCHAR(50) NOT NULL,
  `detalles` JSON,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_admin_timestamp` (`admin_id`, `timestamp`),
  FOREIGN KEY (`admin_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
