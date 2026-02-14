require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seedAdmin() {
    try {
        // Test connection
        const connTest = await pool.query('SELECT NOW()');
        console.log('✓ Database connected:', connTest.rows[0].now);

        // Check if tables exist
        const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
        console.log('\n✓ Tables found:', tables.rows.map(r => r.table_name).join(', ') || 'NONE');

        if (tables.rows.length === 0) {
            console.log('\n✗ No tables found! You need to run the schema first.');
            console.log('  Run: psql -U postgres -d scholarassist -f db/schema.sql');
            process.exit(1);
        }

        // Check existing admin users
        const existing = await pool.query('SELECT id, username, email FROM admin_users');
        console.log('\n✓ Existing admin users:', existing.rows.length);
        if (existing.rows.length > 0) {
            console.log('  Users:', existing.rows.map(r => `${r.username} (${r.email})`).join(', '));

            // Reset password for existing admin
            const passwordHash = await bcrypt.hash('admin123', 12);
            await pool.query('UPDATE admin_users SET password_hash = $1 WHERE username = $2', [passwordHash, 'admin']);
            console.log('\n✓ Password reset to "admin123" for user "admin"');
        } else {
            // Create new admin
            const passwordHash = await bcrypt.hash('admin123', 12);
            const result = await pool.query(
                'INSERT INTO admin_users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
                ['admin', 'admin@scholarassist.com', passwordHash, 'admin']
            );
            console.log('\n✓ Admin user created:', result.rows[0]);
        }

        console.log('\n========================================');
        console.log('Login credentials:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('========================================');

    } catch (error) {
        console.error('✗ Error:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('\nThe database "scholarassist" may not exist.');
            console.log('Create it with: CREATE DATABASE scholarassist;');
        }
        if (error.message.includes('password authentication failed')) {
            console.log('\nWrong password in DATABASE_URL. Check your .env file.');
        }
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\nPostgreSQL is not running. Start it from Windows Services.');
        }
    } finally {
        await pool.end();
        process.exit(0);
    }
}

seedAdmin();
