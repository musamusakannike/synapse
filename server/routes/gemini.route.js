import express from 'express';
import { getGeminiReply } from '../controllers/gemini.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, getGeminiReply);

export default router;
