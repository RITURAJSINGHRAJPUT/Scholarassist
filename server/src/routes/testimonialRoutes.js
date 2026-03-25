const express = require('express');
const xss = require('xss');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { validateTestimonial, validateUUID, handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// GET /api/testimonials - List published testimonials
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, role, content, rating FROM testimonials WHERE published = true ORDER BY display_order ASC, created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('List testimonials error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== ADMIN ROUTES ====================

// GET /api/testimonials/admin - List all testimonials (admin)
router.get('/admin', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM testimonials ORDER BY display_order ASC, created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Admin list testimonials error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/testimonials/admin - Create testimonial (admin)
router.post('/admin', authenticate, validateTestimonial, async (req, res) => {
    try {
        const { name, role, content, rating, published, display_order } = req.body;

        const result = await pool.query(
            `INSERT INTO testimonials (name, role, content, rating, published, display_order)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [xss(name), role ? xss(role) : null, xss(content), rating || 5, published !== false, display_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create testimonial error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/testimonials/admin/:id - Update testimonial (admin)
router.put('/admin/:id', authenticate, validateUUID('id'), validateTestimonial, async (req, res) => {
    try {
        const { name, role, content, rating, published, display_order } = req.body;

        const result = await pool.query(
            `UPDATE testimonials SET
                name = COALESCE($1, name),
                role = COALESCE($2, role),
                content = COALESCE($3, content),
                rating = COALESCE($4, rating),
                published = COALESCE($5, published),
                display_order = COALESCE($6, display_order)
             WHERE id = $7 RETURNING *`,
            [name ? xss(name) : null, role ? xss(role) : null, content ? xss(content) : null, rating, published, display_order, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update testimonial error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/testimonials/admin/:id - Delete testimonial (admin)
router.delete('/admin/:id', authenticate, validateUUID('id'), handleValidationErrors, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM testimonials WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        console.error('Delete testimonial error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
