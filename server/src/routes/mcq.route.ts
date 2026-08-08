import { Router } from 'express';
import { getMcqsByTopic, createMcq, updateMcq, deleteMcq, bulkCreateMcqs } from '../controllers/mcq.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { requireCourseAccess, resolveCourseIdFromTopicParam } from '../middlewares/access.middleware';
import { validateCreateMcq, validateUpdateMcq, validateBulkCreateMcqs } from '../validations/mcq.validation';

const router = Router();

router.get('/topic/:topicId', protect, requireCourseAccess(resolveCourseIdFromTopicParam('topicId')), getMcqsByTopic);
router.post('/', protect, authorize('admin'), validateCreateMcq, createMcq);
router.post('/bulk', protect, authorize('admin'), validateBulkCreateMcqs, bulkCreateMcqs);
router.put('/:id', protect, authorize('admin'), validateUpdateMcq, updateMcq);
router.delete('/:id', protect, authorize('admin'), deleteMcq);

export default router;
