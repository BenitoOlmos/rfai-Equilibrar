import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexiones optimizado para XAMPP
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reprogramacion_foca',

    // Optimizaciones para XAMPP
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true' || true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,

    // Keep-alive para evitar timeouts
    enableKeepAlive: process.env.DB_ENABLE_KEEP_ALIVE === 'true' || true,
    keepAliveInitialDelay: parseInt(process.env.DB_KEEP_ALIVE_INITIAL_DELAY) || 10000,

    // Configuración adicional
    charset: 'utf8mb4',
    timezone: '+00:00',

    // Retry en caso de error
    connectTimeout: 10000,
    acquireTimeout: 10000,
});

// Test de conexión al inicio
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexión a MySQL establecida correctamente');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar con MySQL:', err.message);
        console.error('Verificar que XAMPP esté corriendo y que las credenciales sean correctas');
    });

// Manejo de errores del pool
pool.on('error', (err) => {
    console.error('Error en el pool de MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Conexión perdida. El pool intentará reconectar automáticamente.');
    }
});

export default pool;
