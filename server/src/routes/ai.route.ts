import { Router } from 'express';
import {
  summarize,
  generateQuiz,
  generateFlashcards,
  qa,
  generateCourseQuiz,
  generateTopicQuiz,
  getHistory,
  getHistoryById,
  deleteHistory,
} from '../controllers/ai.controller';
import { protect } from '../middlewares/auth.middleware';
import {
  validateSummarize,
  validateGenerateQuiz,
  validateGenerateFlashcards,
  validateQA,
  validateCourseQuiz,
  validateTopicQuiz,
} from '../validations/ai.validation';

const router = Router();

// Protect all AI routes
router.use(protect);

// Homepage AI Features
router.post('/summarize', validateSummarize, summarize);
router.post('/generate-quiz', validateGenerateQuiz, generateQuiz);
router.post('/generate-flashcards', validateGenerateFlashcards, generateFlashcards);
router.post('/qa', validateQA, qa);

// Course & Topic Quiz Features
router.post('/courses/:courseId/quiz', validateCourseQuiz, generateCourseQuiz);
router.post('/topics/:topicId/quiz', validateTopicQuiz, generateTopicQuiz);

// Generation History Features
router.get('/history', getHistory);
router.get('/history/:id', getHistoryById);
router.delete('/history/:id', deleteHistory);

export default router;
