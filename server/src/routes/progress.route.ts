import { Router } from 'express';
import {
  getDashboard,
  getProgress,
  getContinueStudying,
  getNeedsImprovement,
  submitFlashcardSession,
  submitMcqSession,
  updateContentPosition,
  getCourseProgress,
  getTopicProgress,
  getDashboardResumption,
  completeTopic,
  submitExercise,
  savePosition,
} from '../controllers/progress.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateFlashcardSession, validateMcqSession, validateContentPosition } from '../validations/progress.validation';

const router = Router();

router.get('/', protect, getDashboard);
router.get('/dashboard-resumption', protect, getDashboardResumption);
router.get('/stats', protect, getProgress);
router.get('/continue', protect, getContinueStudying);
router.get('/needs-improvement', protect, getNeedsImprovement);
router.get('/course/:courseId', protect, getCourseProgress);
router.get('/topic/:topicId', protect, getTopicProgress);
router.post('/topic-complete', protect, completeTopic);
router.post('/exercise-submit', protect, submitExercise);
router.post('/save-position', protect, savePosition);
router.post('/flashcard-session', protect, validateFlashcardSession, submitFlashcardSession);
router.post('/mcq-session', protect, validateMcqSession, submitMcqSession);
router.post('/content-position', protect, validateContentPosition, updateContentPosition);

export default router;
