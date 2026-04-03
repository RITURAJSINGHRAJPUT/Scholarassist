require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function seedNewAdmin() {
    try {
        const username = 'scholarassist.connect@gmail.com';
        const email = 'scholarassist.connect@gmail.com';
        const password = 'Utsav@799020';
        const passwordHash = await bcrypt.hash(password, 12);

        console.log(`⏳ Setting up new admin: ${username}...`);
        
        // Check if exists, if so update password
        const result = await pool.query(
            `INSERT INTO admin_users (username, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) 
             DO UPDATE SET 
                username = EXCLUDED.username,
                password_hash = EXCLUDED.password_hash, 
                updated_at = NOW()
             RETURNING id, username`,
            [username, email, passwordHash, 'admin']
        );

        console.log(`✅ Admin setup successful!`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
    } catch (err) {
        console.error('❌ Setup failed:', err);
    } finally {
        await pool.end();
    }
}

seedNewAdmin();
