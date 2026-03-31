require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🚀 Starting Database Migration...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('🔍 Checking app_users table...');
        
        // Add missing columns to app_users safely
        const migrations = [
            'ALTER TABLE app_users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)',
            'ALTER TABLE app_users ADD COLUMN IF NOT EXISTS designation VARCHAR(100)',
            'ALTER TABLE app_users ADD COLUMN IF NOT EXISTS place_of_work VARCHAR(255)',
            'ALTER TABLE app_users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false',
            'ALTER TABLE app_users ADD COLUMN IF NOT EXISTS premium_status VARCHAR(20) DEFAULT \'none\'',
            'ALTER TABLE app_users ADD COLUMN IF NOT EXISTS requested_plan VARCHAR(20)',
            'ALTER TABLE app_users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE',
            
            // Fix testimonials user_id if missing (referencing app_users)
            'ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE SET NULL'
        ];

        for (const sql of migrations) {
            console.log(`⏳ Executing: ${sql.split('ADD COLUMN')[0]}...`);
            await client.query(sql);
        }

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
    } finally {
        client.release();
        await pool.end();
        process.exit();
    }
}

migrate();
