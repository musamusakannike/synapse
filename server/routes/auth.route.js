import express from 'express';
import { signUp, signIn, signOut, getCurrentUser } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', authMiddleware, signOut);
router.get('/me', authMiddleware, getCurrentUser);

export default router;