const express = require('express');
const xss = require('xss');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');
const { validateContact, validateUUID } = require('../middleware/validate');

const router = express.Router();

// POST /api/contact - Submit contact message (public)
router.post('/', validateContact, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const result = await pool.query(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING id',
            [xss(name), xss(email), subject ? xss(subject) : null, xss(message)]
        );

        res.status(201).json({ message: 'Message sent successfully', id: result.rows[0].id });
    } catch (error) {
        console.error('Contact message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/contact - List messages (admin)
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('List contact messages error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/contact/:id - Delete message (admin)
router.delete('/:id', authenticate, validateUUID('id'), async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await logAction(req.admin.id, 'DELETE', 'contact_messages', req.params.id, {}, req.ip);
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete contact message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
