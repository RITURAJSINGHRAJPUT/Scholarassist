const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results and return errors
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
    }
    next();
}

// ==================== REUSABLE VALIDATORS ====================

const validateUUID = (paramName = 'id') =>
    param(paramName)
        .isUUID()
        .withMessage(`${paramName} must be a valid UUID`);

const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Page must be a positive integer')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt(),
];

// ==================== AUTH VALIDATORS ====================

const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be alphanumeric'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6, max: 100 }).withMessage('Password must be 6-100 characters'),
    handleValidationErrors,
];

const validateSeed = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6, max: 100 }).withMessage('Password must be 6-100 characters'),
    handleValidationErrors,
];

// ==================== INQUIRY VALIDATORS ====================

const validateInquiry = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .isLength({ max: 255 }).withMessage('Email too long')
        .normalizeEmail(),
    body('phone')
        .optional({ values: 'falsy' })
        .trim()
        .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Invalid phone number format'),
    body('academic_level')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 }).withMessage('Academic level must be under 100 characters')
        .escape(),
    body('service_type')
        .trim()
        .notEmpty().withMessage('Service type is required')
        .isLength({ max: 100 }).withMessage('Service type must be under 100 characters')
        .escape(),
    body('deadline')
        .optional({ values: 'falsy' })
        .isISO8601().withMessage('Deadline must be a valid date'),
    body('message')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 5000 }).withMessage('Message must be under 5000 characters'),
    handleValidationErrors,
];

const validateInquiryStatus = [
    body('status')
        .trim()
        .notEmpty().withMessage('Status is required')
        .isIn(['new', 'in_progress', 'completed']).withMessage('Invalid status value'),
    handleValidationErrors,
];

// ==================== CONTACT VALIDATORS ====================

const validateContact = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .isLength({ max: 255 }).withMessage('Email too long')
        .normalizeEmail(),
    body('subject')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 200 }).withMessage('Subject must be under 200 characters')
        .escape(),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 5000 }).withMessage('Message must be 10-5000 characters'),
    handleValidationErrors,
];

// ==================== BLOG VALIDATORS ====================

const validateBlogPost = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
    body('content')
        .notEmpty().withMessage('Content is required')
        .isLength({ max: 50000 }).withMessage('Content too long'),
    body('excerpt')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 }).withMessage('Excerpt must be under 500 characters'),
    body('category_id')
        .optional({ values: 'falsy' })
        .isUUID().withMessage('Invalid category ID'),
    body('published')
        .optional()
        .isBoolean().withMessage('Published must be true or false'),
    body('meta_title')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 }).withMessage('Meta title must be under 100 characters'),
    body('meta_description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 300 }).withMessage('Meta description must be under 300 characters'),
    handleValidationErrors,
];

const validateBlogCategory = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
    handleValidationErrors,
];

// ==================== TESTIMONIAL VALIDATORS ====================

const validateTestimonial = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .escape(),
    body('role')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 }).withMessage('Role must be under 100 characters')
        .escape(),
    body('content')
        .trim()
        .notEmpty().withMessage('Content is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
        .toInt(),
    body('published')
        .optional()
        .isBoolean().withMessage('Published must be true or false'),
    body('display_order')
        .optional()
        .isInt({ min: 0, max: 999 }).withMessage('Display order must be 0-999')
        .toInt(),
    handleValidationErrors,
];

module.exports = {
    handleValidationErrors,
    validateUUID,
    validatePagination,
    validateLogin,
    validateSeed,
    validateInquiry,
    validateInquiryStatus,
    validateContact,
    validateBlogPost,
    validateBlogCategory,
    validateTestimonial,
};
