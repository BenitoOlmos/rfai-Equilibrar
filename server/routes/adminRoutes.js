import express from 'express';
import { pool } from '../config/db.js';
import { verifyRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware global para estas rutas: Solo Admin y Coordinador
router.use(verifyRole(['ADMIN', 'COORDINADOR']));

/**
 * POST /api/admin/usuarios
 * Crear nuevo usuario (Paciente o Profesional)
 */
router.post('/usuarios', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id, nombre, email, rol, programaId } = req.body;

        // 1. Crear Usuario
        await connection.query(`
            INSERT INTO usuarios (id, nombre_completo, email, estado)
            VALUES (?, ?, ?, 'ACTIVO')
        `, [id, nombre, email]);

        // 2. Asignar Rol
        // Buscar ID del rol
        const [roles] = await connection.query('SELECT id FROM roles WHERE nombre = ?', [rol]);
        if (roles.length === 0) throw new Error('Rol no válido');

        await connection.query(`
            INSERT INTO usuario_roles (usuario_id, rol_id, asignado_por)
            VALUES (?, ?, ?)
        `, [id, roles[0].id, req.currentUser.id]);

        // 3. Si es cliente, crear matrícula
        if (rol === 'CLIENTE' && programaId) {
            await connection.query(`
                INSERT INTO matriculas (cliente_id, programa_id, fecha_inicio, estado)
                VALUES (?, ?, CURDATE(), 'ACTIVO')
            `, [id, programaId]);
        }

        await connection.commit();
        res.json({ success: true, message: 'Usuario creado exitosamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

/**
 * GET /api/admin/usuarios
 * Listar todos los usuarios
 */
router.get('/usuarios', async (req, res) => {
    try {
        const [usuarios] = await pool.query(`
            SELECT 
                u.id, 
                u.nombre_completo as name, 
                u.email, 
                u.avatar_url as avatar,
                u.estado as status,
                r.nombre as role,
                m.id as matricula_id,
                p.nombre as program,
                m.progreso_general,
                WEEK(CURDATE()) - WEEK(m.fecha_inicio) + 1 as currentWeek
            FROM usuarios u
            LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
            LEFT JOIN roles r ON ur.rol_id = r.id
            LEFT JOIN matriculas m ON u.id = m.cliente_id AND m.estado = 'ACTIVO'
            LEFT JOIN programas p ON m.programa_id = p.id
            ORDER BY u.created_at DESC
        `);

        // Normalizar datos para que coincidan con types.ts
        const normalizedUsers = usuarios.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role === 'PROFESIONAL' ? 'PROFESSIONAL' : u.role === 'CLIENTE' ? 'CLIENT' : 'ADMIN',
            avatar: u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + u.id,
            status: u.status,
            program: u.program ? (u.program.includes('Angustia') ? 'ANGUSTIA' : 'CULPA') : undefined,
            currentWeek: Math.max(1, u.currentWeek || 1),
            matriculaId: u.matricula_id
        }));

        res.json({ success: true, users: normalizedUsers });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

/**
 * GET /api/admin/pacientes-sin-asignar
 * Obtener lista de matrículas activas sin profesional
 */
router.get('/pacientes-sin-asignar', async (req, res) => {
    try {
        const [pacientes] = await pool.query(`
            SELECT m.id as matricula_id, u.id as usuario_id, u.nombre_completo, p.nombre as programa, m.fecha_inicio
            FROM matriculas m
            JOIN usuarios u ON m.cliente_id = u.id
            JOIN programas p ON m.programa_id = p.id
            WHERE m.profesional_id IS NULL AND m.estado = 'ACTIVO'
        `);
        res.json({ success: true, pacientes });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pacientes' });
    }
});

/**
 * GET /api/admin/profesionales
 * Obtener lista de profesionales activos para dropdown
 */
router.get('/profesionales', async (req, res) => {
    try {
        const [profesionales] = await pool.query(`
            SELECT u.id, u.nombre_completo 
            FROM usuarios u
            JOIN usuario_roles ur ON u.id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.id
            WHERE r.nombre = 'PROFESIONAL' AND u.estado = 'ACTIVO'
        `);
        res.json({ success: true, profesionales });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener profesionales' });
    }
});

/**
 * POST /api/admin/vincular
 * Asignar profesional a matrícula
 */
router.post('/vincular', async (req, res) => {
    try {
        const { matriculaId, profesionalId } = req.body;

        await pool.query(`
            UPDATE matriculas 
            SET profesional_id = ?
            WHERE id = ?
        `, [profesionalId, matriculaId]);

        res.json({ success: true, message: 'Vinculación exitosa' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al vincular' });
    }
});

/**
 * PATCH /api/admin/usuarios/:id
 * Editar usuario (activar/desactivar/editar)
 */
router.patch('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, nombre, email } = req.body;

        let query = 'UPDATE usuarios SET ';
        const params = [];
        const updates = [];

        if (estado) { updates.push('estado = ?'); params.push(estado); }
        if (nombre) { updates.push('nombre_completo = ?'); params.push(nombre); }
        if (email) { updates.push('email = ?'); params.push(email); }

        if (updates.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(id);

        await pool.query(query, params);

        res.json({ success: true, message: 'Usuario actualizado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

export default router;
