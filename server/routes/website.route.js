import express from 'express';
import { generateWebsite, createPreview, servePreview } from '../controllers/website.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/generate', authMiddleware, generateWebsite);
router.post('/preview', createPreview);
router.get('/serve/:previewId', servePreview);

export default router;
