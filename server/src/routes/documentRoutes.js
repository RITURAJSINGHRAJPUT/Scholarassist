const express = require('express');
const xss = require('xss');
const pool = require('../config/db');
const { authenticateUser, incrementUsage } = require('../middleware/userAuth');

const router = express.Router();

// All routes require student authentication
router.use(authenticateUser);

// POST /api/documents — Create new document
router.post('/', async (req, res) => {
    try {
        const { title, content, layout } = req.body;
        const userId = req.user.id;

        const result = await pool.query(
            `INSERT INTO documents (user_id, title, content, layout)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, xss(title || 'Untitled Document'), content ? JSON.stringify(content) : '{}', layout || 'single']
        );

        // Increment editor usage for freemium tracking
        await incrementUsage(userId, 'editor');

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({ error: 'Failed to create document' });
    }
});

// GET /api/documents — List user's documents
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, title, layout, is_saved, created_at, updated_at
             FROM documents
             WHERE user_id = $1 AND is_saved = TRUE
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
        const userId = req.user.id;

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
        const userId = req.user.id;
        const { title, content, layout, is_saved } = req.body;

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

        if (layout !== undefined) {
            updates.push(`layout = $${paramIndex++}`);
            values.push(layout);
        }

        if (is_saved !== undefined) {
            updates.push(`is_saved = $${paramIndex++}`);
            values.push(is_saved);
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
        const userId = req.user.id;

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
