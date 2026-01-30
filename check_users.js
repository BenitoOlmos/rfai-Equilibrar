import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkUsers() {
    const pool = createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'reprogramacion_foca',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        const [users] = await pool.query('SELECT id, nombre_completo, email, estado, password_hash FROM usuarios');
        const [roles] = await pool.query(`
            SELECT u.email, r.nombre as rol 
            FROM usuarios u 
            JOIN usuario_roles ur ON u.id = ur.usuario_id 
            JOIN roles r ON ur.rol_id = r.id
        `);

        console.log('--- USUARIOS ---');
        console.table(users.map(u => ({ ...u, password_hash: u.password_hash ? 'HASHEADO' : 'NULL' })));

        console.log('--- ROLES ---');
        console.table(roles);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkUsers();
