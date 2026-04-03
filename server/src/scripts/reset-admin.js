require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function resetAdmin() {
    try {
        const username = 'admin';
        const password = 'admin123';
        const passwordHash = await bcrypt.hash(password, 12);

        console.log(`⏳ Resetting password for admin user: ${username}...`);
        
        // Update existing or insert if not exists
        const result = await pool.query(
            `INSERT INTO admin_users (username, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (username) 
             DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
             RETURNING id, username`,
            [username, 'admin@scholarassist.com', passwordHash, 'admin']
        );

        console.log(`✅ Admin password reset successful!`);
        console.log(`Username: admin`);
        console.log(`Password: admin123`);
    } catch (err) {
        console.error('❌ Reset failed:', err);
    } finally {
        await pool.end();
    }
}

resetAdmin();
