import { pool } from '../config/db.js';

/**
 * Middleware para verificar roles permitidos
 * @param {string[]} allowedRoles Array de roles permitidos ej: ['ADMIN', 'COORDINADOR']
 */
export const verifyRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // Asumimos que el ID del usuario viene en headers (para este prototipo)
            // En producción debería venir de req.user extraído del JWT
            const userId = req.headers['x-user-id'];

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado. ID de usuario requerido.' });
            }

            // Consultar roles del usuario
            const [rows] = await pool.query(`
                SELECT r.nombre 
                FROM roles r
                JOIN usuario_roles ur ON r.id = ur.rol_id
                WHERE ur.usuario_id = ?
            `, [userId]);

            if (rows.length === 0) {
                return res.status(403).json({ error: 'Usuario sin roles asignados.' });
            }

            const userRole = rows[0].nombre;

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    error: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}`
                });
            }

            // Inyectar info del usuario en la request
            req.currentUser = { id: userId, role: userRole };
            next();

        } catch (error) {
            console.error('Error en verifyRole:', error);
            res.status(500).json({ error: 'Error interno de validación de roles.' });
        }
    };
};
