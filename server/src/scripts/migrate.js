require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('⏳ Running migration: add_templates_table.sql...');
        const sqlPath = path.join(__dirname, '../../db/migrations/add_templates_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await client.query(sql);
        console.log('✅ Migration successful!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
