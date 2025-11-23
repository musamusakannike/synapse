const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { getCurrentUser } = require('../controllers/user.controller');

const router = express.Router();

// GET /api/users/me - Get current user profile (protected route)
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
