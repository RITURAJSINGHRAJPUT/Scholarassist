const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const xss = require('xss');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { encrypt } = require('../utils/encryption');
const { sendNewInquiryNotification } = require('../utils/email');
const { logAction } = require('../utils/auditLog');

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Verify reCAPTCHA
async function verifyRecaptcha(token) {
    if (!process.env.RECAPTCHA_SECRET_KEY) return true; // Skip if not configured
    try {
        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
        });
        const data = await response.json();
        return data.success;
    } catch {
        return false;
    }
}

// POST /api/inquiries - Create inquiry (public)
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { name, email, phone, academic_level, service_type, deadline, message, recaptcha_token } = req.body;

        // Validate required fields
        if (!name || !email || !service_type) {
            return res.status(400).json({ error: 'Name, email, and service type are required' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Verify reCAPTCHA
        const isHuman = await verifyRecaptcha(recaptcha_token);
        if (!isHuman) {
            return res.status(400).json({ error: 'reCAPTCHA verification failed' });
        }

        // Sanitize inputs
        const sanitized = {
            name: xss(name),
            email: xss(email),
            phone: phone ? xss(phone) : null,
            academic_level: academic_level ? xss(academic_level) : null,
            service_type: xss(service_type),
            deadline: deadline || null,
            message: message ? xss(message) : null,
        };

        // Create or find user
        let userResult = await pool.query('SELECT id FROM users WHERE email = $1', [sanitized.email]);
        let userId;

        if (userResult.rows.length > 0) {
            userId = userResult.rows[0].id;
        } else {
            const newUser = await pool.query(
                'INSERT INTO users (name, email, phone, academic_level) VALUES ($1, $2, $3, $4) RETURNING id',
                [sanitized.name, sanitized.email, sanitized.phone, sanitized.academic_level]
            );
            userId = newUser.rows[0].id;
        }

        // Create inquiry
        const inquiryResult = await pool.query(
            `INSERT INTO inquiries (user_id, service_type, deadline, message, status)
       VALUES ($1, $2, $3, $4, 'new') RETURNING *`,
            [userId, sanitized.service_type, sanitized.deadline, sanitized.message]
        );
        const inquiry = inquiryResult.rows[0];

        // Handle file upload
        if (req.file) {
            const { encrypted, iv } = encrypt(req.file.buffer);
            const storedName = `${uuidv4()}${path.extname(req.file.originalname)}`;
            const filePath = path.join(uploadDir, storedName);
            fs.writeFileSync(filePath, encrypted);

            await pool.query(
                `INSERT INTO uploaded_files (inquiry_id, original_name, stored_name, mime_type, size, encryption_iv)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [inquiry.id, req.file.originalname, storedName, req.file.mimetype, req.file.size, iv]
            );
        }

        // Send email notification
        sendNewInquiryNotification({ ...sanitized, id: inquiry.id });

        res.status(201).json({
            message: 'Inquiry submitted successfully',
            inquiry_id: inquiry.id,
        });
    } catch (error) {
        console.error('Create inquiry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/inquiries - List all (admin)
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT i.*, u.name, u.email, u.phone, u.academic_level,
        COALESCE(json_agg(json_build_object('id', f.id, 'original_name', f.original_name, 'size', f.size)) 
          FILTER (WHERE f.id IS NOT NULL), '[]') as files
      FROM inquiries i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN uploaded_files f ON f.inquiry_id = i.id
    `;
        const params = [];

        if (status) {
            query += ' WHERE i.status = $1';
            params.push(status);
        }

        query += ` GROUP BY i.id, u.name, u.email, u.phone, u.academic_level ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM inquiries';
        const countParams = [];
        if (status) {
            countQuery += ' WHERE status = $1';
            countParams.push(status);
        }
        const countResult = await pool.query(countQuery, countParams);

        res.json({
            inquiries: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            totalPages: Math.ceil(countResult.rows[0].count / limit),
        });
    } catch (error) {
        console.error('List inquiries error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/inquiries/:id - Get one (admin)
router.get('/:id', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.*, u.name, u.email, u.phone, u.academic_level
       FROM inquiries i JOIN users u ON i.user_id = u.id WHERE i.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        const filesResult = await pool.query(
            'SELECT id, original_name, mime_type, size, created_at FROM uploaded_files WHERE inquiry_id = $1',
            [req.params.id]
        );

        res.json({ ...result.rows[0], files: filesResult.rows });
    } catch (error) {
        console.error('Get inquiry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/inquiries/:id/status - Update status (admin)
router.patch('/:id/status', authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['new', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            'UPDATE inquiries SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        await logAction(req.admin.id, 'UPDATE_STATUS', 'inquiries', req.params.id, { status }, req.ip);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/inquiries/:id - Delete (admin)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        // Delete associated files from disk
        const files = await pool.query('SELECT stored_name FROM uploaded_files WHERE inquiry_id = $1', [req.params.id]);
        for (const file of files.rows) {
            const filePath = path.join(uploadDir, file.stored_name);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        const result = await pool.query('DELETE FROM inquiries WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        await logAction(req.admin.id, 'DELETE', 'inquiries', req.params.id, {}, req.ip);

        res.json({ message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error('Delete inquiry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/inquiries/export/csv - Export CSV (admin)
router.get('/export/csv', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.id, u.name, u.email, u.phone, u.academic_level, i.service_type, i.deadline, i.message, i.status, i.created_at
       FROM inquiries i JOIN users u ON i.user_id = u.id ORDER BY i.created_at DESC`
        );

        const { Parser } = require('json2csv');
        const fields = ['id', 'name', 'email', 'phone', 'academic_level', 'service_type', 'deadline', 'message', 'status', 'created_at'];
        const parser = new Parser({ fields });
        const csv = parser.parse(result.rows);

        await logAction(req.admin.id, 'EXPORT_CSV', 'inquiries', null, { count: result.rows.length }, req.ip);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inquiries.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
