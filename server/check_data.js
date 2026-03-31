const pool = require('./src/config/db');
require('dotenv').config();

async function check() {
    try {
        const result = await pool.query(
            `SELECT 
                t.id, 
                t.name, 
                COALESCE(t.role, u.designation) as role, 
                u.place_of_work as workspace,
                u.premium_status,
                t.content, 
                t.rating 
             FROM testimonials t
             LEFT JOIN app_users u ON t.user_id = u.id`
        );
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();
