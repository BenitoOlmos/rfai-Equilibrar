import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function updateAdmin() {
    const pool = createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'reprogramacion_foca'
    });

    try {
        console.log('Actualizando email de administrador...');
        await pool.query("UPDATE usuarios SET email = 'admin@admin.com' WHERE id = 'u-admin'");
        console.log('✅ Email actualizado a admin@admin.com para usuario u-admin');

        // Verificar
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = 'u-admin'");
        console.log('Usuario actualizado:', rows[0]);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

updateAdmin();
