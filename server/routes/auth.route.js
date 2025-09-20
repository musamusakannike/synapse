const express = require('express');
const { signUp, signIn, signOut, getCurrentUser } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', authMiddleware, signOut);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;