const express = require('express');
const xss = require('xss');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/templates — List active templates (Public)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, icon, content, layout, sections, category 
             FROM editor_templates 
             WHERE is_active = true 
             ORDER BY display_order ASC, created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('List active templates error:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Admin-only routes below
router.use(authenticate);

// GET /api/templates/admin — List all templates (Admin)
router.get('/admin', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM editor_templates 
             ORDER BY display_order ASC, created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Admin list templates error:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// GET /api/templates/admin/:id — Get single template (Admin)
router.get('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM editor_templates WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get template error:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// POST /api/templates/admin — Create template (Admin)
router.post('/admin', async (req, res) => {
    try {
        const { title, description, icon, content, layout, sections, category, display_order } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const result = await pool.query(
            `INSERT INTO editor_templates (title, description, icon, content, layout, sections, category, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                xss(title), 
                xss(description || ''), 
                xss(icon || 'academic'), 
                typeof content === 'string' ? JSON.parse(content) : content, 
                layout || 'single', 
                sections || [], 
                xss(category || 'General'), 
                display_order || 0
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// PUT /api/templates/admin/:id — Update template (Admin)
router.put('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, icon, content, layout, sections, category, display_order, is_active } = req.body;

        const result = await pool.query(
            `UPDATE editor_templates 
             SET title = $1, description = $2, icon = $3, content = $4, layout = $5, 
                 sections = $6, category = $7, display_order = $8, is_active = $9, updated_at = NOW()
             WHERE id = $10 
             RETURNING *`,
            [
                xss(title), 
                xss(description), 
                xss(icon), 
                typeof content === 'string' ? JSON.parse(content) : content, 
                layout, 
                sections, 
                xss(category), 
                display_order, 
                is_active, 
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// PATCH /api/templates/admin/:id/toggle — Toggle active status (Admin)
router.patch('/admin/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE editor_templates SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Toggle template error:', error);
        res.status(500).json({ error: 'Failed to toggle status' });
    }
});

// DELETE /api/templates/admin/:id — Delete template (Admin)
router.delete('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM editor_templates WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

module.exports = router;
