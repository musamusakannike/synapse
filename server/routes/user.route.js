const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { getCurrentUser, updatePushToken } = require('../controllers/user.controller');

const router = express.Router();

// GET /api/users/me - Get current user profile (protected route)
router.get('/me', authenticate, getCurrentUser);

// PUT /api/users/push-token - Update Expo push token (protected route)
router.put('/push-token', authenticate, updatePushToken);

module.exports = router;
