const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

// Validation middleware helper
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(e => e.msg || e.message || 'Validation error').join(', ');
    return res.status(400).json({ 
      message: errorMessages,
      errors: errors.array() 
    });
  }
  next();
};

// Public routes
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  handleValidationErrors,
  userController.login
);

// Admin routes
router.post('/create',
  auth,
  adminAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  handleValidationErrors,
  userController.createUser
);

// User routes (must come before /:userId to avoid route conflicts)
router.get('/me', auth, userController.getCurrentUser);

// Admin routes
router.get('/all', auth, adminAuth, userController.getAllUsers);
router.get('/:userId/analytics', auth, adminAuth, userController.getUserAnalytics);
router.get('/:userId', auth, adminAuth, userController.getUserById);
router.put('/:userId',
  auth,
  adminAuth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
  ],
  handleValidationErrors,
  userController.updateUser
);
router.delete('/:userId', auth, adminAuth, userController.deleteUser);

module.exports = router;

