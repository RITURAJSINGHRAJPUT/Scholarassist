require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function initDb() {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to database');

        const schemaPath = path.join(__dirname, '../../db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('⏳ Running schema...');
        await client.query(schemaSql);
        console.log('✅ Schema initialized successfully!');

        client.release();
    } catch (err) {
        if (err.code === '42P07') { // Relation already exists
            console.log('⚠️  Schema parts already exist (ignoring duplication errors)');
        } else {
            console.error('❌ Schema initialization failed:', err);
        }
    } finally {
        pool.end();
    }
}

initDb();
