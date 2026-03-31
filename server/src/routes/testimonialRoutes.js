const express = require('express');
const xss = require('xss');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { authenticateUser } = require('../middleware/userAuth');
const { 
    validateTestimonial, 
    validateUserTestimonial, 
    validateUUID, 
    handleValidationErrors 
} = require('../middleware/validate');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// GET /api/testimonials - List approved testimonials
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                t.id, 
                t.name, 
                COALESCE(NULLIF(t.role, ''), NULLIF(u.designation, '')) as role, 
                COALESCE(NULLIF(u.place_of_work, ''), 'ScholarAssist') as workspace,
                u.premium_status,
                t.content, 
                t.rating 
             FROM testimonials t
             LEFT JOIN app_users u ON t.user_id = u.id
             WHERE t.status = 'approved' AND t.published = true 
             ORDER BY t.display_order ASC, t.created_at DESC`
        );
        console.log('Testimonial Join Result:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Testimonial Fetch Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== USER AUTH ROUTES ====================

// GET /api/testimonials/my - Get current user's testimonial
router.get('/my', authenticateUser, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM testimonials WHERE user_id = $1',
            [req.user.id]
        );
        res.json(result.rows[0] || null);
    } catch (error) {
        console.error('Get my testimonial error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/testimonials/submit - Submit testimonial (user)
router.post('/submit', authenticateUser, validateUserTestimonial, async (req, res) => {
    try {
        const { content, rating } = req.body;
        const name = req.user.name;

        // Check if user already submitted
        const existing = await pool.query('SELECT id FROM testimonials WHERE user_id = $1', [req.user.id]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'You have already submitted a testimonial. Use update to modify it.' });
        }

        const result = await pool.query(
            `INSERT INTO testimonials (user_id, name, content, rating, status, published)
             VALUES ($1, $2, $3, $4, 'pending', true) RETURNING *`,
            [req.user.id, name, xss(content), rating]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Submit testimonial error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/testimonials/my - Update own testimonial (user)
router.put('/my', authenticateUser, validateUserTestimonial, async (req, res) => {
    try {
        const { content, rating } = req.body;

        const result = await pool.query(
            `UPDATE testimonials 
             SET content = $1, rating = $2, status = 'pending', updated_at = NOW(), approved_at = NULL
             WHERE user_id = $3 RETURNING *`,
            [xss(content), rating, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update my testimonial error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== ADMIN ROUTES ====================

// GET /api/testimonials/admin - List all testimonials (admin)
router.get('/admin', authenticate, async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM testimonials';
        const params = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY display_order ASC, created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Admin list testimonials error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/testimonials/admin - Create testimonial (admin-forced)
router.post('/admin', authenticate, validateTestimonial, async (req, res) => {
    try {
        const { name, role, content, rating, published, display_order, status } = req.body;

        const result = await pool.query(
            `INSERT INTO testimonials (name, role, content, rating, published, display_order, status, approved_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
                xss(name), 
                role ? xss(role) : null, 
                xss(content), 
                rating || 5, 
                published !== false, 
                display_order || 0,
                status || 'approved',
                (status === 'approved' || !status) ? new Date() : null
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create testimonial admin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/testimonials/admin/:id/status - Update status (approve/reject)
router.patch('/admin/:id/status', authenticate, validateUUID('id'), handleValidationErrors, async (req, res) => {
    try {
        const { status } = req.body; // 'approved' | 'rejected' | 'pending'
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const approved_at = status === 'approved' ? new Date() : null;

        const result = await pool.query(
            'UPDATE testimonials SET status = $1, approved_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [status, approved_at, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update testimonial status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/testimonials/admin/:id - Update testimonial (admin)
router.put('/admin/:id', authenticate, validateUUID('id'), validateTestimonial, async (req, res) => {
    try {
        const { name, role, content, rating, published, display_order, status } = req.body;

        const result = await pool.query(
            `UPDATE testimonials SET
                name = COALESCE($1, name),
                role = COALESCE($2, role),
                content = COALESCE($3, content),
                rating = COALESCE($4, rating),
                published = COALESCE($5, published),
                display_order = COALESCE($6, display_order),
                status = COALESCE($7, status),
                updated_at = NOW()
             WHERE id = $8 RETURNING *`,
            [
                name ? xss(name) : null, 
                role ? xss(role) : null, 
                content ? xss(content) : null, 
                rating, 
                published, 
                display_order,
                status,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update testimonial admin error:', error);
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
