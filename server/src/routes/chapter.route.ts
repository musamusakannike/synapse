import { Router } from 'express';
import { getChaptersByCourse, createChapter, updateChapter, deleteChapter } from '../controllers/chapter.controller';
import { protect, optionalAuth, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

router.get('/course/:courseId', optionalAuth, getChaptersByCourse);
router.post('/', protect, adminOnly, createChapter);
router.put('/:id', protect, adminOnly, updateChapter);
router.delete('/:id', protect, adminOnly, deleteChapter);

export default router;
