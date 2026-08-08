import { Router } from 'express';
import { getTopicsByCourse, getTopicById, createTopic, updateTopic, deleteTopic, reorderTopics } from '../controllers/topic.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateCreateTopic, validateUpdateTopic } from '../validations/topic.validation';

const router = Router();

router.get('/course/:courseId', getTopicsByCourse);
router.get('/:id', getTopicById);
router.post('/', protect, authorize('admin'), validateCreateTopic, createTopic);
router.put('/reorder', protect, authorize('admin'), reorderTopics);
router.put('/:id', protect, authorize('admin'), validateUpdateTopic, updateTopic);
router.delete('/:id', protect, authorize('admin'), deleteTopic);

export default router;
