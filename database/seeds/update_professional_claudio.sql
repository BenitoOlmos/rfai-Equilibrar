-- ============================================================================
-- ACTUALIZACIÓN DE IDENTIDAD PROFESIONAL Y REASIGNACIÓN
-- Propósito: Establecer a Claudio Reyes como profesional principal
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. CREAR PROFESIONAL CLAUDIO REYES
INSERT INTO `usuarios` (`id`, `nombre_completo`, `email`, `avatar_url`, `estado`) VALUES
('prof-claudio-reyes', 'Claudio Reyes', 'claudio@prof.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=claudio', 'ACTIVO')
ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo);

-- Asignar rol PROFESIONAL
INSERT IGNORE INTO `usuario_roles` (`usuario_id`, `rol_id`) 
SELECT 'prof-claudio-reyes', id FROM roles WHERE nombre = 'PROFESIONAL';

-- 2. ACTUALIZAR MATRÍCULAS DE PACIENTES DEMO (Ana, Bruno)
-- Ana (c-w2-angustia)
UPDATE `matriculas` 
SET `profesional_id` = 'prof-claudio-reyes' 
WHERE `cliente_id` IN ('c-w2-angustia', 'u-elena');

-- Bruno (u-bruno)
UPDATE `matriculas` 
SET `profesional_id` = 'prof-claudio-reyes' 
WHERE `cliente_id` = 'u-bruno';

-- 3. CREAR PACIENTE "CARLA" (Para completar el requerimiento)
INSERT IGNORE INTO `usuarios` (`id`, `nombre_completo`, `email`, `estado`) VALUES
('u-carla', 'Carla Venegas', 'carla@client.com', 'ACTIVO');

INSERT IGNORE INTO `matriculas` (`id`, `cliente_id`, `programa_id`, `profesional_id`, `fecha_inicio`, `estado`, `progreso_general`) VALUES
(105, 'u-carla', 2, 'prof-claudio-reyes', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'ACTIVO', 80);

-- 4. CREAR PACIENTE "SIN ASIGNAR" (Para probar la UI de vinculación)
INSERT IGNORE INTO `usuarios` (`id`, `nombre_completo`, `email`, `estado`) VALUES
('u-nuevo', 'Daniela Nueva', 'daniela@client.com', 'ACTIVO');

INSERT IGNORE INTO `matriculas` (`id`, `cliente_id`, `programa_id`, `profesional_id`, `fecha_inicio`, `estado`) VALUES
(106, 'u-nuevo', 1, NULL, CURDATE(), 'ACTIVO');
-- Nota: profesional_id IS NULL para que aparezca en la lista de gestión

SET FOREIGN_KEY_CHECKS = 1;
