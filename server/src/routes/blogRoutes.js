const express = require('express');
const xss = require('xss');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');
const upload = require('../middleware/upload');

const router = express.Router();

// Ensure blog images directory exists
const blogImagesDir = path.join(process.env.UPLOAD_DIR || './uploads', 'blog');
if (!fs.existsSync(blogImagesDir)) {
    fs.mkdirSync(blogImagesDir, { recursive: true });
}

// Helper: generate slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// ==================== PUBLIC ROUTES ====================

// GET /api/blog/posts - List published posts
router.get('/posts', async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        let query = `
      SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.featured_image, bp.meta_title, bp.meta_description, bp.created_at,
        bc.name as category_name, bc.slug as category_slug,
        au.username as author
      FROM blog_posts bp
      LEFT JOIN blog_categories bc ON bp.category_id = bc.id
      LEFT JOIN admin_users au ON bp.author_id = au.id
      WHERE bp.published = true
    `;
        const params = [];

        if (category) {
            query += ` AND bc.slug = $${params.length + 1}`;
            params.push(category);
        }

        query += ` ORDER BY bp.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        let countQuery = 'SELECT COUNT(*) FROM blog_posts WHERE published = true';
        const countParams = [];
        if (category) {
            countQuery += ' AND category_id = (SELECT id FROM blog_categories WHERE slug = $1)';
            countParams.push(category);
        }
        const countResult = await pool.query(countQuery, countParams);

        res.json({
            posts: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            totalPages: Math.ceil(countResult.rows[0].count / limit),
        });
    } catch (error) {
        console.error('List posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/blog/posts/:slug - Get single post by slug
router.get('/posts/:slug', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT bp.*, bc.name as category_name, bc.slug as category_slug, au.username as author
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bp.category_id = bc.id
       LEFT JOIN admin_users au ON bp.author_id = au.id
       WHERE bp.slug = $1 AND bp.published = true`,
            [req.params.slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/blog/categories - List categories
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT bc.*, COUNT(bp.id) as post_count 
       FROM blog_categories bc 
       LEFT JOIN blog_posts bp ON bp.category_id = bc.id AND bp.published = true
       GROUP BY bc.id ORDER BY bc.name`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('List categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== ADMIN ROUTES ====================

// GET /api/blog/admin/posts - List all posts (admin)
router.get('/admin/posts', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT bp.*, bc.name as category_name, au.username as author
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bp.category_id = bc.id
       LEFT JOIN admin_users au ON bp.author_id = au.id
       ORDER BY bp.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Admin list posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/blog/admin/posts - Create post (admin)
router.post('/admin/posts', authenticate, async (req, res) => {
    try {
        const { title, content, excerpt, category_id, published, featured_image, meta_title, meta_description } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const slug = generateSlug(title);
        const result = await pool.query(
            `INSERT INTO blog_posts (title, slug, content, excerpt, category_id, author_id, published, featured_image, meta_title, meta_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [xss(title), slug, content, excerpt ? xss(excerpt) : null, category_id || null, req.admin.id, published || false, featured_image || null, meta_title ? xss(meta_title) : null, meta_description ? xss(meta_description) : null]
        );

        await logAction(req.admin.id, 'CREATE', 'blog_posts', result.rows[0].id, { title }, req.ip);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/blog/admin/posts/:id - Update post (admin)
router.put('/admin/posts/:id', authenticate, async (req, res) => {
    try {
        const { title, content, excerpt, category_id, published, featured_image, meta_title, meta_description } = req.body;
        const slug = title ? generateSlug(title) : undefined;

        const result = await pool.query(
            `UPDATE blog_posts SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        content = COALESCE($3, content),
        excerpt = COALESCE($4, excerpt),
        category_id = $5,
        published = COALESCE($6, published),
        featured_image = COALESCE($7, featured_image),
        meta_title = COALESCE($8, meta_title),
        meta_description = COALESCE($9, meta_description),
        updated_at = NOW()
       WHERE id = $10 RETURNING *`,
            [title ? xss(title) : null, slug, content, excerpt ? xss(excerpt) : null, category_id || null, published, featured_image, meta_title ? xss(meta_title) : null, meta_description ? xss(meta_description) : null, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        await logAction(req.admin.id, 'UPDATE', 'blog_posts', req.params.id, { title }, req.ip);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/blog/admin/posts/:id - Delete post (admin)
router.delete('/admin/posts/:id', authenticate, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id, title', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        await logAction(req.admin.id, 'DELETE', 'blog_posts', req.params.id, { title: result.rows[0].title }, req.ip);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/blog/admin/categories - Create category (admin)
router.post('/admin/categories', authenticate, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'Category name is required' });
        const slug = generateSlug(name);

        const result = await pool.query(
            'INSERT INTO blog_categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
            [xss(name), slug, description ? xss(description) : null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/blog/admin/categories/:id - Delete category (admin)
router.delete('/admin/categories/:id', authenticate, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM blog_categories WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/blog/admin/upload-image - Upload blog image (admin)
router.post('/admin/upload-image', authenticate, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Only JPEG, PNG, GIF, and WebP images are allowed' });
        }

        const ext = path.extname(req.file.originalname) || '.jpg';
        const uniqueName = `${crypto.randomUUID()}${ext}`;
        const filePath = path.join(blogImagesDir, uniqueName);

        fs.writeFileSync(filePath, req.file.buffer);

        const imageUrl = `/uploads/blog/${uniqueName}`;
        res.json({ url: imageUrl });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

module.exports = router;
