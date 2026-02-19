const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

function setupSecurity(app) {
    // Helmet for secure headers
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    }));

    // CORS - support multiple origins (comma-separated CLIENT_URL)
    const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
        .split(',')
        .map(url => url.trim());
    app.use(cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // General rate limiting
    const generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: { error: 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api/', generalLimiter);

    // Strict rate limiting for auth
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: { error: 'Too many login attempts, please try again later.' },
    });
    app.use('/api/auth/', authLimiter);

    // Strict rate limiting for public submissions
    const submitLimiter = rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5,
        message: { error: 'Too many submissions. Please try again later.' },
    });
    app.use('/api/inquiries', submitLimiter);
    app.use('/api/contact', submitLimiter);
}

module.exports = { setupSecurity };
