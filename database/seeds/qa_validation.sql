-- ============================================================================
-- SEED QA - DATOS PARA VALIDACIÓN DE UI Y ESTADOS
-- Propósito: Crear escenarios específicos para Bruno, Elena y Felipe
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. BRUNO (Usuario B) - Datos de Escucha para Dashboard Profesional
-- Insertar usuario si no existe (asumiendo ID 'u-bruno')
INSERT IGNORE INTO `usuarios` (`id`, `nombre_completo`, `email`, `estado`) VALUES
('u-bruno', 'Bruno Díaz', 'bruno@client.com', 'ACTIVO');

-- Matrícula Activa
INSERT IGNORE INTO `matriculas` (`id`, `cliente_id`, `programa_id`, `profesional_id`, `fecha_inicio`, `estado`) VALUES
(101, 'u-bruno', 1, 'prof-david', DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'ACTIVO');

-- Logs de consumo masivo para verificar SUM()
INSERT INTO `logs_consumo_media` (`matricula_id`, `recurso_id`, `sesion_reproduccion`, `timestamp_inicio`, `fecha_reproduccion`, `segundos_reproducidos`, `marcador_tiempo`) VALUES
(101, 1, 'sesion-1', NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY), 600, 600), -- 10 min
(101, 1, 'sesion-2', NOW(), DATE_SUB(NOW(), INTERVAL 2 DAY), 300, 300), -- 5 min
(101, 2, 'sesion-3', NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY), 1200, 1200); -- 20 min
-- Total esperado: 35 minutos

-- 2. ELENA ROJAS (Programa Culpa) - Verificación de Tema
INSERT IGNORE INTO `usuarios` (`id`, `nombre_completo`, `email`, `estado`) VALUES
('u-elena', 'Elena Rojas', 'elena@client.com', 'ACTIVO');

-- Matrícula en Programa CULPA (ID 2)
INSERT IGNORE INTO `matriculas` (`id`, `cliente_id`, `programa_id`, `fecha_inicio`, `estado`) VALUES
(102, 'u-elena', 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'ACTIVO');

-- 3. FELIPE (Usuario F) - Estado Pausado
INSERT IGNORE INTO `usuarios` (`id`, `nombre_completo`, `email`, `estado`) VALUES
('u-felipe', 'Felipe Estévez', 'felipe@client.com', 'SUSPENDIDO'); -- Usuario suspendido o matrícula pausada

-- Matrícula PAUSADA
INSERT IGNORE INTO `matriculas` (`id`, `cliente_id`, `programa_id`, `fecha_inicio`, `estado`) VALUES
(103, 'u-felipe', 1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'PAUSADO');

-- 4. LOGS DE ACCESO (Para Dashboard Admin)
INSERT INTO `logs_acceso` (`usuario_id`, `ruta`, `metodo`, `ip_address`, `timestamp`) VALUES
('u-bruno', '/api/guias/1', 'GET', '192.168.1.10', DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
('u-elena', '/api/auth/login', 'POST', '192.168.1.12', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
('prof-david', '/api/professional/pacientes', 'GET', '192.168.1.50', DATE_SUB(NOW(), INTERVAL 15 MINUTE));

SET FOREIGN_KEY_CHECKS = 1;
