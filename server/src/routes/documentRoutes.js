const express = require('express');
const xss = require('xss');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /api/documents — Create new document
router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.admin.id;

        const result = await pool.query(
            `INSERT INTO documents (user_id, title, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [userId, xss(title || 'Untitled Document'), content ? JSON.stringify(content) : '{}']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({ error: 'Failed to create document' });
    }
});

// GET /api/documents — List user's documents
router.get('/', async (req, res) => {
    try {
        const userId = req.admin.id;

        const result = await pool.query(
            `SELECT id, title, created_at, updated_at
             FROM documents
             WHERE user_id = $1
             ORDER BY updated_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('List documents error:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// GET /api/documents/:id — Fetch single document
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.admin.id;

        const result = await pool.query(
            'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fetch document error:', error);
        res.status(500).json({ error: 'Failed to fetch document' });
    }
});

// PUT /api/documents/:id — Update document
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.admin.id;
        const { title, content } = req.body;

        // Verify ownership
        const existing = await pool.query(
            'SELECT id FROM documents WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(xss(title));
        }

        if (content !== undefined) {
            updates.push(`content = $${paramIndex++}`);
            values.push(JSON.stringify(content));
        }

        updates.push(`updated_at = NOW()`);

        values.push(id);
        const query = `UPDATE documents SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({ error: 'Failed to update document' });
    }
});

// DELETE /api/documents/:id — Delete document
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.admin.id;

        const result = await pool.query(
            'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json({ message: 'Document deleted' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

module.exports = router;
