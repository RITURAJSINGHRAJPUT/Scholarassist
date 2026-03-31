const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xss = require('xss');
const pool = require('../config/db');
const { authenticateUser, getUserUsage } = require('../middleware/userAuth');
const { validateUserSignup, validateUserLogin } = require('../middleware/validate');

const router = express.Router();

// POST /api/users/signup
router.post('/signup', validateUserSignup, async (req, res) => {
    try {
        const { name, email, password, phone, designation, place_of_work } = req.body;

        // Check if email already exists
        const existing = await pool.query('SELECT id FROM app_users WHERE email = $1', [email.toLowerCase().trim()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            `INSERT INTO app_users (name, email, password_hash, phone, designation, place_of_work)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, phone, designation, place_of_work, is_premium, premium_status, requested_plan, subscription_expiry, created_at`,
            [xss(name.trim()), email.toLowerCase().trim(), passwordHash, xss(phone?.trim()), xss(designation?.trim()), xss(place_of_work?.trim())]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, email: user.email, type: 'app_user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
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
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/users/login
router.post('/login', validateUserLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email.toLowerCase().trim()]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Check premium expiration
        let isPremium = user.is_premium;
        if (isPremium && user.subscription_expiry && new Date(user.subscription_expiry) < new Date()) {
            await pool.query('UPDATE app_users SET is_premium = false WHERE id = $1', [user.id]);
            isPremium = false;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, type: 'app_user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                designation: user.designation,
                placeOfWork: user.place_of_work,
                isPremium,
                premiumStatus: user.premium_status,
                requestedPlan: user.requested_plan,
                subscriptionExpiry: user.subscription_expiry,
            },
        });
    } catch (error) {
        console.error('Login Route Error:', error.message, error.stack);
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

// GET /api/users/me — Current user profile
router.get('/me', authenticateUser, async (req, res) => {
    try {
        const usage = await getUserUsage(req.user.id);
        res.json({
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                designation: req.user.designation,
                placeOfWork: req.user.place_of_work,
                isPremium: req.user.is_premium,
                premiumStatus: req.user.premium_status,
                requestedPlan: req.user.requested_plan,
                subscriptionExpiry: req.user.subscription_expiry,
            },
            usage,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/users/usage — Today's usage stats
router.get('/usage', authenticateUser, async (req, res) => {
    try {
        const usage = await getUserUsage(req.user.id);
        res.json(usage);
    } catch (error) {
        console.error('Get usage error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/users/upgrade — Simulate premium upgrade request
router.post('/upgrade', authenticateUser, async (req, res) => {
    try {
        const { plan } = req.body; // 'monthly' or 'yearly'

        if (!['monthly', 'yearly'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        await pool.query(
            'UPDATE app_users SET premium_status = $1, requested_plan = $2, updated_at = NOW() WHERE id = $3',
            ['pending', plan, req.user.id]
        );

        res.json({
            message: 'Upgrade request sent! Admin will review and approve shortly.',
            premiumStatus: 'pending',
            requestedPlan: plan,
        });
    } catch (error) {
        console.error('Upgrade error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
