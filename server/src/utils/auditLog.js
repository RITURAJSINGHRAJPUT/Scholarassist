const pool = require('../config/db');

async function logAction(adminId, action, entityType, entityId, details, ipAddress) {
    try {
        await pool.query(
            `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [adminId, action, entityType, entityId, JSON.stringify(details), ipAddress]
        );
    } catch (error) {
        console.error('Failed to write audit log:', error.message);
    }
}

module.exports = { logAction };
