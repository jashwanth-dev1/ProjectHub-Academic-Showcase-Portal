const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected session info
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
