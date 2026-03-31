const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const DAILY_FREE_LIMIT = 3;

/**
 * Authenticate public-facing app users via JWT.
 * Sets req.user = { id, name, email, is_premium, subscription_expiry }
 */
async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required. Please login to use this tool.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Must be an app_user token (not admin)
        if (decoded.type !== 'app_user') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        const result = await pool.query(
            'SELECT id, name, email, phone, designation, place_of_work, is_premium, premium_status, requested_plan, subscription_expiry FROM app_users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Check if premium has expired
        if (user.is_premium && user.subscription_expiry && new Date(user.subscription_expiry) < new Date()) {
            await pool.query('UPDATE app_users SET is_premium = false WHERE id = $1', [user.id]);
            user.is_premium = false;
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please login again.' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
}

/**
 * Optional auth — sets req.user if token present, otherwise req.user = null
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'app_user') {
            req.user = null;
            return next();
        }

        const result = await pool.query(
            'SELECT id, name, email, phone, designation, place_of_work, is_premium, premium_status, requested_plan, subscription_expiry FROM app_users WHERE id = $1',
            [decoded.id]
        );

        req.user = result.rows.length > 0 ? result.rows[0] : null;
        next();
    } catch {
        req.user = null;
        next();
    }
}

/**
 * Check daily usage limit for free users.
 * Premium users bypass limits entirely.
 * @param {string} toolName - 'plagiarism' | 'ai_detector' | 'editor'
 */
function checkUsageLimit(toolName) {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Premium users have unlimited access
            if (user.is_premium) {
                return next();
            }

            // Get or create today's usage record
            const today = new Date().toISOString().split('T')[0];
            let usage = await pool.query(
                'SELECT * FROM usage_tracking WHERE user_id = $1 AND usage_date = $2',
                [user.id, today]
            );

            if (usage.rows.length === 0) {
                await pool.query(
                    'INSERT INTO usage_tracking (user_id, usage_date) VALUES ($1, $2)',
                    [user.id, today]
                );
                usage = await pool.query(
                    'SELECT * FROM usage_tracking WHERE user_id = $1 AND usage_date = $2',
                    [user.id, today]
                );
            }

            const record = usage.rows[0];
            const totalUsed = record.plagiarism_count + record.ai_detector_count + record.editor_count;

            if (totalUsed >= DAILY_FREE_LIMIT) {
                return res.status(403).json({
                    error: 'Daily limit reached. Upgrade to Premium for unlimited access.',
                    code: 'USAGE_LIMIT_EXCEEDED',
                    usage: {
                        used: totalUsed,
                        limit: DAILY_FREE_LIMIT,
                        remaining: 0,
                    },
                });
            }

            // Attach usage info for reference
            req.usage = {
                record,
                totalUsed,
                remaining: DAILY_FREE_LIMIT - totalUsed,
                limit: DAILY_FREE_LIMIT,
                toolName,
            };

            next();
        } catch (error) {
            console.error('Usage limit check error:', error);
            next(); // Don't block on error
        }
    };
}

/**
 * Increment usage count after a successful tool action.
 */
async function incrementUsage(userId, toolName) {
    const today = new Date().toISOString().split('T')[0];
    const columnMap = {
        plagiarism: 'plagiarism_count',
        ai_detector: 'ai_detector_count',
        editor: 'editor_count',
    };

    const column = columnMap[toolName];
    if (!column) return;

    try {
        await pool.query(
            `INSERT INTO usage_tracking (user_id, usage_date, ${column})
             VALUES ($1, $2, 1)
             ON CONFLICT (user_id, usage_date)
             DO UPDATE SET ${column} = usage_tracking.${column} + 1`,
            [userId, today]
        );
    } catch (error) {
        console.error('Increment usage error:', error);
    }
}

/**
 * Get today's usage for a user.
 */
async function getUserUsage(userId) {
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
        'SELECT * FROM usage_tracking WHERE user_id = $1 AND usage_date = $2',
        [userId, today]
    );

    if (result.rows.length === 0) {
        return {
            plagiarismCount: 0,
            aiDetectorCount: 0,
            editorCount: 0,
            totalUsed: 0,
            limit: DAILY_FREE_LIMIT,
            remaining: DAILY_FREE_LIMIT,
        };
    }

    const r = result.rows[0];
    const totalUsed = r.plagiarism_count + r.ai_detector_count + r.editor_count;

    return {
        plagiarismCount: r.plagiarism_count,
        aiDetectorCount: r.ai_detector_count,
        editorCount: r.editor_count,
        totalUsed,
        limit: DAILY_FREE_LIMIT,
        remaining: Math.max(0, DAILY_FREE_LIMIT - totalUsed),
    };
}

module.exports = {
    authenticateUser,
    optionalAuth,
    checkUsageLimit,
    incrementUsage,
    getUserUsage,
    DAILY_FREE_LIMIT,
};
