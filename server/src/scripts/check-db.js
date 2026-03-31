require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    console.log('🔍 Checking Production Database Schema...');
    const client = await pool.connect();

    try {
        console.log('\n--- Columns in app_users ---');
        const userCols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'app_users'
        `);
        userCols.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));

        console.log('\n--- Columns in testimonials ---');
        const testCols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'testimonials'
        `);
        testCols.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));

    } catch (err) {
        console.error('❌ Error checking schema:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkSchema();
