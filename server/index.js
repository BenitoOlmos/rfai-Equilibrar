
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import ciclosRoutes from './routes/ciclosRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ciclos', ciclosRoutes);
app.use('/api/citas', ciclosRoutes); // Reuse for citas endpoints

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    const { email } = req.body;
    try {
        // For now, we allow login if user exists. 
        // In production, add password verification (though the schema doesn't have password column yet based on previous steps, usually it's handled via auth provider or separate creds table, but let's assume simple email check for this MVP step as requested "mejore la interfaz... luego backend")

        // Note: If you haven't imported the schema yet, this will fail. 
        // Fallback Mock for testing connectivity if DB fails:
        // return res.json({ id: '1', name: 'Test User', email, role: 'CLIENT', program: 'CULPA', currentWeek: 1 });

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            const user = users[0];
            // Fetch profile if client
            if (user.role === 'CLIENT') {
                const [profiles] = await pool.query('SELECT * FROM client_profiles WHERE user_id = ?', [user.id]);
                if (profiles.length > 0) {
                    const profile = profiles[0];
                    return res.json({ ...user, ...profile });
                }
            }
            return res.json(user);
        } else {
            res.status(401).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Test Route
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as val');
        res.json({ status: 'OK', db_check: rows[0].val });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
