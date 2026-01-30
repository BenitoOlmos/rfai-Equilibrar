import express from 'express';
import { pool } from '../config/db.js';
import { verifyRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware: Solo Admin y Coordinador
router.use(verifyRole(['ADMIN', 'COORDINADOR']));

// Helper para auditoría
const logAudit = async (conn, adminId, accion, entidad, registroId, detalles) => {
    try {
        const query = `
            INSERT INTO auditoria_admin 
            (admin_id, accion, entidad_afectada, registro_id, detalles)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [adminId, accion, entidad, registroId, JSON.stringify(detalles)];

        if (conn && conn.query) {
            await conn.query(query, params);
        } else {
            await pool.query(query, params);
        }
    } catch (error) {
        console.error('Error al registrar auditoría:', error);
    }
};

/**
 * GET /api/admin/content/modulos
 * Obtener estructura de programas y semanas para dropdowns
 */
router.get('/modulos', async (req, res) => {
    try {
        const [modulos] = await pool.query(`
            SELECT 
                m.id, 
                m.numero_semana, 
                m.titulo as modulo_titulo,
                p.nombre as programa_nombre,
                p.id as programa_id,
                p.slug as programa_slug
            FROM modulos_semanales m
            JOIN programas p ON m.programa_id = p.id
            WHERE p.activo = 1
            ORDER BY p.id, m.numero_semana
        `);
        res.json({ success: true, modulos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener módulos' });
    }
});

/**
 * GET /api/admin/content/recursos
 * Listar todos los recursos existentes
 */
router.get('/recursos', async (req, res) => {
    try {
        const [recursos] = await pool.query(`
            SELECT 
                r.id,
                r.titulo,
                r.tipo,
                r.url_recurso,
                r.activo,
                r.descripcion,
                m.numero_semana,
                p.nombre as programa,
                p.slug as programa_slug
            FROM recursos r
            JOIN modulos_semanales m ON r.modulo_id = m.id
            JOIN programas p ON m.programa_id = p.id
            ORDER BY p.id, m.numero_semana, r.orden
        `);

        // Normalizar para frontend
        const normalized = recursos.map(r => ({
            id: r.id,
            type: r.tipo, // 'AUDIO', 'VIDEO_MEET', 'TEST', 'DOCUMENTO'
            title: r.titulo,
            program: r.programa_slug.includes('angustia') ? 'ANGUSTIA' : 'CULPA', // Simple mapping
            details: `Semana ${r.numero_semana} - ${r.descripcion || ''}`,
            url: r.url_recurso,
            status: r.activo ? 'ACTIVO' : 'INACTIVO',
            week: r.numero_semana
        }));

        res.json({ success: true, resources: normalized });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar recursos' });
    }
});

/**
 * POST /api/admin/content/recursos
 * Crear nuevo recurso
 */
router.post('/recursos', async (req, res) => {
    try {
        const { titulo, tipo, url, descripcion, moduloId, orden } = req.body;
        const adminId = req.currentUser.id;

        // Slug simple
        const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

        const [result] = await pool.query(`
            INSERT INTO recursos (modulo_id, tipo, slug, titulo, descripcion, url_recurso, orden, activo, obligatorio)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)
        `, [moduloId, tipo, slug, titulo, descripcion, url, orden || 0]);

        await logAudit(pool, adminId, 'CREAR_RECURSO', 'recursos', result.insertId.toString(), {
            titulo, tipo, moduloId
        });

        res.json({ success: true, message: 'Recurso creado', id: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear recurso' });
    }
});

/**
 * PATCH /api/admin/content/recursos/:id
 * Editar recurso existente
 */
router.patch('/recursos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, url, descripcion, activo } = req.body;
        const adminId = req.currentUser.id;

        let query = 'UPDATE recursos SET ';
        const params = [];
        const updates = [];
        const audit = {};

        if (titulo) { updates.push('titulo = ?'); params.push(titulo); audit.titulo = titulo; }
        if (url) { updates.push('url_recurso = ?'); params.push(url); audit.url = url; }
        if (descripcion) { updates.push('descripcion = ?'); params.push(descripcion); audit.descripcion = descripcion; }
        if (activo !== undefined) {
            updates.push('activo = ?');
            params.push(activo ? 1 : 0);
            audit.activo = activo;
        }

        if (updates.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(id);

        await pool.query(query, params);

        await logAudit(pool, adminId, 'EDITAR_RECURSO', 'recursos', id, audit);

        res.json({ success: true, message: 'Recurso actualizado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al editar recurso' });
    }
});

export default router;
