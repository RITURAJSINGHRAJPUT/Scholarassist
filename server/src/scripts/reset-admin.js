const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function resetAdmin() {
    const username = 'admin';
    const newPassword = 'ScholarAdmin@2025'; // TEMPORARY SECURE PASSWORD
    
    try {
        const passwordHash = await bcrypt.hash(newPassword, 12);
        const result = await pool.query(
            'UPDATE admin_users SET password_hash = $1 WHERE username = $2 RETURNING id, username',
            [passwordHash, username]
        );

        if (result.rows.length === 0) {
            console.log(`❌ Admin user "${username}" not found. Creating new one...`);
            await pool.query(
                'INSERT INTO admin_users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                [username, 'admin@scholarassist.com', passwordHash, 'admin']
            );
            console.log(`✅ Admin user "${username}" created successfully!`);
        } else {
            console.log(`✅ Password for "${username}" reset successfully!`);
        }
        
        console.log('\n--- NEW ADMIN CREDENTIALS ---');
        console.log(`Username: ${username}`);
        console.log(`Password: ${newPassword}`);
        console.log('------------------------------');
        console.log('⚠️ Please change this password immediately after logging in.');

    } catch (err) {
        console.error('Reset error:', err.message);
    } finally {
        await pool.end();
    }
}

resetAdmin();
