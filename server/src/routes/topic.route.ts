import { Router } from 'express';
import { getTopicsByCourse, getTopicById, createTopic, updateTopic, deleteTopic, reorderTopics } from '../controllers/topic.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { requireCourseAccess, resolveCourseIdFromTopicParam } from '../middlewares/access.middleware';
import { validateCreateTopic, validateUpdateTopic } from '../validations/topic.validation';

const router = Router();

// Topic titles stay visible even for locked courses (acts as a preview/marketing list);
// the full topic (its lesson `contents`) is the actual paid material, so that's gated.
router.get('/course/:courseId', getTopicsByCourse);
router.get('/:id', protect, requireCourseAccess(resolveCourseIdFromTopicParam('id')), getTopicById);
router.post('/', protect, authorize('admin'), validateCreateTopic, createTopic);
router.put('/reorder', protect, authorize('admin'), reorderTopics);
router.put('/:id', protect, authorize('admin'), validateUpdateTopic, updateTopic);
router.delete('/:id', protect, authorize('admin'), deleteTopic);

export default router;
