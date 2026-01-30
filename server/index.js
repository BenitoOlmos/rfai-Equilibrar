import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

// Import routes
import guiasRoutes from './routes/guiasRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import recursosRoutes from './routes/recursosRoutes.js';
import devRoutes from './routes/devRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';

console.log('🌐 CORS configurado para:', CORS_ORIGIN);

// Middleware
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (simple)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as val');
        const [userCount] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
        const [programCount] = await pool.query('SELECT COUNT(*) as total FROM programas');

        res.json({
            status: 'OK',
            db_check: rows[0].val,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            stats: {
                usuarios: userCount[0].total,
                programas: programCount[0].total
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message,
            db_connected: false
        });
    }
});

// Dev routes (solo para desarrollo - REMOVER en producción)
// Activar siempre en desarrollo
app.use('/api/dev', devRoutes);
console.log('⚠️  DEV ROUTES ACTIVADAS - No usar en producción');
console.log('   - POST /api/dev/login');
console.log('   - GET  /api/dev/users');

// Auth routes (básico - expandir según necesidad)
app.post('/api/auth/login', async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await pool.query(`
      SELECT u.*, ur.rol_id
      FROM usuarios u
      LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
      WHERE u.email = ? AND u.estado = 'ACTIVO'
      LIMIT 1
    `, [email]);

        if (users.length > 0) {
            const user = users[0];

            // Obtener matrícula activa si es cliente
            const [matriculas] = await pool.query(`
        SELECT * FROM matriculas 
        WHERE cliente_id = ? AND estado = 'ACTIVO'
        ORDER BY fecha_inicio DESC
        LIMIT 1
      `, [user.id]);

            res.json({
                success: true,
                user: {
                    ...user,
                    matricula: matriculas[0] || null
                }
            });
        } else {
            res.status(401).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en autenticación' });
    }
});

// API Routes
app.use('/api/guias', guiasRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recursos', recursosRoutes);

// Servir página de prueba
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/test-login', (req, res) => {
    res.sendFile(join(__dirname, '../test-login.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  RFAI Backend Server - v3.0                                ║
║  Puerto: ${PORT.toString().padEnd(49)}║
║  Entorno: ${(process.env.NODE_ENV || 'development').padEnd(47)}║
║  Base de datos: ${(process.env.DB_NAME || 'reprogramacion_foca').padEnd(41)}║
╚════════════════════════════════════════════════════════════╝
  `);
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n🔥 Endpoints disponibles:`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - GET  /api/guias/:guiaId`);
    console.log(`   - PATCH /api/guias/progreso/:progresoId`);
    console.log(`   - POST /api/analytics/audio/heartbeat`);
    console.log(`   - GET  /api/recursos/matricula/:matriculaId`);
    console.log(`   - GET  /api/recursos/:recursoId (con checkWeekAccess)`);
    console.log(`\n📝 Presiona Ctrl+C para detener el servidor\n`);
});

export default app;
