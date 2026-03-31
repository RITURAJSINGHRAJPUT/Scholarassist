const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
    try {
        const result = await pool.query('SELECT id, username, email, role FROM admin_users');
        console.log('--- ADMIN USERS ---');
        console.table(result.rows);
        if (result.rows.length === 0) {
            console.log('❌ NO ADMIN USERS FOUND! You need to create one.');
        } else {
            console.log('✅ Admin users exist.');
        }
    } catch (err) {
        console.error('Database connection error:', err.message);
    } finally {
        await pool.end();
    }
}

checkAdmin();
