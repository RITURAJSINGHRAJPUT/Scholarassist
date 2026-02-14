const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { logAction } = require('../utils/auditLog');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = result.rows[0];
        const isValid = await bcrypt.compare(password, admin.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        await logAction(admin.id, 'LOGIN', 'admin_users', admin.id, { username: admin.username }, req.ip);

        res.json({
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/seed - One-time admin seed (dev only)
router.post('/seed', async (req, res) => {
    try {
        const existing = await pool.query('SELECT COUNT(*) FROM admin_users');
        if (parseInt(existing.rows[0].count) > 0) {
            return res.status(403).json({ error: 'Admin user already exists' });
        }

        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            'INSERT INTO admin_users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            [username, email, passwordHash, 'admin']
        );

        res.status(201).json({ message: 'Admin user created', admin: result.rows[0] });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
