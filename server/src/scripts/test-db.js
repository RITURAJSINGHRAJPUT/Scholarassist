require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to Supabase!');
        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);
        client.release();
    } catch (err) {
        console.error('❌ Connection failed:', err);
    } finally {
        pool.end();
    }
}

testConnection();
