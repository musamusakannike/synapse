import { Router } from 'express';
import { getFlashcardsByTopic, createFlashcard, updateFlashcard, deleteFlashcard, bulkCreateFlashcards } from '../controllers/flashcard.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateCreateFlashcard, validateUpdateFlashcard, validateBulkCreateFlashcards } from '../validations/flashcard.validation';

const router = Router();

router.get('/topic/:topicId', protect, getFlashcardsByTopic);
router.post('/', protect, authorize('admin'), validateCreateFlashcard, createFlashcard);
router.post('/bulk', protect, authorize('admin'), validateBulkCreateFlashcards, bulkCreateFlashcards);
router.put('/:id', protect, authorize('admin'), validateUpdateFlashcard, updateFlashcard);
router.delete('/:id', protect, authorize('admin'), deleteFlashcard);

export default router;
