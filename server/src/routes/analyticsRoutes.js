const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard - Admin dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
    try {
        // Total inquiries by status
        const statusResult = await pool.query(
            `SELECT status, COUNT(*) as count FROM inquiries GROUP BY status`
        );
        const statusCounts = { new: 0, in_progress: 0, completed: 0 };
        statusResult.rows.forEach(row => { statusCounts[row.status] = parseInt(row.count); });

        // Total inquiries
        const totalInquiries = Object.values(statusCounts).reduce((a, b) => a + b, 0);

        // Inquiries by service type
        const serviceResult = await pool.query(
            `SELECT service_type, COUNT(*) as count FROM inquiries GROUP BY service_type ORDER BY count DESC`
        );

        // Recent inquiries (last 7 days count)
        const recentResult = await pool.query(
            `SELECT COUNT(*) as count FROM inquiries WHERE created_at >= NOW() - INTERVAL '7 days'`
        );

        // Monthly trend (last 6 months)
        const trendResult = await pool.query(
            `SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
       FROM inquiries
       WHERE created_at >= NOW() - INTERVAL '6 months'
       GROUP BY month ORDER BY month`
        );

        // Blog stats
        const blogResult = await pool.query(
            `SELECT COUNT(*) FILTER (WHERE published = true) as published, COUNT(*) FILTER (WHERE published = false) as drafts FROM blog_posts`
        );

        // Contact messages
        const contactResult = await pool.query(
            `SELECT COUNT(*) FILTER (WHERE read = false) as unread, COUNT(*) as total FROM contact_messages`
        );

        // Recent inquiries list
        const recentInquiries = await pool.query(
            `SELECT i.id, u.name, u.email, i.service_type, i.status, i.created_at
       FROM inquiries i JOIN users u ON i.user_id = u.id
       ORDER BY i.created_at DESC LIMIT 5`
        );

        res.json({
            totalInquiries,
            statusCounts,
            serviceBreakdown: serviceResult.rows,
            recentCount: parseInt(recentResult.rows[0].count),
            monthlyTrend: trendResult.rows,
            blog: blogResult.rows[0] || { published: 0, drafts: 0 },
            contacts: contactResult.rows[0] || { unread: 0, total: 0 },
            recentInquiries: recentInquiries.rows,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
