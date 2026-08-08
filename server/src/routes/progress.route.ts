import { Router } from 'express';
import { getDashboard, getProgress, getContinueStudying, getNeedsImprovement, submitFlashcardSession, submitMcqSession } from '../controllers/progress.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateFlashcardSession, validateMcqSession } from '../validations/progress.validation';

const router = Router();

router.get('/', protect, getDashboard);
router.get('/stats', protect, getProgress);
router.get('/continue', protect, getContinueStudying);
router.get('/needs-improvement', protect, getNeedsImprovement);
router.post('/flashcard-session', protect, validateFlashcardSession, submitFlashcardSession);
router.post('/mcq-session', protect, validateMcqSession, submitMcqSession);

export default router;
