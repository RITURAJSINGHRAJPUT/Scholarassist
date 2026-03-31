const express = require('express');
const bcrypt = require('bcryptjs');
const xss = require('xss');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);

// GET /api/admin/users — List all app users with usage stats
router.get('/', async (req, res) => {
    try {
        const { search, filter, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = '';
        const params = [];
        let paramIndex = 1;

        // Search filter
        if (search) {
            whereClause += ` WHERE (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Premium filter
        if (filter === 'premium') {
            whereClause += whereClause ? ' AND u.is_premium = true' : ' WHERE u.is_premium = true';
        } else if (filter === 'pending') {
            whereClause += whereClause ? " AND u.premium_status = 'pending'" : " WHERE u.premium_status = 'pending'";
        } else if (filter === 'free') {
            whereClause += whereClause ? ' AND u.is_premium = false' : ' WHERE u.is_premium = false';
        }

        // Count total
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM app_users u${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Fetch users with today's usage
        const today = new Date().toISOString().split('T')[0];
        params.push(today, parseInt(limit), offset);

        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.phone, u.designation, u.place_of_work, u.is_premium, u.premium_status, u.requested_plan, u.subscription_expiry, u.created_at, u.updated_at,
                    COALESCE(ut.plagiarism_count, 0) as plagiarism_count,
                    COALESCE(ut.ai_detector_count, 0) as ai_detector_count,
                    COALESCE(ut.editor_count, 0) as editor_count
             FROM app_users u
             LEFT JOIN usage_tracking ut ON u.id = ut.user_id AND ut.usage_date = $${paramIndex}
             ${whereClause}
             ORDER BY u.created_at DESC
             LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
            params
        );

        res.json({
            users: result.rows.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                designation: u.designation,
                placeOfWork: u.place_of_work,
                isPremium: u.is_premium,
                premiumStatus: u.premium_status,
                requestedPlan: u.requested_plan,
                subscriptionExpiry: u.subscription_expiry,
                createdAt: u.created_at,
                updatedAt: u.updated_at,
                todayUsage: {
                    plagiarism: u.plagiarism_count,
                    aiDetector: u.ai_detector_count,
                    editor: u.editor_count,
                    total: u.plagiarism_count + u.ai_detector_count + u.editor_count,
                },
            })),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/admin/users/stats — Aggregate user stats for dashboard
router.get('/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE is_premium = true) as premium_users,
                COUNT(*) FILTER (WHERE is_premium = false) as free_users,
                COUNT(*) FILTER (WHERE premium_status = 'pending') as pending_requests,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week
            FROM app_users
        `);

        res.json(stats.rows[0]);
    } catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/admin/users/:id — Get single user details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, name, email, phone, designation, place_of_work, is_premium, premium_status, requested_plan, subscription_expiry, created_at, updated_at
             FROM app_users WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get usage history (last 7 days)
        const usageResult = await pool.query(
            `SELECT usage_date, plagiarism_count, ai_detector_count, editor_count
             FROM usage_tracking
             WHERE user_id = $1
             ORDER BY usage_date DESC
             LIMIT 7`,
            [id]
        );

        const user = result.rows[0];

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            designation: user.designation,
            placeOfWork: user.place_of_work,
            isPremium: user.is_premium,
            premiumStatus: user.premium_status,
            requestedPlan: user.requested_plan,
            subscriptionExpiry: user.subscription_expiry,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            usageHistory: usageResult.rows,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// POST /api/admin/users — Create a new user (admin action)
router.post('/', async (req, res) => {
    try {
        const { name, email, password, isPremium, phone, designation, placeOfWork } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existing = await pool.query('SELECT id FROM app_users WHERE email = $1', [email.toLowerCase().trim()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        let subscriptionExpiry = null;
        if (isPremium) {
            const expiry = new Date();
            expiry.setFullYear(expiry.getFullYear() + 1);
            subscriptionExpiry = expiry.toISOString();
        }

        const result = await pool.query(
            `INSERT INTO app_users (name, email, password_hash, is_premium, subscription_expiry, phone, designation, place_of_work)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, name, email, phone, designation, place_of_work, is_premium, subscription_expiry, created_at`,
            [xss(name.trim()), email.toLowerCase().trim(), passwordHash, isPremium || false, subscriptionExpiry, xss(phone?.trim()), xss(designation?.trim()), xss(placeOfWork?.trim())]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT /api/admin/users/:id — Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, isPremium, subscriptionExpiry, phone, designation, placeOfWork } = req.body;

        const existing = await pool.query('SELECT id FROM app_users WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check email uniqueness if changed
        if (email) {
            const emailCheck = await pool.query('SELECT id FROM app_users WHERE email = $1 AND id != $2', [email.toLowerCase().trim(), id]);
            if (emailCheck.rows.length > 0) {
                return res.status(409).json({ error: 'Another user with this email already exists.' });
            }
        }

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(xss(name.trim()));
        }
        if (email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            values.push(email.toLowerCase().trim());
        }
        if (password) {
            updates.push(`password_hash = $${paramIndex++}`);
            values.push(await bcrypt.hash(password, 12));
        }
        if (isPremium !== undefined) {
            updates.push(`is_premium = $${paramIndex++}`);
            values.push(isPremium);
        }
        if (subscriptionExpiry !== undefined) {
            updates.push(`subscription_expiry = $${paramIndex++}`);
            values.push(subscriptionExpiry);
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramIndex++}`);
            values.push(xss(phone?.trim()));
        }
        if (designation !== undefined) {
            updates.push(`designation = $${paramIndex++}`);
            values.push(xss(designation?.trim()));
        }
        if (placeOfWork !== undefined) {
            updates.push(`place_of_work = $${paramIndex++}`);
            values.push(xss(placeOfWork?.trim()));
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const result = await pool.query(
            `UPDATE app_users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, phone, designation, place_of_work, is_premium, subscription_expiry, created_at, updated_at`,
            values
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/admin/users/:id — Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM app_users WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// PATCH /api/admin/users/:id/toggle-premium — Toggle premium status
router.patch('/:id/toggle-premium', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await pool.query('SELECT is_premium FROM app_users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newPremium = !user.rows[0].is_premium;
        let expiry = null;
        if (newPremium) {
            const exp = new Date();
            exp.setFullYear(exp.getFullYear() + 1);
            expiry = exp.toISOString();
        }

        const result = await pool.query(
            'UPDATE app_users SET is_premium = $1, subscription_expiry = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, is_premium, subscription_expiry',
            [newPremium, expiry, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Toggle premium error:', error);
        res.status(500).json({ error: 'Failed to toggle premium' });
    }
});

// PATCH /api/admin/users/:id/update-premium-status — Approve/Reject premium request
router.patch('/:id/update-premium-status', async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' or 'reject'

        const user = await pool.query('SELECT requested_plan FROM app_users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (action === 'approve') {
            const plan = user.rows[0].requested_plan || 'monthly';
            const expiry = new Date();
            if (plan === 'yearly') {
                expiry.setFullYear(expiry.getFullYear() + 1);
            } else {
                expiry.setMonth(expiry.getMonth() + 1);
            }

            await pool.query(
                `UPDATE app_users 
                 SET is_premium = true, premium_status = 'approved', subscription_expiry = $1, updated_at = NOW() 
                 WHERE id = $2`,
                [expiry.toISOString(), id]
            );

            return res.json({ message: 'Premium request approved successfully' });
        } else if (action === 'reject') {
            await pool.query(
                `UPDATE app_users 
                 SET premium_status = 'rejected', requested_plan = NULL, updated_at = NOW() 
                 WHERE id = $1`,
                [id]
            );
            return res.json({ message: 'Premium request rejected' });
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Update premium status error:', error);
        res.status(500).json({ error: 'Failed to update premium status' });
    }
});

module.exports = router;
