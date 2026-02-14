const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { decrypt } = require('../utils/encryption');
const { logAction } = require('../utils/auditLog');

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// GET /api/files/:id/download - Secure file download (admin only)
router.get('/:id/download', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM uploaded_files WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = result.rows[0];
        const filePath = path.join(uploadDir, file.stored_name);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        const encryptedBuffer = fs.readFileSync(filePath);
        const decryptedBuffer = decrypt(encryptedBuffer, file.encryption_iv);

        await logAction(req.admin.id, 'DOWNLOAD_FILE', 'uploaded_files', file.id, { filename: file.original_name }, req.ip);

        res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
        res.send(decryptedBuffer);
    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
